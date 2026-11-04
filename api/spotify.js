
let cachedAccessToken = null;
let tokenExpiresAt = 0;
let recentTrackCache = null;
let recentTrackFetchedAt = 0;
let recentTrackRetryAt = 0;

async function getSpotifyAccessToken() {
    // Reuse the token while it is valid.
    if (
        cachedAccessToken &&
        Date.now() < tokenExpiresAt - 60000
    ) {
        return cachedAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Spotify environment variables are missing.");
    }

    const credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString("base64");

    const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Spotify refresh error:", data);
        throw new Error("Unable to refresh Spotify access token.");
    }

    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return cachedAccessToken;
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const accessToken = await getSpotifyAccessToken();

        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        // Check whether a track is currently playing.
        const currentResponse = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            { headers }
        );

        let track = null;
        let isPlaying = false;
        let playedAt = null;

        if (currentResponse.status === 200) {
            const currentData = await currentResponse.json();

            if (
                currentData.is_playing &&
                currentData.item &&
                currentData.item.type === "track"
            ) {
                track = currentData.item;
                isPlaying = true;
            }
        } else if (
            currentResponse.status !== 204 &&
            !currentResponse.ok
        ) {
            throw new Error(
                `Spotify playback request failed: ${currentResponse.status}`
            );
        }

        // If nothing is playing, use cached listening history first.
        if (!track) {
            const now = Date.now();
            const cacheIsFresh = now - recentTrackFetchedAt < 60000;

            if (cacheIsFresh) {
                track = recentTrackCache;
            } else if (now >= recentTrackRetryAt) {
                const recentResponse = await fetch(
                    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
                    { headers }
                );

                if (recentResponse.status === 429) {
                    const retryAfter = Number(
                        recentResponse.headers.get("Retry-After") || 60
                    );

                    recentTrackRetryAt = now + retryAfter * 1000;

                    console.warn(
                        `[Spotify] Rate limited. Retrying after ${retryAfter} seconds.`
                    );

                    track = recentTrackCache;
                } else if (!recentResponse.ok) {
                    throw new Error(
                        `Spotify history request failed: ${recentResponse.status}`
                    );
                } else {
                    const recentData = await recentResponse.json();
                    const recentItem = recentData.items?.[0];

                    recentTrackCache = recentItem?.track || null;
                    recentTrackFetchedAt = now;
                    recentTrackRetryAt = 0;

                    track = recentTrackCache;

                    if (recentItem) {
                        playedAt = recentItem.played_at;
                    }
                }
            } else {
                track = recentTrackCache;
            }
        }

        // Return only the track information needed by the website.
        const publicTrack = track
            ? {
                name: track.name,
                artists: track.artists?.map(artist => ({
                    name: artist.name
                })) || [],
                album: {
                    images: track.album?.images || []
                },
                external_urls: {
                    spotify: track.external_urls?.spotify || null
                }
            }
            : null;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=15, stale-while-revalidate=30"
        );

        return res.status(200).json({
            track: publicTrack,
            isPlaying,
            playedAt
        });

    } catch (error) {
        console.error("Spotify API error:", error);

        return res.status(500).json({
            error: "Unable to fetch Spotify activity"
        });
    }
}

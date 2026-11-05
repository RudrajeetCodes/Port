
let cachedAccessToken = null;
let tokenExpiresAt = 0;

const CACHE_KEY = "spotify:last-played";
const LOCK_KEY = "spotify:recently-played:lock";

// =================================
// REDIS
// =================================

async function redisCommand(command) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        throw new Error("Redis environment variables are missing.");
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || "Redis request failed.");
    }

    return data.result;
}

// =================================
// SPOTIFY ACCESS TOKEN
// =================================

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

// =================================
// SPOTIFY API HANDLER
// =================================

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

        // =================================
        // CURRENTLY PLAYING
        // =================================

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

                // Persist the currently playing track for Last Played fallback.
                try {
                    const currentHistory = {
                        track: currentData.item,
                        playedAt: new Date(
                            currentData.timestamp || Date.now()
                        ).toISOString()
                    };

                    await redisCommand([
                        "SET",
                        CACHE_KEY,
                        JSON.stringify(currentHistory)
                    ]);

                } catch (cacheError) {
                    console.error(
                        "[Spotify] Unable to cache currently playing track:",
                        cacheError
                    );
                }
            }
        } else if (
            currentResponse.status !== 204 &&
            !currentResponse.ok
        ) {
            throw new Error(
                `Spotify playback request failed: ${currentResponse.status}`
            );
        }

        // =================================
        // LAST PLAYED - REDIS CACHE
        // =================================

        if (!track) {
            try {
                // Retrieve the last successful track.
                const cachedValue = await redisCommand([
                    "GET",
                    CACHE_KEY
                ]);

                const cachedHistory = cachedValue
                    ? JSON.parse(cachedValue)
                    : null;

                track = cachedHistory?.track || null;
                playedAt = cachedHistory?.playedAt || null;

                // Allow only one history request per minute globally.
                const lock = await redisCommand([
                    "SET",
                    LOCK_KEY,
                    "1",
                    "EX",
                    "60",
                    "NX"
                ]);

                if (lock === "OK") {
                    let keepLock = false;

                    try {
                        const recentResponse = await fetch(
                            "https://api.spotify.com/v1/me/player/recently-played?limit=1",
                            { headers }
                        );

                        if (recentResponse.status === 429) {
                            const retryAfterHeader =
                                recentResponse.headers.get("Retry-After");

                            const parsedRetryAfter = Number(retryAfterHeader);

                            const retryAfter = Number.isFinite(parsedRetryAfter)
                                ? Math.max(1, parsedRetryAfter)
                                : 60;

                            // Respect Spotify's rate limit globally.
                            await redisCommand([
                                "SET",
                                LOCK_KEY,
                                "1",
                                "EX",
                                retryAfter
                            ]);

                            keepLock = true;

                            console.warn(
                                `[Spotify] Rate limited. Retrying after ${retryAfter} seconds.`
                            );
                        } else if (!recentResponse.ok) {
                            throw new Error(
                                `Spotify history request failed: ${recentResponse.status}`
                            );
                        } else {
                            const recentData = await recentResponse.json();
                            const recentItem = recentData.items?.[0];

                            if (recentItem?.track) {
                                const newHistory = {
                                    track: recentItem.track,
                                    playedAt: recentItem.played_at
                                };

                                // Save the last played track persistently.
                                await redisCommand([
                                    "SET",
                                    CACHE_KEY,
                                    JSON.stringify(newHistory)
                                ]);

                                track = newHistory.track;
                                playedAt = newHistory.playedAt;
                            }

                            // Keep the lock for 60 seconds after a
                            // successful history request.
                            keepLock = true;
                        }
                    } finally {
                        // Release the lock immediately on other failures.
                        if (!keepLock) {
                            await redisCommand([
                                "DEL",
                                LOCK_KEY
                            ]);
                        }
                    }
                }
            } catch (redisError) {
                // Redis/history failure must not affect currently playing.
                console.error(
                    "[Spotify] Redis/history error:",
                    redisError
                );
            }
        }

        // =================================
        // PUBLIC TRACK RESPONSE
        // =================================

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
        console.error("[Spotify] API error:", error);

        return res.status(500).json({
            error: "Unable to fetch Spotify activity"
        });
    }
}

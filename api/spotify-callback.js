
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).send("Spotify credentials are not configured.");
    }

    const { code, state, error } = req.query;

    const cookies = Object.fromEntries(
        (req.headers.cookie || "")
            .split(";")
            .map(cookie => cookie.trim())
            .filter(Boolean)
            .map(cookie => {
                const separator = cookie.indexOf("=");
                return [
                    cookie.slice(0, separator),
                    decodeURIComponent(cookie.slice(separator + 1))
                ];
            })
    );

    const savedState = cookies.spotify_oauth_state;

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Set-Cookie",
        "spotify_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/spotify-callback; Max-Age=0"
    );

    if (error) {
        return res.status(400).send("Spotify authorization was denied.");
    }

    if (!code || !state || !savedState || state !== savedState) {
        return res.status(400).send("Invalid Spotify authorization state.");
    }

    try {
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
                    grant_type: "authorization_code",
                    code,
                    redirect_uri:
                        "https://port-two-kohl.vercel.app/api/spotify-callback"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Spotify token exchange failed:", data);

            return res.status(502).send(
                "Unable to complete Spotify authorization."
            );
        }

        if (!data.refresh_token) {
            return res.status(502).send(
                "Spotify did not return a refresh token. Please authorize again."
            );
        }

        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        return res.status(200).send(
            `Spotify connected successfully!\n\n` +
            `Your refresh token is:\n\n${data.refresh_token}\n\n` +
            `Copy this token into Vercel as SPOTIFY_REFRESH_TOKEN.\n` +
            `Keep it private. Do not share it.`
        );

    } catch (err) {
        console.error("Spotify callback error:", err);

        return res.status(500).send("Internal server error.");
    }
}

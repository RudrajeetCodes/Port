
import { randomBytes } from "node:crypto";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;

    if (!clientId) {
        return res.status(500).json({
            error: "Spotify Client ID is not configured"
        });
    }

    const redirectUri =
        "https://port-two-kohl.vercel.app/api/spotify-callback";

    const state = randomBytes(32).toString("hex");

    // Store state in a short-lived, HTTP-only cookie.
    res.setHeader("Set-Cookie",
        `spotify_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/spotify-callback; Max-Age=600`
    );

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "user-read-currently-playing user-read-recently-played",
        state
    });

    const authorizationUrl =
        `https://accounts.spotify.com/authorize?${params.toString()}`;

    res.setHeader("Cache-Control", "no-store");

    return res.redirect(302, authorizationUrl);
}

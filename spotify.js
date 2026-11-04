
(() => {
    // =================================
    // SPOTIFY CONFIGURATION
    // =================================

    const CLIENT_ID = "7c27bec7306f43f1a1f006c9ceb1a687";

    const REDIRECT_URI = "http://127.0.0.1:5500/callback.html";

    const SCOPES = "user-read-currently-playing user-read-recently-played";

    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
    const CURRENT_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
    const RECENT_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played";

    const STORAGE = {
        verifier: "spotify_code_verifier",
        state: "spotify_auth_state",
        accessToken: "spotify_access_token",
        refreshToken: "spotify_refresh_token",
        expiresAt: "spotify_token_expires_at"
    };


    // =================================
    // PKCE HELPERS
    // =================================

    function generateRandomString(length) {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        const values = crypto.getRandomValues(new Uint8Array(length));

        return Array.from(values)
            .map(value => characters[value % characters.length])
            .join("");
    }

    async function generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);

        const digest = await crypto.subtle.digest("SHA-256", data);

        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }


    // =================================
    // SPOTIFY LOGIN
    // =================================

    async function login() {
        const verifier = generateRandomString(64);
        const state = generateRandomString(32);

        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem(STORAGE.verifier, verifier);
        localStorage.setItem(STORAGE.state, state);

        const params = {
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: REDIRECT_URI,
            scope: SCOPES,
            state,
            code_challenge_method: "S256",
            code_challenge: challenge
        };

        const authorizationURL = new URL(AUTH_ENDPOINT);
        authorizationURL.search = new URLSearchParams(params).toString();

        window.location.href = authorizationURL.toString();
    }


    // =================================
    // TOKEN STORAGE
    // =================================

    function saveTokens(data) {
        localStorage.setItem(STORAGE.accessToken, data.access_token);

        if (data.refresh_token) {
            localStorage.setItem(STORAGE.refreshToken, data.refresh_token);
        }

        const expiresAt = Date.now() + (data.expires_in * 1000);

        localStorage.setItem(STORAGE.expiresAt, expiresAt.toString());
    }


    // =================================
    // TOKEN EXCHANGE
    // =================================

    async function exchangeCode(code) {
        const verifier = localStorage.getItem(STORAGE.verifier);

        if (!verifier) {
            throw new Error("Spotify code verifier is missing. Please reconnect.");
        }

        const response = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                code_verifier: verifier
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || "Spotify token exchange failed.");
        }

        saveTokens(data);

        localStorage.removeItem(STORAGE.verifier);
        localStorage.removeItem(STORAGE.state);
    }


    // =================================
    // REFRESH ACCESS TOKEN
    // =================================

    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem(STORAGE.refreshToken);

        if (!refreshToken) {
            return false;
        }

        const response = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Spotify] Token refresh failed:", data);
            clearTokens();
            return false;
        }

        saveTokens(data);

        return true;
    }


    // =================================
    // TOKEN MANAGEMENT
    // =================================

    function clearTokens() {
        localStorage.removeItem(STORAGE.accessToken);
        localStorage.removeItem(STORAGE.refreshToken);
        localStorage.removeItem(STORAGE.expiresAt);
    }

    async function getAccessToken() {
        const accessToken = localStorage.getItem(STORAGE.accessToken);
        const expiresAt = Number(localStorage.getItem(STORAGE.expiresAt) || 0);

        if (!accessToken) {
            return null;
        }

        // Refresh one minute before expiration.
        if (Date.now() >= expiresAt - 60000) {
            const refreshed = await refreshAccessToken();

            if (!refreshed) {
                return null;
            }

            return localStorage.getItem(STORAGE.accessToken);
        }

        return accessToken;
    }


    // =================================
    // RECENTLY PLAYED TRACK
    // =================================


    async function getCurrentlyPlaying() {
        let token = await getAccessToken();

        if (!token) return null;

        let response = await fetch(CURRENT_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            const refreshed = await refreshAccessToken();

            if (!refreshed) return null;

            token = localStorage.getItem(STORAGE.accessToken);

            response = await fetch(CURRENT_ENDPOINT, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        if (response.status === 204) return null;

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.is_playing || !data.item || data.item.type !== "track") {
            return null;
        }

        return data.item;
    }



    async function getRecentlyPlayed() {
        const token = await getAccessToken();

        if (!token) return null;

        const response = await fetch(
            `${RECENT_ENDPOINT}?limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Spotify recently played error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return null;
        }

        // Explicitly select the most recently played item.
        const sortedItems = [...data.items].sort(
            (a, b) => new Date(b.played_at) - new Date(a.played_at)
        );

        return sortedItems[0];
    }





    // =================================
    // UPDATE MUSIC CARD
    // =================================


    function updateMusicCard(item) {
        const trackName = document.getElementById("spotifyTrackName");
        const artistName = document.getElementById("spotifyArtistName");
        const albumArt = document.getElementById("spotifyAlbumArt");
        const fallbackIcon = document.getElementById("spotifyFallbackIcon");
        const action = document.getElementById("spotifyAction");

        if (!trackName || !artistName || !albumArt || !action) {
            return;
        }

        // Support both Spotify API response formats.
        const track = item?.track ?? item;

        if (!track || !track.name) {
            console.warn("[Spotify] No valid track received:", item);
            return;
        }

        // Track information
        trackName.textContent = track.name;

        artistName.textContent = track.artists
            ?.map(artist => artist.name)
            .join(", ") || "Unknown Artist";

        // Album artwork
        const artwork = track.album?.images?.[0]?.url;

        if (artwork) {
            albumArt.src = artwork;
            albumArt.hidden = false;

            if (fallbackIcon) {
                fallbackIcon.hidden = true;
            }
        }

        // Spotify track link
        const spotifyURL = track.external_urls?.spotify;

        if (spotifyURL) {
            action.href = spotifyURL;
            action.target = "_blank";
            action.rel = "noopener noreferrer";
            action.title = "Open on Spotify";
            action.setAttribute("aria-label", "Open track on Spotify");
        }
    }



    // =================================
    // MUSIC CARD INITIALIZATION
    // =================================

    function initializeMusicCard() {
        const action = document.getElementById("spotifyAction");

        if (!action) {
            return;
        }

        action.addEventListener("click", async (event) => {
            if (!localStorage.getItem(STORAGE.accessToken)) {
                event.preventDefault();
                await login();
            }
        });

        loadCurrentlyPlaying();
        setInterval(loadCurrentlyPlaying, 15000);
    }



    async function loadCurrentlyPlaying() {
        const trackName = document.getElementById("spotifyTrackName");
        const artistName = document.getElementById("spotifyArtistName");
        const label = document.querySelector(".music-card .activity-label");

        if (!trackName || !artistName) return;

        try {
            // First, check whether Spotify is actively playing.
            let item = await getCurrentlyPlaying();
            let isCurrentlyPlaying = Boolean(item);

            // If not playing, fall back to listening history.
            if (!item) {
                item = await getRecentlyPlayed();
            }

            if (!item) {
                trackName.textContent = "Nothing played yet";
                artistName.textContent = "Play something on Spotify";
                if (label) label.textContent = "LAST PLAYED";
                return;
            }

            // Update the card with the selected track.
            updateMusicCard(item);

            // Change the label depending on the source.
            if (label) {
                label.textContent = isCurrentlyPlaying
                    ? "NOW PLAYING"
                    : "LAST PLAYED";
            }

        } catch (error) {
            console.error("[Spotify]", error);

            trackName.textContent = "Spotify unavailable";
            artistName.textContent = "Unable to fetch listening activity";
        }
    }




    // =================================
    // CALLBACK HANDLER
    // =================================

    async function handleCallback() {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const returnedState = params.get("state");
        const error = params.get("error");

        if (!code && !error) {
            return false;
        }

        if (error) {
            throw new Error(`Spotify authorization failed: ${error}`);
        }

        const savedState = localStorage.getItem(STORAGE.state);

        if (!savedState || returnedState !== savedState) {
            throw new Error("Spotify authorization state mismatch.");
        }

        await exchangeCode(code);

        return true;
    }


    // =================================
    // PAGE STARTUP
    // =================================

    async function initialize() {
        const isCallbackPage =
            window.location.pathname.endsWith("/callback.html") ||
            window.location.pathname.endsWith("callback.html");

        if (isCallbackPage) {
            const message = document.getElementById("spotifyCallbackMessage");

            try {
                const completed = await handleCallback();

                if (completed) {
                    if (message) {
                        message.textContent = "Spotify connected! Returning to portfolio...";
                    }

                    setTimeout(() => {
                        window.location.replace("/#about");
                    }, 1200);
                } else {
                    if (message) {
                        message.textContent = "No Spotify authorization response found.";
                    }
                }

            } catch (error) {
                console.error("[Spotify]", error);

                if (message) {
                    message.textContent = error.message;
                }
            }

            return;
        }

        initializeMusicCard();
    }

    initialize();

})();

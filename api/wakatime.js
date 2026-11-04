
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const accessToken = process.env.WAKATIME_ACCESS_TOKEN;

    if (!accessToken) {
        return res.status(500).json({
            error: "WakaTime access token is not configured"
        });
    }

    try {
        // Current calendar week: Monday through today (Asia/Kolkata).
        const now = new Date();

        const dateFormatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        const today = dateFormatter.format(now);
        const [year, month, day] = today.split("-").map(Number);

        const todayDate = new Date(Date.UTC(year, month - 1, day));
        const weekday = todayDate.getUTCDay();
        const daysSinceMonday = (weekday + 6) % 7;

        todayDate.setUTCDate(todayDate.getUTCDate() - daysSinceMonday);

        const start = [
            todayDate.getUTCFullYear(),
            String(todayDate.getUTCMonth() + 1).padStart(2, "0"),
            String(todayDate.getUTCDate()).padStart(2, "0")
        ].join("-");

        const url = new URL(
            "https://api.wakatime.com/api/v1/users/current/summaries"
        );

        url.searchParams.set("start", start);
        url.searchParams.set("end", today);
        url.searchParams.set("timezone", "Asia/Kolkata");

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("WakaTime API error:", response.status, errorBody);

            return res.status(response.status).json({
                error: "Unable to fetch WakaTime statistics"
            });
        }

        const result = await response.json();

        const totalSeconds = (result.data || []).reduce(
            (total, day) =>
                total + (day.grand_total?.total_seconds || 0),
            0
        );

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600"
        );

        return res.status(200).json({
            totalSeconds,
            hours,
            minutes,
            text: `${hours}h ${minutes}m`,
            start,
            end: today
        });
    } catch (error) {
        console.error("WakaTime backend error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

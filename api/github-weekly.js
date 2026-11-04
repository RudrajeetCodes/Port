
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return res.status(500).json({
            error: "GitHub token is not configured"
        });
    }

    try {
        // Calculate this week's dates in Asia/Kolkata.
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        const today = formatter.format(new Date());
        const [year, month, day] = today.split("-").map(Number);

        const monday = new Date(Date.UTC(year, month - 1, day));
        const daysSinceMonday = (monday.getUTCDay() + 6) % 7;

        monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);

        const start = [
            monday.getUTCFullYear(),
            String(monday.getUTCMonth() + 1).padStart(2, "0"),
            String(monday.getUTCDate()).padStart(2, "0")
        ].join("-");

        const query = `author:RudrajeetCodes committer-date:${start}..${today}`;

        const url = new URL("https://api.github.com/search/commits");
        url.searchParams.set("q", query);
        url.searchParams.set("sort", "committer-date");
        url.searchParams.set("order", "desc");
        url.searchParams.set("per_page", "100");

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("GitHub weekly API error:", response.status, errorBody);

            return res.status(response.status).json({
                error: "Unable to fetch weekly GitHub statistics"
            });
        }

        const result = await response.json();
        const commits = result.items || [];

        // Count commits by repository.
        const repositoryCounts = {};

        commits.forEach(commit => {
            const repo = commit.repository?.full_name;

            if (repo) {
                repositoryCounts[repo] =
                    (repositoryCounts[repo] || 0) + 1;
            }
        });

        const mostWorkedEntry = Object.entries(repositoryCounts)
            .sort((a, b) => b[1] - a[1])[0];

        const latest = commits[0];

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600"
        );

        return res.status(200).json({
            weeklyCommits: result.total_count || 0,

            mostWorkedProject: mostWorkedEntry
                ? mostWorkedEntry[0].split("/").pop()
                : null,

            latestCommit: latest
                ? {
                    message: latest.commit.message.split("\n")[0],
                    repo: latest.repository.full_name,
                    url: latest.html_url,
                    date: latest.commit.committer.date
                }
                : null,

            start,
            end: today
        });

    } catch (error) {
        console.error("GitHub weekly stats error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

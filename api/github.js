
const GITHUB_USERNAME = "RudrajeetCodes";

const GITHUB_API = "https://api.github.com";

const SEARCH_QUERIES = {
    commits: `author:${GITHUB_USERNAME}`,
    merged: `author:${GITHUB_USERNAME} is:pr is:merged`,
    open: `author:${GITHUB_USERNAME} is:pr is:open`,
    closed: `author:${GITHUB_USERNAME} is:pr is:closed -is:merged`
};

export default async function handler(req, res) {
    const origin = req.headers.origin;

    const allowedOrigins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://port-two-kohl.vercel.app"
    ];

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Vary", "Origin");

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return res.status(500).json({
            error: "GitHub token is not configured"
        });
    }

    const type = req.query.type || "commits";

    if (!SEARCH_QUERIES[type]) {
        return res.status(400).json({
            error: "Invalid activity type"
        });
    }

    const page = Math.max(
        1,
        Number.parseInt(req.query.page, 10) || 1
    );

    const headers = {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
    };

    try {
        const params = new URLSearchParams({
            q: SEARCH_QUERIES[type],
            per_page: "100",
            page: String(page),
            sort: type === "commits" ? "committer-date" : "updated",
            order: "desc"
        });

        const endpoint = type === "commits" ? "commits" : "issues";

        const response = await fetch(
            `${GITHUB_API}/search/${endpoint}?${params}`,
            { headers }
        );

        if (!response.ok) {
            const details = await response.text();

            throw new Error(
                `${type} search failed (${response.status}): ${details}`
            );
        }

        const data = await response.json();

        const items = data.items.map(item => {
            if (type === "commits") {
                return {
                    type: "commits",
                    message: item.commit.message.split("\n")[0],
                    repo: item.repository.full_name,
                    date: item.commit.committer.date,
                    url: item.html_url
                };
            }

            return {
                type,
                message: item.title,
                repo: item.repository_url.replace(
                    `${GITHUB_API}/repos/`,
                    ""
                ),
                date: type === "merged"
                    ? item.pull_request?.merged_at || item.updated_at
                    : type === "closed"
                        ? item.closed_at || item.updated_at
                        : item.created_at,
                url: item.html_url
            };
        });

        const counts = {
            commits: null,
            merged: null,
            open: null,
            closed: null,
            [type]: data.total_count
        };

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=60, stale-while-revalidate=300"
        );

        return res.status(200).json({
            username: GITHUB_USERNAME,
            counts,
            items,
            page,
            hasMore: items.length === 100
        });

    } catch (error) {
        console.error("GitHub activity API:", error);

        res.setHeader("Cache-Control", "no-store");

        return res.status(502).json({
            error: "Unable to fetch GitHub activity"
        });
    }
}

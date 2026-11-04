
const GITHUB_USERNAME = "RudrajeetCodes";

const GITHUB_API = "https://api.github.com";

const SEARCH_QUERIES = {
    commits: `author:${GITHUB_USERNAME}`,
    merged: `author:${GITHUB_USERNAME} is:pr is:merged`,
    open: `author:${GITHUB_USERNAME} is:pr is:open`,
    closed: `author:${GITHUB_USERNAME} is:pr is:closed -is:merged`
};

export default async function handler(req, res) {
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

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const headers = {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
    };

    try {
        const results = await Promise.all(
            Object.entries(SEARCH_QUERIES).map(async ([key, query]) => {
                const params = new URLSearchParams({
                    q: query,
                    per_page: key === type ? "100" : "1",
                    page: key === type ? String(page) : "1",
                    sort: key === "commits" ? "committer-date" : "updated",
                    order: "desc"
                });

                const endpoint = key === "commits"
                    ? "commits"
                    : "issues";

                const response = await fetch(
                    `${GITHUB_API}/search/${endpoint}?${params}`,
                    { headers }
                );

                if (!response.ok) {
                    throw new Error(
                        `GitHub API error (${response.status})`
                    );
                }

                return [key, await response.json()];
            })
        );

        const data = Object.fromEntries(results);


        // Fetch accurate rolling-year contribution statistics
        const graphqlResponse = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers,
            body: JSON.stringify({
                query: `
                    query {
                        user(login: "RudrajeetCodes") {
                            contributionsCollection {
                                totalCommitContributions
                                contributionCalendar {
                                    totalContributions
                                }
                            }
                        }
                    }
                `
            })
        });

        if (!graphqlResponse.ok) {
            throw new Error(`GitHub GraphQL error (${graphqlResponse.status})`);
        }

        const graphqlResult = await graphqlResponse.json();

        if (graphqlResult.errors?.length || !graphqlResult.data?.user) {
            throw new Error("Unable to fetch GitHub contribution statistics");
        }

        const contributionStats =
            graphqlResult.data.user.contributionsCollection;


        const counts = {
            commits: contributionStats.totalCommitContributions,
            merged: data.merged.total_count,
            open: data.open.total_count,
            closed: data.closed.total_count
        };

        const items = data[type].items.map(item => {
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

        return res.status(200).json({
            username: GITHUB_USERNAME,
            counts,
            contributions: contributionStats.contributionCalendar.totalContributions,
            items,
            page,
            hasMore: items.length === 100
        });

    } catch (error) {
        console.error("GitHub activity API:", error);

        return res.status(502).json({
            error: "Unable to fetch GitHub activity"
        });
    }
}

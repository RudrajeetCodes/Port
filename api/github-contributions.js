
const GITHUB_API = "https://api.github.com/graphql";

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

    try {
        const response = await fetch(GITHUB_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28"
            },
            body: JSON.stringify({
                query: `
                    query {
                        user(login: "RudrajeetCodes") {
                            contributionsCollection {
                                contributionCalendar {
                                    totalContributions
                                    weeks {
                                        contributionDays {
                                            contributionCount
                                            date
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();

            console.error(
                "GitHub contributions API error:",
                response.status,
                errorBody
            );

            return res.status(502).json({
                error: "Unable to fetch GitHub contributions"
            });
        }

        const result = await response.json();

        if (result.errors?.length || !result.data?.user) {
            console.error(
                "GitHub GraphQL errors:",
                result.errors
            );

            return res.status(502).json({
                error: "Unable to retrieve contribution data"
            });
        }

        const calendar =
            result.data.user.contributionsCollection.contributionCalendar;

        const contributionDays = calendar.weeks.flatMap(
            week => week.contributionDays
        );

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200"
        );

        return res.status(200).json({
            contributions: calendar.totalContributions,
            contributionDays
        });

    } catch (error) {
        console.error(
            "GitHub contributions error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

const roles = [
    "Frontend Developer",
    "Game Developer",
    "Software Engineer",
    "Creative Problem Solver"
];

const roleElement = document.getElementById("dynamicRole");

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeWriter() {
    const currentRole = roles[roleIndex];

    if (!deleting) {
        roleElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentRole.length) {
            deleting = true;
            setTimeout(typeWriter, 1800);
            return;
        }
    } else {
        roleElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    }

    setTimeout(typeWriter, deleting ? 45 : 85);
}

typeWriter();

function updateLocalTime() {
    const timeElement = document.getElementById("localTime");

    const now = new Date();

    timeElement.textContent = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(now);
}

updateLocalTime();
setInterval(updateLocalTime, 1000);



const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// =================================
// THEME SWITCH SOUND
// =================================

function playThemeSound(theme) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audio = new AudioContext();

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    const now = audio.currentTime;

    // Different pitch for each theme
    oscillator.frequency.setValueAtTime(
        theme === "dark" ? 420 : 620,
        now
    );

    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    oscillator.start(now);
    oscillator.stop(now + 0.14);

    oscillator.onended = () => audio.close();
}

// Load saved theme, default to dark
const savedTheme = localStorage.getItem("theme") || "dark";

function setTheme(theme) {
    html.setAttribute("data-theme", theme);

    // Switch profile banner based on theme
    const profileBanner = document.getElementById("profileBanner");

    if (profileBanner) {
        profileBanner.src = theme === "light"
            ? "assets/images/bannerW.gif"
            : "assets/images/banner.gif";
    }

    localStorage.setItem("theme", theme);

    const isDark = theme === "dark";

    themeToggle.innerHTML = isDark
        ? '<i data-lucide="moon"></i>'
        : '<i data-lucide="sun"></i>';

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    lucide.createIcons();
}

// Apply saved theme
setTheme(savedTheme);

// Toggle theme on click
themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    playThemeSound(newTheme);
});

// =================================
// EXPERIENCE DROPDOWN ANIMATIONS
// =================================

document.querySelectorAll(".experience-item").forEach((item) => {
    const summary = item.querySelector(".experience-summary");
    const content = item.querySelector(".experience-details");

    let animation = null;

    summary.addEventListener("click", (event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        event.preventDefault();

        if (animation) {
            animation.cancel();
            animation = null;
        }

        const isOpen = item.open;

        if (isOpen) {
            // CLOSING
            const height = content.getBoundingClientRect().height;

            animation = content.animate(
                [
                    {
                        height: `${height}px`,
                        marginBottom: "20px",
                        opacity: 1
                    },
                    {
                        height: "0px",
                        marginBottom: "0px",
                        opacity: 0
                    }
                ],
                {
                    duration: 260,
                    easing: "cubic-bezier(0.4, 0, 1, 1)"
                }
            );

            animation.onfinish = () => {
                item.open = false;
                content.style.height = "";
                content.style.marginBottom = "";
                content.style.opacity = "";
                animation = null;
            };

        } else {
            // OPENING
            item.open = true;

            content.style.height = "auto";
            content.style.marginBottom = "20px";
            content.style.overflow = "hidden";

            const height = content.getBoundingClientRect().height;

            content.style.height = "0px";
            content.style.marginBottom = "0px";

            animation = content.animate(
                [
                    {
                        height: "0px",
                        marginBottom: "0px",
                        opacity: 0
                    },
                    {
                        height: `${height}px`,
                        marginBottom: "20px",
                        opacity: 1
                    }
                ],
                {
                    duration: 350,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                }
            );

            animation.onfinish = () => {
                content.style.height = "";
                content.style.marginBottom = "";
                content.style.opacity = "";
                content.style.overflow = "";
                animation = null;
            };
        }
    });
});

// =================================
// SCROLL REVEAL
// =================================

const revealElements = document.querySelectorAll(
    ".tech-section, .experience-section, .projects-section, .about-section, .dev-stats-section, .quote-section"
);

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});


// =================================
// PROJECT DATA
// =================================

const projects = [
    {
        name: "AOT Inspired Game",
        category: "Game Development",
        description: "An Attack on Titan-inspired game built using Luau and Roblox Studio.",

        image: "assets/images/game.png",
        imageBackground: "linear-gradient(135deg, #e9f5dc 0%, #c8f0a0 55%, #a9e66d 100%)",

        status: "ON HOLD",
        statusType: "on-hold",

        technologies: ["Luau", "Roblox Studio"],

        website: "https://www.roblox.com/games/16253563336/GEAR-TEST",
        github: "YOUR_AOT_GITHUB_LINK"
    },

    {
        name: "Project Orion",
        category: "Discord Bot",
        description: "A personal Discord productivity and developer assistant built with Python.",

        image: "assets/images/orion.png",
        imageBackground: "linear-gradient(135deg, #dce8f8 0%, #b9c9ed 50%, #a4b9e8 100%)",

        status: "In Development",
        statusType: "development",

        technologies: ["Python", "Discord", "SQLite"],

        website: "YOUR_ORION_PROJECT_LINK",
        github: "https://github.com/RudrajeetCodes/Project-Orion"
    }
];


// =================================
// PROJECT RENDERER
// =================================

const projectsGrid = document.getElementById("projectsGrid");

function isValidProjectLink(url) {
    return (
        typeof url === "string" &&
        url.trim() !== "" &&
        !url.startsWith("YOUR_") &&
        url !== "#"
    );
}

function renderProjects() {

    if (!projectsGrid) return;

    projectsGrid.innerHTML = projects.map(project => {

        // TECHNOLOGIES
        const visibleTechnologies = project.technologies.slice(0, 2);
        const extraTechnologies = project.technologies.length - 2;

        const technologyHTML = visibleTechnologies.map(tech => `
            <span class="project-tag">${tech}</span>
        `).join("");

        const moreHTML = extraTechnologies > 0
            ? `<span class="project-tag-more">+${extraTechnologies}</span>`
            : "";


        // WEBSITE LINK
        const websiteHTML = isValidProjectLink(project.website)
            ? `
                <a
                    href="${project.website}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View ${project.name} live"
                    title="Live Website"
                >
                    <i data-lucide="external-link"></i>
                </a>
            `
            : "";


        // GITHUB LINK
        const githubHTML = isValidProjectLink(project.github)
            ? `
                <a
                    href="${project.github}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="${project.name} GitHub repository"
                    title="GitHub"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.031 1.532 1.031.892 1.53 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.22-.253-4.555-1.11-4.555-4.944 0-1.092.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.1 2.393.1 2.646.64.699 1.028 1.591 1.028 2.683 0 3.843-2.339 4.688-4.566 4.937.359.31.678.921.678 1.856 0 1.34-.012 2.42-.012 2.75 0 .265.18.576.688.478A10.003 10.003 0 0 0 22 12c0-5.523-4.477-10-10-10Z"/>
                    </svg>
                </a>
            `
            : "";


        // PROJECT CARD
        return `
            <article class="project-card">

                <div
                    class="project-image-wrapper"
                    style="--project-image-bg: ${project.imageBackground || "#e5e5e5"}"
                >
                    <img
                        src="${project.image}"
                        alt="${project.name} preview"
                        class="project-image"
                        loading="lazy"
                    >
                </div>

                <div class="project-info">

                    <div class="project-title-row">

                        <h3 class="project-title">
                            ${project.name}
                        </h3>

                        ${project.status ? `
                            <span class="project-status ${project.statusType || ""}">
                                <span class="project-status-dot"></span>
                                ${project.status}
                            </span>
                        ` : ""}

                    </div>

                    <p class="project-category">
                        ${project.category}
                    </p>

                    <p class="project-description">
                        ${project.description}
                    </p>

                    <div class="project-footer">

                        <div class="project-tags">
                            ${technologyHTML}
                            ${moreHTML}
                        </div>

                        <div class="project-links">
                            ${websiteHTML}
                            ${githubHTML}
                        </div>

                    </div>

                </div>

            </article>
        `;

    }).join("");

    lucide.createIcons();
}

renderProjects();


// =================================
// GITHUB ACTIVITY — LIVE API
// =================================

const activityList = document.getElementById("github-activity-list");
const activityTabs = document.querySelectorAll(".activity-tab");
const showMoreButton = document.getElementById("activity-show-more");

let activeActivityFilter = "commits";
let githubActivity = [];
let activityCounts = {};
let currentActivityPage = 1;
let activityHasMore = false;
let showAllActivity = false;
let activityLoading = false;

// Safely display API-provided text
function escapeActivityHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format GitHub dates
function formatActivityDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// Update tab counts
function updateActivityCounts() {
    activityTabs.forEach(tab => {
        const countElement = tab.querySelector("span");

        if (countElement) {
            countElement.textContent =
                activityCounts[tab.dataset.filter] ?? 0;
        }
    });
}

// Fetch GitHub activity
async function fetchGithubActivity(page = 1, append = false) {
    if (!activityList || activityLoading) return;

    activityLoading = true;

    if (!append) {
        activityList.innerHTML = `
            <div class="github-activity-empty">
                Loading GitHub activity...
            </div>
        `;
    }

    if (showMoreButton) {
        showMoreButton.hidden = true;
    }

    try {
        const response = await fetch(
            `https://port-two-kohl.vercel.app/api/github?type=${encodeURIComponent(activeActivityFilter)}&page=${page}`
        );

        if (!response.ok) {
            throw new Error(`API request failed (${response.status})`);
        }

        const data = await response.json();

        activityCounts = {
            ...activityCounts,
            [activeActivityFilter]: data.counts?.[activeActivityFilter] ?? null
        };
        activityHasMore = Boolean(data.hasMore);
        currentActivityPage = data.page || page;

        githubActivity = append
            ? [...githubActivity, ...(data.items || [])]
            : (data.items || []);

        updateActivityCounts();
        renderGithubActivity();

    } catch (error) {
        console.error("GitHub activity error:", error);

        if (!append) {
            activityList.innerHTML = `
                <div class="github-activity-empty">
                    Unable to load GitHub activity. Please try again later.
                </div>
            `;
        }

        if (showMoreButton) {
            showMoreButton.hidden = true;
        }

    } finally {
        activityLoading = false;
    }
}

// Render activity
function renderGithubActivity() {
    if (!activityList) return;

    const visibleActivity = githubActivity.slice(
        0,
        showAllActivity ? 10 : 4
    );

    if (githubActivity.length === 0) {
        activityList.innerHTML = `
            <div class="github-activity-empty">
                No ${activeActivityFilter} activity to show.
            </div>
        `;
    } else {
        activityList.innerHTML = visibleActivity.map(activity => {
            const message = escapeActivityHTML(activity.message);
            const repo = escapeActivityHTML(
                activity.repo.split("/").pop()
            );
            const date = escapeActivityHTML(
                formatActivityDate(activity.date)
            );

            const url = typeof activity.url === "string" &&
                activity.url.startsWith("https://github.com/")
                ? activity.url
                : "#";

            return `
                <a
                    class="github-activity-item"
                    href="${url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="text-decoration: none; color: inherit;"
                >
                    <span class="activity-commit-icon" aria-hidden="true">⌘</span>

                    <span
                        class="activity-commit-message"
                        title="${message}"
                    >
                        ${message}
                    </span>

                    <span class="activity-commit-repo">
                        ${repo}
                    </span>

                    <span class="activity-commit-date">
                        ${date}
                    </span>
                </a>
            `;
        }).join("");
    }

    if (!showMoreButton) return;

    if (githubActivity.length <= 4 && !activityHasMore) {
        showMoreButton.hidden = true;
        return;
    }

    showMoreButton.hidden = false;

    showMoreButton.textContent = showAllActivity
        ? "Show less"
        : "Show more";
}

// Tab switching
activityTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        activityTabs.forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        activeActivityFilter = tab.dataset.filter;

        githubActivity = [];
        currentActivityPage = 1;
        activityHasMore = false;
        showAllActivity = false;

        fetchGithubActivity(1);
    });
});

// Show more / show less
if (showMoreButton) {
    showMoreButton.addEventListener("click", () => {
        if (activityLoading) return;

        showAllActivity = !showAllActivity;
        renderGithubActivity();
    });
}

// Initial load
fetchGithubActivity();


// =================================
// WEEKLY DEVELOPER STATS
// =================================

async function fetchWeeklyDevStats() {
    const codingTimeElement = document.getElementById("wakatime-weekly-time");
    const commitsElement = document.getElementById("github-weekly-commits");
    const projectElement = document.getElementById("github-most-worked-project");
    const latestElement = document.getElementById("github-latest-commit");

    const [wakatimeResult, githubResult] = await Promise.allSettled([
        fetch("https://port-two-kohl.vercel.app/api/wakatime"),
        fetch("https://port-two-kohl.vercel.app/api/github-weekly")
    ]);

    // WakaTime weekly coding time
    try {
        if (wakatimeResult.status === "fulfilled" && wakatimeResult.value.ok) {
            const data = await wakatimeResult.value.json();

            if (codingTimeElement) {
                codingTimeElement.textContent = data.text || "--h --m";
            }
        } else {
            throw new Error("WakaTime request failed");
        }
    } catch (error) {
        console.error("Weekly coding stats error:", error);

        if (codingTimeElement) {
            codingTimeElement.textContent = "Unavailable";
        }
    }

    // GitHub weekly statistics
    try {
        if (githubResult.status !== "fulfilled" || !githubResult.value.ok) {
            throw new Error("GitHub weekly request failed");
        }

        const data = await githubResult.value.json();

        if (commitsElement) {
            commitsElement.textContent = data.weeklyCommits ?? "--";
        }

        if (projectElement) {
            projectElement.textContent = data.mostWorkedProject || "No commits yet";
        }

        if (latestElement) {
            const latest = data.latestCommit;

            latestElement.textContent = latest
                ? `> ${latest.message} · ${latest.repo.split("/").pop()}`
                : "> No commits this week";

            latestElement.title = latest
                ? `${latest.repo} · ${latest.date}`
                : "";
        }

    } catch (error) {
        console.error("Weekly GitHub stats error:", error);

        if (commitsElement) commitsElement.textContent = "--";
        if (projectElement) projectElement.textContent = "Unavailable";
        if (latestElement) latestElement.textContent = "> Unable to load latest commit";
    }
}

fetchWeeklyDevStats();



// =================================
// FLOATING NAVIGATION
// =================================

const navItems = document.querySelectorAll(".nav-item");

const navSections = [
    "home",
    "experience",
    "projects",
    "about",
    "dev-stats"
].map(id => document.getElementById(id)).filter(Boolean);

// Smooth navigation

navItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();

        const target = document.getElementById(item.dataset.section);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

/// Detect current section

function updateActiveSection() {
    const activationPoint = window.innerHeight * 0.4;

    let activeSection = navSections[0];

    navSections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= activationPoint) {
            activeSection = section;
        }
    });

    if (!activeSection) return;

    navItems.forEach(item => {
        const isActive = item.dataset.section === activeSection.id;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-current", isActive ? "location" : "false");
    });
}

window.addEventListener("scroll", updateActiveSection, {
    passive: true
});

window.addEventListener("resize", updateActiveSection);

updateActiveSection();


// =================================
// DISCORD STATUS — LANYARD API
// =================================



(() => {
    console.log("[Lanyard] Script initialized");

    const LANYARD_USER_ID = "321037704563523584";

    const statusDot = document.getElementById("discordStatusDot");
    const statusText = document.getElementById("discordStatusText");

    if (!statusDot || !statusText) {
        console.error("[Lanyard] Status elements not found. Check index.html IDs.");
        return;
    }

    let socket;
    let heartbeat;
    let reconnectTimer;

    function updateDiscordStatus(status) {
        console.log("[Lanyard] Discord status:", status);

        if (!status) return;

        const offline = status === "offline";

        statusText.textContent = offline ? "Offline" : "Active";
        statusDot.dataset.status = offline ? "offline" : "online";
    }

    function connectLanyard() {
        console.log("[Lanyard] Connecting...");

        socket = new WebSocket("wss://api.lanyard.rest/socket");

        socket.addEventListener("open", () => {
            console.log("[Lanyard] WebSocket connected");
        });

        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);

            console.log("[Lanyard] Received:", message);

            // Hello
            if (message.op === 1) {
                socket.send(JSON.stringify({
                    op: 2,
                    d: {
                        subscribe_to_id: LANYARD_USER_ID
                    }
                }));

                heartbeat = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ op: 3 }));
                    }
                }, message.d.heartbeat_interval);
            }

            // Initial presence
            if (message.t === "INIT_STATE") {
                updateDiscordStatus(message.d.discord_status);
            }

            // Live presence update
            if (message.t === "PRESENCE_UPDATE") {
                updateDiscordStatus(message.d.discord_status);
            }
        });

        socket.addEventListener("error", (error) => {
            console.error("[Lanyard] WebSocket error:", error);
        });

        socket.addEventListener("close", () => {
            console.warn("[Lanyard] Connection closed. Reconnecting...");

            clearInterval(heartbeat);
            clearTimeout(reconnectTimer);

            reconnectTimer = setTimeout(connectLanyard, 5000);
        });
    }

    connectLanyard();
})();


// =================================
// GITHUB CONTRIBUTION CALENDAR
// =================================

async function fetchGithubContributions() {
    const graph = document.getElementById("github-graph");
    const months = document.getElementById("github-months");
    const total = document.getElementById("github-total");
    const lastYear = document.getElementById("github-last-year");

    if (!graph || !months) return;

    try {
        const response = await fetch(
            "https://port-two-kohl.vercel.app/api/github-contributions"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch GitHub contributions");
        }

        const data = await response.json();
        const days = data.contributionDays || [];

        if (!days.length) {
            graph.textContent = "Contribution data unavailable";
            return;
        }

        const sortedDays = [...days].sort(
            (a, b) => a.date.localeCompare(b.date)
        );

        const firstDate = new Date(`${sortedDays[0].date}T00:00:00`);
        const startOffset = firstDate.getDay();

        const calendarDays = [
            ...Array(startOffset).fill(null),
            ...sortedDays
        ];

        const totalContributions = data.contributions ??
            sortedDays.reduce(
                (sum, day) => sum + day.contributionCount,
                0
            );

        if (total) {
            total.textContent = totalContributions.toLocaleString();
        }

        if (lastYear) {
            lastYear.textContent =
                `${totalContributions.toLocaleString()} contributions in the last year`;
        }

        const maxCount = Math.max(
            ...sortedDays.map(day => day.contributionCount),
            1
        );

        function getLevel(count) {
            if (count === 0) return 0;

            const ratio = count / maxCount;

            if (ratio <= 0.25) return 1;
            if (ratio <= 0.50) return 2;
            if (ratio <= 0.75) return 3;

            return 4;
        }

        graph.innerHTML = "";
        months.innerHTML = "";

        graph.classList.add("github-graph-loaded");

        const weekCount = Math.ceil(calendarDays.length / 7);

        graph.style.setProperty("--week-count", weekCount);

        const monthLabels = new Map();

        sortedDays.forEach(day => {
            const date = new Date(`${day.date}T00:00:00`);
            const index =
                Math.floor((date - firstDate) / 86400000) + startOffset;

            const week = Math.floor(index / 7) + 1;
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

            if (!monthLabels.has(monthKey)) {
                monthLabels.set(monthKey, {
                    name: date.toLocaleDateString("en-US", {
                        month: "short"
                    }),
                    week
                });
            }
        });

        monthLabels.forEach(month => {
            const label = document.createElement("span");

            label.textContent = month.name;
            label.style.gridColumn = month.week;

            months.appendChild(label);
        });

        calendarDays.forEach((day, index) => {
            const cell = document.createElement("span");
            cell.style.setProperty("--cell-index", index);

            if (!day) {
                cell.className = "contribution-cell empty";
                cell.setAttribute("aria-hidden", "true");
            } else {
                const count = day.contributionCount;

                cell.className =
                    `contribution-cell level-${getLevel(count)}`;

                cell.title =
                    `${count} contributions on ${day.date}`;

                cell.setAttribute(
                    "aria-label",
                    `${count} contributions on ${day.date}`
                );
            }

            graph.appendChild(cell);
        });

    } catch (error) {
        console.error("GitHub contribution calendar error:", error);
        graph.textContent = "Unable to load contribution activity";
    }
}

fetchGithubContributions();

// =================================
// GITHUB CALENDAR SCROLL REVEAL
// =================================

const contributionGraph = document.getElementById("github-graph");

if (contributionGraph) {
    if ("IntersectionObserver" in window) {
        const calendarObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        contributionGraph.classList.add("is-visible");
                        calendarObserver.unobserve(contributionGraph);
                    }
                });
            },
            {
                threshold: 0.15
            }
        );

        calendarObserver.observe(contributionGraph);
    } else {
        contributionGraph.classList.add("is-visible");
    }
}


const quotes = [
    {
        text: '"Always be hustlin\'.',
        author: "~ Travis Kalanick"
    },
    {
        text: '"The only way to do great work is to love what you do."',
        author: "~ Steve Jobs"
    },
    {
        text: '"Stay hungry. Stay foolish."',
        author: "~ Steve Jobs"
    },
    {
        text: '"Talk is cheap. Show me the code."',
        author: "~ Linus Torvalds"
    },
    {
        text: '"First, solve the problem. Then, write the code."',
        author: "~ John Johnson"
    },
    {
        text: '"Make it work, make it right, make it fast."',
        author: "~ Kent Beck"
    },
    {
        text: '"Programs must be written for people to read."',
        author: "~ Harold Abelson"
    },
    {
        text: '"Simplicity is the soul of efficiency."',
        author: "~ Austin Freeman"
    },
    {
        text: '"The best code is no code at all."',
        author: "~ Jeff Atwood"
    },
    {
        text: '"Any fool can write code that a computer can understand."',
        author: "~ Martin Fowler"
    },
    {
        text: '"It works on my machine."',
        author: "~ Every Developer"
    },
    {
        text: '"What is broken is broken."',
        author: "~ Unknown"
    },

    // Anime
    {
        text: '"Whatever you lose, you\'ll find it again."',
        author: "~ Kenshin Himura"
    },
    {
        text: '"A lesson without pain is meaningless."',
        author: "~ Edward Elric"
    },
    {
        text: '"The world isn\'t perfect. But it\'s there for us."',
        author: "~ Roy Mustang"
    },
    {
        text: '"If you don\'t take risks, you can\'t create a future."',
        author: "~ Monkey D. Luffy"
    },
    {
        text: '"Whatever you do, enjoy it."',
        author: "~ Gintoki Sakata"
    },
    {
        text: '"Hard work is worthless for those that don\'t believe in themselves."',
        author: "~ Naruto Uzumaki"
    },
    {
        text: '"The future is not something we enter. The future is something we create."',
        author: "~ Makoto Shishio"
    },
    {
        text: '"I\'m not going to run away anymore."',
        author: "~ Shinji Ikari"
    }
];

const QUOTE_INTERVAL = 5000;

const quoteCard = document.querySelector(".quote-card");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");

let quoteIndex = 0;
let quoteTimer = null;

function changeQuote() {
    if (!quoteCard || !quoteText || !quoteAuthor) return;

    quoteCard.classList.add("changing");

    setTimeout(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;

        quoteText.textContent = quotes[quoteIndex].text;
        quoteAuthor.textContent = quotes[quoteIndex].author;

        quoteCard.classList.remove("changing");
    }, 350);
}

function startQuoteRotation() {
    if (quoteTimer || document.hidden) return;

    quoteTimer = setInterval(changeQuote, QUOTE_INTERVAL);
}

function stopQuoteRotation() {
    clearInterval(quoteTimer);
    quoteTimer = null;
}

startQuoteRotation();

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopQuoteRotation();
    } else {
        startQuoteRotation();
    }
});

// =================================
// DYNAMIC SIDE STARFIELD
// =================================

(() => {
    if (window.matchMedia("(max-width: 1199px)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "starfield-canvas";
    canvas.setAttribute("aria-hidden", "true");

    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let stars = [];
    let width = 0;
    let height = 0;
    let animationFrame;

    const STAR_COUNT = 65;


    function createStars() {
        stars = [];

        const container = document.querySelector(".main-container");

        if (!container) return;

        const rect = container.getBoundingClientRect();

        // Keep stars outside the main content, with a 20px buffer.
        const leftBoundary = Math.max(0, rect.left - 20);
        const rightBoundary = Math.min(width, rect.right + 20);

        const leftWidth = leftBoundary;
        const rightWidth = width - rightBoundary;
        const totalSideWidth = leftWidth + rightWidth;

        if (totalSideWidth <= 0) return;

        for (let i = 0; i < STAR_COUNT; i++) {
            // Distribute stars according to available side space.
            const leftSide = Math.random() < leftWidth / totalSideWidth;

            const x = leftSide
                ? Math.random() * leftWidth
                : rightBoundary + Math.random() * rightWidth;

            stars.push({
                x,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.5,
                opacity: Math.random() * 0.55 + 0.2,
                speed: Math.random() * 0.002 + 0.001,
                phase: Math.random() * Math.PI * 2,
                glow: Math.random() * 8 + 4
            });
        }
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createStars();
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        const isLight =
            document.documentElement.dataset.theme === "light";

        stars.forEach(star => {
            const twinkle =
                (Math.sin(time * star.speed + star.phase) + 1) / 2;

            const alpha = star.opacity * (0.35 + twinkle * 0.65);

            const color = isLight
                ? `rgba(137, 96, 147, ${alpha})`
                : `rgba(220, 225, 255, ${alpha})`;

            ctx.beginPath();

            ctx.shadowBlur = star.glow;
            ctx.shadowColor = color;
            ctx.fillStyle = color;

            ctx.arc(
                star.x,
                star.y,
                star.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();
        });

        ctx.shadowBlur = 0;

        animationFrame = requestAnimationFrame(animate);
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animationFrame = requestAnimationFrame(animate);
    }
})();

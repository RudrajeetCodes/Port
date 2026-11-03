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
document.addEventListener("DOMContentLoaded", () => {
    const pageLinks = document.querySelectorAll(".page-nav-item");

    pageLinks.forEach(link => {
        link.addEventListener("click", event => {
            const destination = link.href;

            if (
                !destination ||
                destination === window.location.href ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            event.preventDefault();

            document.body.classList.add("page-leaving");

            setTimeout(() => {
                window.location.href = destination;
            }, 250);
        });
    });
});
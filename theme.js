(function() {
    const body = document.body || document.documentElement;
    const currentTheme = localStorage.getItem("theme") || "light";
    
    // Apply theme immediately to prevent flashing
    if (currentTheme === "dark") {
        body.classList.add("dark-mode");
    } else {
        body.classList.remove("dark-mode");
    }

    window.initTheme = function() {
        const toggleBtn = document.getElementById("themeToggle");
        const isDark = body.classList.contains("dark-mode");

        if (toggleBtn) {
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }

            if (!toggleBtn.dataset.themeInit) {
                toggleBtn.dataset.themeInit = "true";
                toggleBtn.addEventListener("click", (e) => {
                    const newDark = !body.classList.contains("dark-mode");
                    body.classList.toggle("dark-mode", newDark);
                    localStorage.setItem("theme", newDark ? "dark" : "light");
                    const newIcon = toggleBtn.querySelector("i");
                    if (newIcon) newIcon.className = newDark ? 'fas fa-sun' : 'fas fa-moon';
                });
            }
        }
    };

    // Poll to catch the button as soon as it exists
    document.addEventListener("DOMContentLoaded", window.initTheme);
    const poller = setInterval(() => {
        if (document.getElementById("themeToggle")) {
            window.initTheme();
            clearInterval(poller);
        }
    }, 100);
    setTimeout(() => clearInterval(poller), 5000);
})();

document.addEventListener("DOMContentLoaded", function () {
    const TAB_LINK_MAP = {
        'Java': 'java/',
        'Node.js': 'nodejs/',
        'Python': 'python/',
    };

    const WELCOME_LINK_MAP = {
        'Java': '/',
        'Node.js': '/index-nodejs/',
        'Python': '/index-python/',
    }

    const redirectToTargetWelcomePage = (currentPathname, targetWelcomePath) => {
        const match = currentPathname.match(/^(.*?\/(?:all|cndj))/);
        if (match) {
            const defaultPath = `${match[1]}${targetWelcomePath}`;
            window.location.href = defaultPath;
        } else {
            window.location.href = `/cloud-curriculum/materials${targetWelcomePath}`;
        }
    }

    const preventDefaultNavigation = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    const getCurrentLangURI = () => {
        const currentTab = document.querySelector('.md-tabs__link--active');
        return TAB_LINK_MAP[currentTab.textContent.trim()];
    }

    const getNewPathname = (clickedTabText, currentPathname, currentLangURI) => {
        let targetLangURI = TAB_LINK_MAP[clickedTabText];
        return currentPathname.replace(currentLangURI, targetLangURI);
    }

    const isWelcomePage = (currentPathname, currentLangURI) => {
        const isJavaWelcomePage = !currentPathname.endsWith(currentLangURI);
        const isNodeOrPythonWelcomePage = currentPathname.endsWith('index-nodejs/') || currentPathname.endsWith('index-python/');
        return isJavaWelcomePage || isNodeOrPythonWelcomePage;
    }

    const checkPathExists = (newPathname) => {
        return fetch(newPathname, { method: "HEAD" })
            .then(response => response.ok)
            .catch(() => false);
    }

    function attachTabClickHandler() {
        const tabLinks = document.querySelectorAll(".md-tabs__link");
        tabLinks.forEach(link => {
            link.addEventListener("click", function (event) {
                preventDefaultNavigation(event);

                const clickedTabText = event.target.textContent.trim();
                const currentPathname = window.location.pathname;
                const currentLangURI = getCurrentLangURI();

                if (isWelcomePage(currentPathname, currentLangURI)) {
                    redirectToTargetWelcomePage(currentPathname, WELCOME_LINK_MAP[clickedTabText]);
                    return;
                }
                
                const newPathname = getNewPathname(clickedTabText, currentPathname, currentLangURI);
                checkPathExists(newPathname).then(exist => {
                    if (exist) {
                        window.location.href = newPathname;
                    } else {
                        redirectToTargetWelcomePage(currentPathname, WELCOME_LINK_MAP[clickedTabText])
                    }
                })
                .catch(error => {
                    redirectToTargetWelcomePage(currentPathname, WELCOME_LINK_MAP[clickedTabText])
                });
            });
        });
    }

    const observer = new MutationObserver(() => {
        attachTabClickHandler();
    });

    observer.observe(document.body, { childList: true });
});
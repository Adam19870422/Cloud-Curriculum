const consentCookieId = 'wpcc';
const consentButtonClass = "wpcc-btn";
const trackingImageClass = "trackingimage";
let currentImage = null;
const header = document.querySelector('head');

const observer = new MutationObserver(() => {
    loadTrackingImage();
});
const observerConfig = { subtree: true, childList: true, characterData: true }
observer.observe(header, observerConfig);

const getCookie = (key) => {
    const cookies = document.cookie
        .split(';')
        .map(cookie => cookie.split('='))
        .reduce((acc, [key, value]) => ({ ...acc, [key.trim()]: value }), {})
    return cookies[key];
}

const loadTrackingImage = () => {

    const image = document.getElementsByClassName(trackingImageClass).item(0);
    if (getCookie(consentCookieId)) {
        if (image && !image.isEqualNode(currentImage)) {
            const pagename = image.id;
            image.src = `https://cloud-native-dev-usage-tracker.cfapps.sap.hana.ondemand.com/pagehit/${pagename}/1x1.png`;
            currentImage = image;
        }
    }
}

window.onload = () => {
    const consentbutton = document.getElementsByClassName(consentButtonClass).item(0);
    consentbutton.onclick = loadTrackingImage;
}

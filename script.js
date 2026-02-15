function scrollContainer(containerId, direction, amount) {
    const container = document.getElementById(containerId);
    const maxScroll = container.scrollWidth - container.clientWidth;
    let currentTransform = container.style.transform || "translateX(0px)";
    let currentX = parseInt(currentTransform.match(/-?\d+/)) || 0;

    if (direction === 'right') {
        currentX = Math.max(currentX - amount, -maxScroll);
    } else if (direction === 'left') {
        currentX = Math.min(currentX + amount, 0);
    }

    container.style.transform = `translateX(${currentX}px)`;
}

function Start(){

    window.location.href="signUp.html";

}
function Login(){
     window.location.href="mainPage.html";
}
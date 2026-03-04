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

const tutorForm = document.getElementById("tutorForm");
if (tutorForm) {
    tutorForm.addEventListener("submit", function(e) {
        e.preventDefault();
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const grade = document.getElementById("gradeId").value;
        const subject = document.getElementById("subjectId").value;
        const topic = document.getElementById("topicId").value;
        const level = document.getElementById("levelId").value;

        localStorage.setItem("grade", grade);
        localStorage.setItem("subject", subject);
        localStorage.setItem("topic", topic);
        localStorage.setItem("level", level);

        //  window.location.href = "solutionPage.html";

      
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const subjectEl = document.getElementById("subject");
    const topicEl = document.getElementById("topicTitle");
    const levelEl = document.getElementById("airesponselevel");
    const gradeMetaEl = document.getElementById("gradeMeta");
    const subjectMetaEl = document.getElementById("subjectMeta");
    const levelMetaEl = document.getElementById("levelMeta");

    const grade = localStorage.getItem("grade");
    const subject = localStorage.getItem("subject");
    const topic = localStorage.getItem("topic");
    const level = localStorage.getItem("level");

    if (subjectEl && subject) subjectEl.textContent = subject;
    if (topicEl && topic) topicEl.textContent = topic;
    if (levelEl && level) levelEl.textContent = level + " Level";

    if (gradeMetaEl && grade) gradeMetaEl.textContent = grade;
    if (subjectMetaEl && subject) subjectMetaEl.textContent = subject;
    if (levelMetaEl && level) levelMetaEl.textContent = level;
});


function Start(){

    window.location.href="signUp.html";

}



async function loadVideos(){


    const sHeading=document.getElementById("topicTitle").innerText;
    const vidContainer=document.getElementById("videosSection");
    vidContainer.innerHTML="";
    const response=await fetch(`https://us-central1-tutorai-5f97d.cloudfunctions.net/YT_VIDEOS?heading=${encodeURIComponent(sHeading)}`);
    const videos=await response.json();
    const heading=document.createElement("h2");
    vidContainer.appendChild(heading);
    heading.style.textAlign="center";

    videos.forEach(video=>{
        const iframe=document.createElement("iframe");
      
        heading.innerText="Recommended Videos"
        iframe.classList.add("yt-videos");
        iframe.src = `https://www.youtube.com/embed/${video.id}`;
        iframe.title = video.title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
   
        iframe.frameBorder=1;
   
        vidContainer.appendChild(iframe);
      

    }
     

    )

}

// window.addEventListener("DOMContentLoaded", loadVideos);


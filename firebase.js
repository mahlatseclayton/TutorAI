
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         sendPasswordResetEmail,
         onAuthStateChanged, 
         updateProfile,
         sendEmailVerification, 
         signOut 
       } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjNyRSkepOLHcYuK4ALI2xWibC-P849f0",
  authDomain: "tutorai-5f97d.firebaseapp.com",
  projectId: "tutorai-5f97d",
  storageBucket: "tutorai-5f97d.firebasestorage.app",
  messagingSenderId: "447039931727",
  appId: "1:447039931727:web:e90fa57709aced5bb6713a",
  measurementId: "G-TDDTB6PM28"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function validate(){
     const name=document.getElementById("name").value;
    const grade=document.getElementById("grade").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const cpassword=document.getElementById("cpassword").value;
    if(name==""|| grade=="" || email=="" || password=="" || cpassword==""){
        alert("All fields are required.");
        return false;
    }
    return true;

}
// define id's for the input fields and buttons and add event listeners to them
const overView=document.getElementById("overviewContent");
const explanation=document.getElementById("explanationContent");



// Initialize Firebase

// the export allows us to use the method outside this file and the async to allow the program to wait a bit
async function signUp(){
    const name=document.getElementById("name").value;
    const grade=document.getElementById("grade").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const cpassword=document.getElementById("cpassword").value;
   if(validate()){
    if(password!=cpassword){
        alert("Passwords do not match");
        return;
    //   validation
    }
    else if(password.length<8){
        alert("Password must be at least 8 characters.");
         return;
    }
    else if(!/[A-Z]/.test(password)){
        alert("Password must contain atleast one upper case");
         return;
    }
    else if(!/[0-9]/.test(password)){
        alert("Password must contain atleast one number");
         return;
    }

    // add other validations here for security purposes
    else{
    //   signup here
    try{
        // create a user credetials then send verification using the user object??
       const userCredential= await createUserWithEmailAndPassword(auth,email,password);
       const user=userCredential.user;

    //    pause verifications for now
        // await sendEmailVerification(user);
     await   setDoc(doc(db, "users", user.uid), {
    name: name,
    grade: grade,
    email: email,
    createdAt: new Date()
});
        alert("Success:Account successfully created!");
        
        window.location.href="signIn.html";
       
    }
    catch(error){
        alert("Error creating account ");
        console.log(error.message);
        
    } 
    
    }
}

}
    //  make an oncliick lister for the signup button
    const signUpbtn=document.getElementById("signUpBtn");

if (signUpbtn) {

     signUpbtn.addEventListener("click", signUp);
    
}
const signInBtn=document.getElementById("signInBtn");
if(signInBtn){
    
    signInBtn.addEventListener("click",async () =>{
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
        if(email=="" || password==""){
        alert("All fields are required.");
        return;
    }

        try{
               const userCredential= await signInWithEmailAndPassword(auth,email,password);
                const user=userCredential.user;
                // checking verification
                // if(!user.emailVerified){
                //     alert("Verify email to log in.")
                //     auth.signOut;
                //     return;
                // }
                alert("Success:Log in successful.");
                     window.location.href="mainPage.html";
        }catch(error){
                alert("Error:Log in failed , validate your email or password .");
                console.log(error.message);
                
        }

    })
}

// forgot password funtionality
const forgotBtn=document.getElementById("forgotBtn");
if(forgotBtn){
    

    forgotBtn.addEventListener("click",async()=>{
         const email=document.getElementById("email").value;
         if(email==null || email==""){
            alert("Email required.");
            return;
         }
         try{
await sendPasswordResetEmail(auth,email);
        alert("Reset password link sent.");
         }catch(error){
            alert("Error sending reset link");
            console.log(error.message);
         }
        
    })
}
// getting topic from ai
async function getTopic(){
    
    const grade=document.querySelector("#gradeId").value;
    const topic=document.querySelector("#topicId").value;
     const subject=document.querySelector("#subjectId").value;
    const level=document.querySelector("#levelId").value;
     
        localStorage.setItem("grade", grade);
        localStorage.setItem("subject", subject);
        localStorage.setItem("topic", topic);
        localStorage.setItem("level", level);
        console.log("stored details");
    const prompt = `
YOU ARE AN ADVANCED EDUCATIONAL TUTOR AI.

TASK:
GENERATE STRUCTURED LEARNING CONTENT.

STRICT RULES:
- RETURN ONLY VALID JSON.
- DO NOT RETURN PLAIN TEXT.
- DO NOT ADD EXPLANATIONS OUTSIDE JSON.
- ALL LONG TEXT FIELDS MUST USE FORMATTED MARKDOWN.
- FOR MATH & EQUATIONS, YOU MUST USE LATEX COMPATIBLE WITH MATHJAX.
- INLINE MATH MUST BE WRAPPED IN \\\\( and \\\\). Example: "\\\\( x^2 \\\\)".
- BLOCK/DISPLAY MATH MUST BE WRAPPED IN \\\\[ and \\\\] or $$ and $$. Example: "\\\\[ E=mc^2 \\\\]".
- REMEMBER YOU ARE WRITING INSIDE A JSON STRING: ALWAYS DOUBLE-ESCAPE BACKSLASHES! Single backslashes will break JSON.parse!
- ENSURE YOUR JSON STRINGS ESCAPE NEWLINES AND QUOTES CORRECTLY.

STRUCTURE AS VALID JSON:
{
  "SUBJECT": "${subject}",
  "TOPIC": "${topic}",
  "GRADE": "${grade}",
  "LEVEL": "${level}",

  "OVERVIEW": "Detailed introductory Markdown text.",

  "EXPLANATION": "Extensive Markdown containing step-by-step explanations, lists, and LaTeX math equations (\\\\( e=mc^2 \\\\)).",

  "EXAMPLES": [
    {
      "TITLE": "Example 1",
      "SOLUTION": "Step-by-step Markdown solution with LaTeX formulas."
    }
  ],

  "PRACTICE": {
    "EASY": ["Markdown Question 1 with \\\\( math \\\\)"],
    "MEDIUM": ["Markdown Question 1"],
    "HARD": ["Markdown Question 1"]
  }
}

LEVEL GUIDELINES:
- BEGINNER → Simple definitions + simple examples.
- INTERMEDIATE → Include formulas + deep explanation.
- ADVANCED → Include deep reasoning + detailed proofs.

TOPIC:
${topic}

SUBJECT:
${subject}

GRADE:
${grade}

LEVEL:
${level}
`;
// this method calls the cloud function 
const response = await fetch(
  "https://us-central1-tutorai-5f97d.cloudfunctions.net/topicTutor",
  {
    method: "POST",
    headers: {
       "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: prompt
    })
  }
);

   const data = await response.json();
        try{
        if (data && data.aiResponse) {
            const responseToStore = typeof data.aiResponse === 'string' 
                ? data.aiResponse 
                : JSON.stringify(data.aiResponse);
                
           localStorage.setItem("aiResponse", responseToStore);    
            window.location.href = "solutionPage.html";
        } else {
            console.error("Invalid response format:", data);
            alert("Error: Invalid response from server");
        }
    } catch (error) {
        console.error("Error in getTopic:", error);
        alert("Error fetching topic. Please try again.");
    }
  

}
const startedBtn = document.querySelector("#startedBtn");
if (startedBtn) {
    startedBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        // Basic validation before showing loader
        const grade = document.querySelector("#gradeId")?.value;
        const topic = document.querySelector("#topicId")?.value;
        const subject = document.querySelector("#subjectId")?.value;
        const level = document.querySelector("#levelId")?.value;

        if (!grade || !topic || !subject || !level) {
            alert("Please fill out all fields before starting.");
            return;
        }

        startedBtn.disabled = true;
        const originalText = startedBtn.innerText;
        startedBtn.innerText = "Generating...";
        
        const loader = document.getElementById("loaderOverlay");
        if (loader) loader.style.display = "flex";

        await getTopic();

        // This runs if getTopic fails or after redirect happens
        startedBtn.disabled = false;
        startedBtn.innerText = originalText;
        if (loader) loader.style.display = "none";
    });
}
async function handleResponse() {
    const stored = localStorage.getItem("aiResponse");
    
    if (stored) {
        const cleaned = stored.replace(/```json|```/g, '').trim();
        const aiResponse = JSON.parse(cleaned);
        
        // We use marked.parse() to safely output Markdown rich text natively as HTML
        if(overView && aiResponse.OVERVIEW){
            overView.innerHTML = marked.parse(aiResponse.OVERVIEW);
        }
        if(explanation && aiResponse.EXPLANATION){
            explanation.innerHTML = marked.parse(aiResponse.EXPLANATION);
        }

        const examplesContainer=document.getElementById("examplesContent");
        const practiceContainer=document.getElementById("practiceContent");
        
        if (examplesContainer && aiResponse.EXAMPLES) {
            let examplesHtml = '';
            aiResponse.EXAMPLES.forEach(example => {
                examplesHtml += `
                    <div style="margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">${example.TITLE}</h3>
                        <div class="md-content" style="line-height: 1.7; font-size: 15px; color: #374151;">${marked.parse(example.SOLUTION)}</div>
                    </div>
                `;
            });
            examplesContainer.innerHTML = examplesHtml;
        }
    
        if (practiceContainer && aiResponse.PRACTICE) {
            let practiceHtml = '';
            
            const renderPracticeLevel = (title, items, color, bg) => {
                if (!items || items.length === 0) return '';
                return `
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: ${color}; margin-bottom: 15px;">${title}</h3>
                        <ul style="list-style-type: none; padding: 0; display: flex; flex-direction: column; gap: 12px;">
                            ${items.map(q => `
                                <li style="padding: 16px 20px; background: ${bg}; border-radius: 12px; font-weight: 500; font-size: 15px; color: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                    ${marked.parseInline(q)}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            };

            practiceHtml += renderPracticeLevel('EASY', aiResponse.PRACTICE.EASY, '#059669', '#d1fae5');
            practiceHtml += renderPracticeLevel('MEDIUM', aiResponse.PRACTICE.MEDIUM, '#d97706', '#fef3c7');
            practiceHtml += renderPracticeLevel('HARD', aiResponse.PRACTICE.HARD, '#dc2626', '#fee2e2');
            
            practiceContainer.innerHTML = practiceHtml;
        }

        // Inform MathJax to process the new dynamically loaded math LaTeX 
        if (window.MathJax) {
            setTimeout(() => {
                MathJax.typesetPromise().catch((err) => console.error("MathJax error:", err));
            }, 100);
        }
    }
}


window.addEventListener("DOMContentLoaded",handleResponse);


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



async function loadVideos() {
    const topicTitle = document.getElementById("topicTitle");
    if (!topicTitle) return;
    
    const sHeading = topicTitle.innerText;
    const vidContainer = document.getElementById("videosSection");
    if (!vidContainer) return;
    
    vidContainer.innerHTML = "";
    const response = await fetch(`https://us-central1-tutorai-5f97d.cloudfunctions.net/YT_VIDEOS?heading=${encodeURIComponent(sHeading)}`);
    const videos = await response.json();
    const heading = document.createElement("h2");
    heading.style.textAlign = "center";
    heading.innerText = "Recommended Videos";
    vidContainer.appendChild(heading);

    videos.forEach(video => {
        const iframe = document.createElement("iframe");
        iframe.classList.add("yt-videos");
        iframe.src = `https://www.youtube.com/embed/${video.id}`;
        iframe.title = video.title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.frameBorder = 1;
        vidContainer.appendChild(iframe);
    });
}

window.addEventListener("DOMContentLoaded", loadVideos);


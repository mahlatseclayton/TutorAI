
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
- ALL TEXT INSIDE THE JSON MUST BE IN FULL UPPERCASE.
- EVEN SENTENCES, HEADINGS, QUESTIONS MUST BE IN CAPS.

STRUCTURE:

{
  "SUBJECT": "${subject.toUpperCase()}",
  "TOPIC": "${topic.toUpperCase()}",
  "GRADE": "${grade.toUpperCase()}",
  "LEVEL": "${level.toUpperCase()}",

  "OVERVIEW": "SHORT INTRODUCTION IN CAPS.",

  "EXPLANATION": "DETAILED STEP BY STEP EXPLANATION IN CAPS.",

  "EXAMPLES": [
    {
      "TITLE": "EXAMPLE 1",
      "SOLUTION": "WORKED SOLUTION IN CAPS WITH STEPS"
    }
  ],


  "PRACTICE": {
    "EASY": ["QUESTION IN CAPS"],
    "MEDIUM": ["QUESTION IN CAPS"],
    "HARD": ["QUESTION IN CAPS"]
  }
}

LEVEL GUIDELINES:
- BEGINNER → SIMPLE DEFINITIONS + SIMPLE EXAMPLES
- INTERMEDIATE → INCLUDE FORMULAS + EXPLANATION
- ADVANCED → INCLUDE DEEP REASONING + PROBLEM SOLVING

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
const startedBtn=document.querySelector("#startedBtn");
if(startedBtn){
startedBtn.addEventListener("click",async(event)=>{
      event.preventDefault();
      startedBtn.disabled = true;
await getTopic();
startedBtn.disabled = false;
});
}
async function handleResponse() {
    const stored = localStorage.getItem("aiResponse");
    
    if (stored) {
        const cleaned = stored.replace(/```json|```/g, '').trim();
        const aiResponse = JSON.parse(cleaned);
        const explanationContent = aiResponse.EXPLANATION;
        const overviewContent = aiResponse.OVERVIEW;
        if(overView &&  aiResponse.OVERVIEW){
                   overView.innerText = overviewContent;
        }
        if(explanation && aiResponse.EXPLANATION){
        explanation.innerText = explanationContent;
        }
        

      const examplesContainer=document.getElementById("examplesContent");
const practiceContainer=document.getElementById("practiceContent");
        if (examplesContainer && aiResponse.EXAMPLES) {
            let examplesHtml = '';
            aiResponse.EXAMPLES.forEach(example => {
                examplesHtml += `
                    <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-top: 0;">${example.TITLE}</h3>
                        <p style="white-space: pre-line; line-height: 1.6;">${example.SOLUTION}</p>
                    </div>
                `;
            });
            examplesContainer.innerHTML = examplesHtml;
        }
        
    
        if (practiceContainer && aiResponse.PRACTICE) {
            let practiceHtml = '';
            
            if (aiResponse.PRACTICE.EASY) {
                practiceHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #27ae60;">EASY</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            ${aiResponse.PRACTICE.EASY.map(q => `
                                <li style="margin-bottom: 10px; padding: 10px; background-color: #e8f5e9; border-radius: 5px;">
                                    ${q}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
            
            if (aiResponse.PRACTICE.MEDIUM) {
                practiceHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #e67e22;">MEDIUM</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            ${aiResponse.PRACTICE.MEDIUM.map(q => `
                                <li style="margin-bottom: 10px; padding: 10px; background-color: #ffeed9; border-radius: 5px;">
                                    ${q}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
            
            if (aiResponse.PRACTICE.HARD) {
                practiceHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #c0392b;">HARD</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            ${aiResponse.PRACTICE.HARD.map(q => `
                                <li style="margin-bottom: 10px; padding: 10px; background-color: #f9e1e1; border-radius: 5px;">
                                    ${q}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
            
            practiceContainer.innerHTML = practiceHtml;
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


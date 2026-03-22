
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } 
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
- DO NOT RETURN PLAIN TEXT OR EXPLANATIONS OUTSIDE JSON.
- ALL LONG TEXT FIELDS MUST USE FORMATTED MARKDOWN.
- FOR MATH & EQUATIONS, USE LATEX ONLY.
- WRAP INLINE MATH IN $...$ AND BLOCK MATH IN $$...$$.
- IMPORTANT: YOU ARE WRITING INSIDE A JSON STRING. YOU MUST DOUBLE ESCAPE BACKSLASHES FOR LATEX (e.g., Use \\\\frac instead of \\frac).
- ESCAPE NEWLINES IN JSON STRINGS AS \\n.
- DO NOT USE RAW NEWLINES INSIDE THE JSON VALUES; USE THE LITERAL \\n SEQUENCE.

STRUCTURE AS VALID JSON:
{
  "SUBJECT": "${subject}",
  "TOPIC": "${topic}",
  "GRADE": "${grade}",
  "LEVEL": "${level}",

  "OVERVIEW": "Markdown intro with math like $E=mc^2$.",

  "EXPLANATION": "Extensive Markdown explaining concepts step-by-step with LaTeX formulas.",

  "EXAMPLES": [
    {
      "TITLE": "Example 1",
      "SOLUTION": "Markdown worked solution with LaTeX."
    }
  ],
  
  "FORMULAS": [
    { "NAME": "Formula Name", "CONTENT": "$ LaTeX $" }
  ],

  "PRACTICE": {
    "EASY": [
      { "QUESTION": "$ 2+2=? $", "ANSWER": "4", "SOLUTION_EXPLANATION": "2 plus 2 equals 4." }
    ],
    "MEDIUM": [
      { "QUESTION": "$ x^2=4, x=? $", "ANSWER": "2", "SOLUTION_EXPLANATION": "The square root of 4 is 2." }
    ],
    "HARD": [
      { "QUESTION": "Complex question", "ANSWER": "result", "SOLUTION_EXPLANATION": "Detailed solution steps here." }
    ]
  }
}

LEVEL GUIDELINES:
- BEGINNER → Simple definitions + simple examples.
- INTERMEDIATE → Include formulas + deep explanation.
- ADVANCED → Include deep reasoning + detailed proofs.

TOPIC: ${topic}
SUBJECT: ${subject}
GRADE: ${grade}
LEVEL: ${level}
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
    let stored = localStorage.getItem("aiResponse");
    
    if (stored) {
        try {
            // Clean up any potential Markdown code fences Gemini might wrap the JSON in
            let cleaned = stored.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```[a-z]*\n/i, "").replace(/\n```$/m, "");
            }
            
            const aiResponse = JSON.parse(cleaned);
            
            // marked.parse will convert the Markdown into HTML
            if(overView && aiResponse.OVERVIEW){
                overView.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>${marked.parse(aiResponse.OVERVIEW)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Overview', '${aiResponse.OVERVIEW.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }
            if(explanation && aiResponse.EXPLANATION){
                explanation.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>${marked.parse(aiResponse.EXPLANATION)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Detailed Explanation', '${aiResponse.EXPLANATION.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }

            const examplesContainer = document.getElementById("examplesContent");
            const practiceContainer = document.getElementById("practiceContent");
            
            if (examplesContainer && aiResponse.EXAMPLES) {
                let examplesHtml = '';
                aiResponse.EXAMPLES.forEach((example, idx) => {
                    examplesHtml += `
                        <div style="margin-bottom: 20px; padding: 25px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px; margin-bottom: 15px;">
                              <h3 style="color: #1f2937; margin: 0;">${example.TITLE}</h3>
                              <button class="explainSecBtn" onclick="explainSection('${example.TITLE}', '${example.SOLUTION.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                            </div>
                            <div class="md-content" style="line-height: 1.7; font-size: 15px; color: #374151;">${marked.parse(example.SOLUTION)}</div>
                        </div>
                    `;
                });
                examplesContainer.innerHTML = examplesHtml;
            }
        
            if (practiceContainer && aiResponse.PRACTICE) {
                let practiceHtml = '';
                
                const renderPracticeLevel = (levelName, items, color, bg) => {
                    if (!items || items.length === 0) return '';
                    return `
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: ${color}; margin-bottom: 15px;">${levelName}</h3>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${items.map((q, idx) => `
                                    <div class="practiceCard" style="padding: 20px; background: ${bg}; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02);">
                                        <div style="font-weight: 500; font-size: 16px; color: ${color}; margin-bottom: 12px;">
                                            ${marked.parseInline(q.QUESTION || q)}
                                        </div>
                                        <div class="quizInputGroup">
                                            <div class="quizInputRow" id="inputRow-${levelName}-${idx}">
                                                <input type="text" placeholder="Your answer..." id="ans-${levelName}-${idx}">
                                                <button class="checkBtn" onclick="checkAnswer('${levelName}', ${idx}, '${q.ANSWER}', '${(q.SOLUTION_EXPLANATION || "").replace(/'/g, "\\'").replace(/\n/g, " ")}')">Check</button>
                                            </div>
                                            <div id="feedback-${levelName}-${idx}" class="feedbackMsg"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                };

                practiceHtml += renderPracticeLevel('EASY', aiResponse.PRACTICE.EASY, '#059669', '#d1fae5');
                practiceHtml += renderPracticeLevel('MEDIUM', aiResponse.PRACTICE.MEDIUM, '#d97706', '#fef3c7');
                practiceHtml += renderPracticeLevel('HARD', aiResponse.PRACTICE.HARD, '#dc2626', '#fee2e2');
                
                practiceContainer.innerHTML = practiceHtml;
            }

            // Render Formulas Sidebar
            const formulaContainer = document.getElementById("formulaContent");
            if (formulaContainer && aiResponse.FORMULAS) {
                formulaContainer.innerHTML = aiResponse.FORMULAS.map(f => `
                    <div style="margin-bottom: 20px; background: rgba(255,255,255,0.4); padding: 15px; border-radius: 12px; border-left: 4px solid #6366f1;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: #4338ca;">${f.NAME}</h4>
                        <div style="font-size: 1.1rem;">${marked.parseInline(f.CONTENT)}</div>
                    </div>
                `).join('');
            }

            // Inform MathJax to process the new dynamically loaded math LaTeX 
            if (window.MathJax) {
                setTimeout(() => {
                    MathJax.typesetPromise().catch((err) => console.error("MathJax error:", err));
                }, 100);
            }
        } catch (e) {
            console.error("Failed to parse AI response:", e);
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

// --- New Features Logic ---

// 1. Interactive Quiz Logic
window.checkAnswer = function(level, index, correctAns, solutionExpl) {
    const input = document.getElementById(`ans-${level}-${index}`);
    const feedback = document.getElementById(`feedback-${level}-${index}`);
    const inputRow = document.getElementById(`inputRow-${level}-${index}`);
    const userAns = input.value.trim().toLowerCase();
    
    if (userAns === correctAns.toLowerCase()) {
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Great job.';
        feedback.className = 'feedbackMsg correct';
        input.style.borderColor = '#10b981';
    } else {
        feedback.innerHTML = `
            <div style="margin-top: 10px; padding: 15px; background: rgba(239, 68, 68, 0.05); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.1);">
                <p style="color: #ef4444; font-weight: 700; margin: 0 0 8px 0;"><i class="fas fa-times-circle"></i> Not quite.</p>
                <p style="color: #374151; font-weight: 400; margin: 0 0 12px 0; line-height: 1.5;">${solutionExpl || "No explanation available."}</p>
                <button class="checkBtn" style="background: #374151;" onclick="tryAgain('${level}', ${index})">Try Again</button>
            </div>
        `;
        feedback.className = 'feedbackMsg';
        inputRow.style.display = 'none';
    }
};

window.tryAgain = function(level, index) {
    const input = document.getElementById(`ans-${level}-${index}`);
    const feedback = document.getElementById(`feedback-${level}-${index}`);
    const inputRow = document.getElementById(`inputRow-${level}-${index}`);
    
    input.value = "";
    input.style.borderColor = 'rgba(0,0,0,0.1)';
    feedback.innerHTML = "";
    inputRow.style.display = 'flex';
};

// 1.5 Explain Section Logic
window.explainSection = function(sectionName, sectionContent) {
    const chatBubble = document.getElementById("aiChatBubble");
    const chatToggle = document.getElementById("chatToggle");
    
    // Open chat
    chatBubble.style.display = "flex";
    
    // Add context message to chat
    const msg = `Can you explain the "${sectionName}" section to me? Here is the content: ${sectionContent}`;
    
    // Trigger chat handling
    document.getElementById("chatInput").value = msg;
    handleChat();
};

// 2. Theme Toggle Logic
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
    
    // Initial check
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// 3. Mark as Mastered Logic
const markBtn = document.getElementById("markMastered");
if (markBtn) {
    markBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please sign in to track your progress.");
            return;
        }
        
        const topic = localStorage.getItem("topic");
        const subject = localStorage.getItem("subject");
        
        try {
            markBtn.disabled = true;
            markBtn.innerText = "Mastering...";
            
            await setDoc(doc(db, "users", user.uid, "progress", topic), {
                subject: subject,
                masteredAt: new Date(),
                status: "mastered"
            }, { merge: true });
            
            markBtn.innerHTML = '<i class="fas fa-check"></i> Mastered!';
            markBtn.style.background = "#10b981";
            markBtn.style.color = "white";
            
            // Add points (gamification)
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                points: (window.userPoints || 0) + 50
            }, { merge: true });
            
            alert("Congratulations! You earned 50 points.");
        } catch (error) {
            console.error("Error marking as mastered:", error);
            markBtn.disabled = false;
            markBtn.innerText = "Mark as Mastered";
        }
    });
}

// 4. PDF Export Logic
const pdfBtn = document.getElementById("exportPdf");
if (pdfBtn) { 
    pdfBtn.addEventListener("click", () => {
        const element = document.getElementById("learningContent");
        const topic = localStorage.getItem("topic") || "Lesson";
        
        const opt = {
            margin: 1,
            filename: `${topic}_Summary.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    });
}

// 5. AI Chat Bubble Logic
const chatToggle = document.getElementById("chatToggle");
const chatBubble = document.getElementById("aiChatBubble");
const closeChat = document.getElementById("closeChat");
const sendChat = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

if (chatToggle) {
    chatToggle.addEventListener("click", () => {
        chatBubble.style.display = chatBubble.style.display === "flex" ? "none" : "flex";
    });
}

if (closeChat) {
    closeChat.addEventListener("click", () => {
        chatBubble.style.display = "none";
    });
}

async function handleChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    
    // Add user message
    const userDiv = document.createElement("p");
    userDiv.className = "userMsg";
    userDiv.innerText = msg;
    chatMessages.appendChild(userDiv);
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate/Call AI response
    const botDiv = document.createElement("p");
    botDiv.className = "botMsg";
    botDiv.innerText = "Thinking...";
    chatMessages.appendChild(botDiv);
    
    try {
        const topic = localStorage.getItem("topic");
        const response = await fetch(
            "https://us-central1-tutorai-5f97d.cloudfunctions.net/topicTutor",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Context: You are tutoring on ${topic}. The user asks: ${msg}. Provide a short, helpful explanation.`
                })
            }
        );
        
        const data = await response.json();
        botDiv.innerText = data.aiResponse || "I'm sorry, I couldn't process that.";
    } catch (error) {
        botDiv.innerText = "Error connecting to TutorAI.";
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendChat) sendChat.addEventListener("click", handleChat);
if (chatInput) chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleChat();
});

// Fetch user points on load
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            window.userPoints = data.points || 0;
            const ptsText = document.getElementById("userPointsText");
            if (ptsText) ptsText.innerText = window.userPoints;
        }
    }
});


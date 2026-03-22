
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
async function validateTopic(topic, subject) {
    const prompt = `
        Does the TOPIC: "${topic}" belong to the SUBJECT: "${subject}"?
        - If YES, return exactly "VALID".
        - If NO, suggest the most likely correct subject for this topic (e.g., "Life Science" for "Reproduction").
        - RETURN ONLY ONE WORD (either VALID or the suggested SUBJECT).
    `;
    
    try {
        const res = await fetch("https://us-central1-tutorai-5f97d.cloudfunctions.net/topicTutor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt })
        });
        const data = await res.json();
        return data.aiResponse.trim();
    } catch (e) {
        console.error("Validation error:", e);
        return "VALID";
    }
}

async function getTopic() {
    const gradeElem = document.getElementById("gradeId");
    const subjectElem = document.getElementById("subjectId");
    const topicElem = document.getElementById("topicId");
    const levelElem = document.getElementById("levelId");

    if (!gradeElem || !subjectElem || !topicElem || !levelElem) {
        return alert("Error: Form elements not found!");
    }

    const grade = gradeElem.value;
    const subject = subjectElem.value;
    const topic = topicElem.value.trim();
    const level = levelElem.value;

    if (!topic) return alert("Please enter a topic!");

    const startedBtn = document.getElementById("startedBtn");
    const originalText = startedBtn?.innerText || "Start Learning";
    if (startedBtn) {
        startedBtn.disabled = true;
        startedBtn.innerText = "Validating Topic...";
    }
    
    const loader = document.getElementById("loaderOverlay");
    if (loader) loader.style.display = "flex";

    try {
        // 1. Topic Validation
        let validation = "VALID";
        try {
            if (startedBtn) startedBtn.innerText = "Checking Subject...";
            validation = await validateTopic(topic, subject);
        } catch (e) {
            console.warn("Validation skipped due to error:", e);
        }

        if (validation && validation !== "VALID" && validation.toUpperCase() !== subject.toUpperCase()) {
            if (loader) loader.style.display = "none";
            const retry = confirm(`Wait! "${topic}" usually belongs to "${validation}". Do you want to switch to "${validation}" instead?`);
            if (retry) {
                document.getElementById("subjectId").value = validation;
                if (startedBtn) {
                    startedBtn.disabled = false;
                    startedBtn.innerText = originalText;
                }
                return;
            }
        }

        if (loader) loader.style.display = "flex";
        if (startedBtn) startedBtn.innerText = "Consulting AI...";

        // 2. Check Firestore Cache
        const cacheID = `${grade}_${subject}_${topic}_${level}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        const cacheRef = doc(db, "topicsCache", cacheID);
        
        let cachedData = null;
        try {
            const cacheSnap = await getDoc(cacheRef);
            if (cacheSnap.exists()) {
                cachedData = cacheSnap.data().response;
            }
        } catch (e) {
            console.warn("Cache check failed:", e);
        }

        if (cachedData) {
            console.log("Loading from cache...");
            localStorage.setItem("aiResponse", JSON.stringify(cachedData));
        } else {
            console.log("No cache found. Calling AI...");
            const fullPrompt = `
YOU ARE AN ADVANCED EDUCATIONAL TUTOR AI.

GENERATE STRUCTURED LEARNING CONTENT FOR:
TOPIC: ${topic}
SUBJECT: ${subject}
GRADE: ${grade}
LEVEL: ${level}

STRICT JSON RULES:
- RETURN ONLY VALID JSON.
- USE $...$ FOR INLINE MATH AND $$...$$ FOR BLOCK MATH.
- USE LATEX FOR ALL MATHEMATICAL EXPRESSIONS.
- USE DOUBLE NEWLINES (\\\\n\\\\n) FOR PARAGRAPHS.
- ENSURE ALL JSON STRINGS ARE PROPERLY ESCAPED.

STRUCTURE:
{
  "SUBJECT": "${subject}",
  "TOPIC": "${topic}",
  "GRADE": "${grade}",
  "LEVEL": "${level}",
  "OVERVIEW": "...",
  "EXPLANATION": "...",
  "EXAMPLES": [
    { "TITLE": "Example 1", "PROBLEM": "...", "SOLUTION_STEPS": "..." }
  ],
  "FORMULAS": [
    { "NAME": "Key Concept", "CONTENT": "..." }
  ],
  "PRACTICE": {
    "EASY": [{ "QUESTION": "q", "ANSWER": "a", "SOLUTION_EXPLANATION": "expl" }],
    "MEDIUM": [{ "QUESTION": "q", "ANSWER": "a", "SOLUTION_EXPLANATION": "expl" }],
    "HARD": [{ "QUESTION": "q", "ANSWER": "a", "SOLUTION_EXPLANATION": "expl" }]
  }
}
`;
            const res = await fetch("https://us-central1-tutorai-5f97d.cloudfunctions.net/topicTutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: fullPrompt })
            });
            
            if (!res.ok) throw new Error(`AI Gateway Error ${res.status}`);
            const data = await res.json();
            
            if (!data || !data.aiResponse) throw new Error("The AI didn't provide a lesson. Try a different topic.");

            let cleaned = data.aiResponse.replace(/```json|```/g, "").trim();
            const parsedResponse = JSON.parse(cleaned);
            
            localStorage.setItem("aiResponse", cleaned);
            
            // 3. Save to Cache (Awaiting to ensure it's sent before redirect)
            try {
                await setDoc(cacheRef, { 
                    response: parsedResponse, 
                    timestamp: new Date(),
                    topic: topic,
                    subject: subject
                }, { merge: true });
                console.log("Successfully cached to Firestore:", cacheID);
            } catch (err) {
                console.warn("Firestore cache save failed:", err);
            }
        }

        localStorage.setItem("grade", grade);
        localStorage.setItem("subject", subject);
        localStorage.setItem("topic", topic);
        localStorage.setItem("level", level);
        window.location.href = "solutionPage.html";
        
    } catch (error) {
        console.error("Critical Failure in getTopic:", error);
        alert(`TutorAI Error: ${error.message}. Please try again in few seconds.`);
    } finally {
        if (startedBtn) {
            startedBtn.disabled = false;
            startedBtn.innerText = originalText;
        }
        if (loader) loader.style.display = "none";
    }
}

const startedBtn = document.getElementById("startedBtn");
if (startedBtn) {
    startedBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await getTopic();
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
                const cleanOverview = aiResponse.OVERVIEW.replace(/\\n/g, '\n');
                overView.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="lesson-body">${marked.parse(cleanOverview)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Overview', '${cleanOverview.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }
            if(explanation && aiResponse.EXPLANATION){
                const cleanExpl = aiResponse.EXPLANATION.replace(/\\n/g, '\n');
                explanation.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="lesson-body">${marked.parse(cleanExpl)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Detailed Explanation', '${cleanExpl.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }

            const examplesContainer = document.getElementById("examplesContent");
            const practiceContainer = document.getElementById("practiceContent");
            
            if (examplesContainer && aiResponse.EXAMPLES) {
                let examplesHtml = '';
                aiResponse.EXAMPLES.forEach((example, idx) => {
                    examplesHtml += `
                        <div class="exampleCard">
                            <div class="exampleHeader">
                                <h3 style="margin: 0;">${example.TITLE}</h3>
                                <button class="explainSecBtn" onclick="explainSection('${example.TITLE}', '${(example.PROBLEM + ' ' + (example.SOLUTION_STEPS || example.SOLUTION || '')).replace(/'/g, "\\'").replace(/\n/g, " ")}')">
                                    <i class="fas fa-magic"></i> Explain
                                </button>
                            </div>
                            <div class="exampleBody">
                                <div class="exampleProblem">
                                    <strong>Problem:</strong>
                                    <div>${marked.parse(example.PROBLEM || "See above.")}</div>
                                </div>
                                <div class="exampleSolution">
                                    <strong>Solution:</strong>
                                    <div>${marked.parse(example.SOLUTION_STEPS || example.SOLUTION || "No solution provided.")}</div>
                                </div>
                            </div>
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

            // Render Key Concepts (Simplified Vertical List)
            const formulaContainer = document.getElementById("formulaContent");
            if (formulaContainer && aiResponse.FORMULAS) {
                formulaContainer.innerHTML = aiResponse.FORMULAS.map(f => `
                    <div class="concept-item">
                        <span class="concept-name">${f.NAME}</span>
                        <span class="concept-value">${f.CONTENT}</span>
                    </div>
                `).join('');
            }

            // Robust MathJax trigger
            triggerMathJax();
        } catch (e) {
            console.error("Failed to parse AI response:", e);
        }
    }
}

// Helper to trigger MathJax multiple times to ensure everything is rendered
function triggerMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        console.log("Triggering MathJax...");
        // Call immediately and again after a short delay
        MathJax.typesetPromise().catch(err => console.error("MathJax error:", err));
        setTimeout(() => {
            MathJax.typesetPromise().catch(err => console.warn("MathJax retry failed:", err));
        }, 1000);
    } else {
        // If MathJax isn't loaded yet, try again in a bit
        console.log("MathJax not ready, waiting...");
        setTimeout(triggerMathJax, 500);
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
    const vidContainer = document.getElementById("videosSection");
    if (!vidContainer || !topicTitle) return;
    
    const sHeading = topicTitle.innerText;
    console.log("Fetching fresh videos from YouTube API...");
    
    try {
        const response = await fetch(`https://us-central1-tutorai-5f97d.cloudfunctions.net/YT_VIDEOS?heading=${encodeURIComponent(sHeading)}`);
        const videos = await response.json();
        renderVideos(videos, vidContainer);
    } catch (err) {
        console.error("Video fetch error:", err);
    }
}

function renderVideos(videos, container) {
    container.innerHTML = "";
    const heading = document.createElement("h2");
    heading.style.textAlign = "center";
    heading.innerText = "Recommended Videos";
    container.appendChild(heading);

    videos.forEach(video => {
        const iframe = document.createElement("iframe");
        iframe.classList.add("yt-videos");
        iframe.src = `https://www.youtube.com/embed/${video.id}`;
        iframe.title = video.title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.frameBorder = 1;
        container.appendChild(iframe);
    });
}

window.addEventListener("DOMContentLoaded", loadVideos);

// --- New Features Logic ---

// 1. Interactive Quiz Logic
window.checkAnswer = async function(level, index, correctAns, solutionExpl) {
    const input = document.getElementById(`ans-${level}-${index}`);
    const feedback = document.getElementById(`feedback-${level}-${index}`);
    const inputRow = document.getElementById(`inputRow-${level}-${index}`);
    const checkBtn = inputRow.querySelector(".checkBtn");
    const userAns = input.value.trim().toLowerCase();
    
    if (!userAns) return;

    // Show loading state
    const originalBtnText = checkBtn.innerText;
    checkBtn.innerText = "Verifying...";
    checkBtn.disabled = true;

    try {
        const topic = localStorage.getItem("topic");
        const prompt = `
          QUESTON: ${document.querySelector(`#ans-${level}-${index}`).closest('.practiceCard').querySelector('div').innerText}
          EXPECTED ANSWER: ${correctAns}
          USER ANSWER: ${userAns}

          TASK: Determine if the user's answer is CONCEPTUALLY CORRECT even if worded differently.
          RULES:
          - RETURN ONLY VALID JSON: {"result": "CORRECT" or "INCORRECT", "explanation": "Short feedback"}
          - Be lenient on theory questions.
          - If it's a math question, be strict on the value but lenient on formatting.
        `;

        const response = await fetch(
            "https://us-central1-tutorai-5f97d.cloudfunctions.net/topicTutor",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: prompt })
            }
        );
        
        const data = await response.json();
        let aiResult = { result: "INCORRECT", explanation: solutionExpl };
        
        try {
            // Parse the AI's JSON response from within the text
            const cleaned = data.aiResponse.replace(/```json|```/g, "").trim();
            aiResult = JSON.parse(cleaned);
        } catch (e) {
            // Fallback if AI doesn't return clean JSON
            if (data.aiResponse.includes("CORRECT")) aiResult.result = "CORRECT";
        }

        if (aiResult.result === "CORRECT") {
            feedback.innerHTML = `<i class="fas fa-check-circle"></i> ${aiResult.explanation || "Correct! Great job."}`;
            feedback.className = 'feedbackMsg correct';
            input.style.borderColor = '#10b981';
            
            // award points
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                window.userPoints = (window.userPoints || 0) + 10;
                setDoc(userRef, { points: window.userPoints }, { merge: true })
                    .then(() => {
                        const scoreEl = document.getElementById("userPoints");
                        if (scoreEl) scoreEl.innerText = window.userPoints;
                    })
                    .catch(e => console.error("Points update failed:", e));
            }
        } else {
            feedback.innerHTML = `
                <div style="margin-top: 10px; padding: 15px; background: rgba(239, 68, 68, 0.05); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.1);">
                    <p style="color: #ef4444; font-weight: 700; margin: 0 0 8px 0;"><i class="fas fa-times-circle"></i> ${aiResult.explanation || "Not quite."}</p>
                    <div style="color: #374151; font-weight: 400; margin: 0 0 12px 0; line-height: 1.5;">${marked.parse(solutionExpl || "")}</div>
                    <button class="checkBtn" style="background: #374151;" onclick="tryAgain('${level}', ${index})">Try Again</button>
                </div>
            `;
            feedback.className = 'feedbackMsg';
            inputRow.style.display = 'none';
        }
    } catch (error) {
        console.error("AI Verification error:", error);
        // Fallback to strict string match if AI fails
        if (userAns === correctAns.toLowerCase()) {
            feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct!';
            feedback.className = 'feedbackMsg correct';
        } else {
            feedback.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect. Try again.';
            feedback.className = 'feedbackMsg incorrect';
        }
    } finally {
        checkBtn.innerText = originalBtnText;
        checkBtn.disabled = false;
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
            const ptsText = document.getElementById("userPoints");
            if (ptsText) ptsText.innerText = window.userPoints;
        }
    }
});


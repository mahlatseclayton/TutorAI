
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, 
     GoogleAuthProvider, 
     signInWithPopup,
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         sendPasswordResetEmail,
         onAuthStateChanged, 
         updateProfile,
         sendEmailVerification, 
         signOut 
       } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFunctions, httpsCallable } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

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
const functions = getFunctions(app);

export { auth, db };




// Helper to trigger MathJax and return a promise that resolves when done
async function triggerMathJax(retries = 10) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        console.log("Triggering MathJax...");
        try {
            await MathJax.typesetPromise();
            // Optional: Second pass for safety after layout shifts
            await new Promise(resolve => setTimeout(resolve, 500));
            await MathJax.typesetPromise();
        } catch (err) {
            console.error("MathJax error:", err);
        }
    } else {
        if (retries <= 0) {
            console.log("MathJax failed to load after retries.");
            return;
        }
        console.log(`MathJax not ready, waiting... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return triggerMathJax(retries - 1);
    }
}

// Validation is now handled via HTML5 required attributes and setCustomValidity
// define id's for the input fields and buttons and add event listeners to them
const overView=document.getElementById("overviewContent");
const explanation=document.getElementById("explanationContent");




// Initialize Firebase

// the export allows us to use the method outside this file and the async to allow the program to wait a bit
// Signup logic via form submit
const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const grade = document.getElementById("grade").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const cpassword = document.getElementById("cpassword").value;
        const cpassInp = document.getElementById("cpassword");
        const passInp = document.getElementById("password");

        cpassInp.setCustomValidity("");
        passInp.setCustomValidity("");

        if (password !== cpassword) {
            cpassInp.setCustomValidity("Passwords do not match");
            signUpForm.reportValidity();
            return;
        }


        const signUpBtn = document.getElementById("signUpBtn");
        signUpBtn.disabled = true;
        signUpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

        try {
            // reCAPTCHA verification (v2)
            const captchaToken = grecaptcha.getResponse();
            if (!captchaToken) {
                alert("Please check the 'I'm not a robot' box.");
                signUpBtn.disabled = false;
                signUpBtn.innerHTML = 'Create Account <i class="fas fa-user-plus" style="margin-left: 10px;"></i>';
                return;
            }

            const verifyCaptcha = httpsCallable(functions, 'verifyCaptcha');
            const captchaResult = await verifyCaptcha({ token: captchaToken });

            if (!captchaResult.data.success) {
                alert("reCAPTCHA verification failed. Please try again.");
                grecaptcha.reset();
                signUpBtn.disabled = false;
                signUpBtn.innerHTML = 'Create Account <i class="fas fa-user-plus" style="margin-left: 10px;"></i>';
                return;
            }

            signUpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Send verification email
            await sendEmailVerification(user);
            
            await setDoc(doc(db, "users", user.uid), {
                name, grade, email, createdAt: new Date()
            });
            
            // Sign out immediately after registration to force verification
            await signOut(auth);
            
            alert("Success: Account successfully created! A verification email has been sent to your inbox. Please verify your email before signing in.");
            window.location.href = "signIn.html";
        } catch (error) {
            alert("Error creating account: " + error.message);
            console.error("Signup error:", error);
        } finally {
            signUpBtn.disabled = false;
            signUpBtn.innerHTML = 'Create Account <i class="fas fa-user-plus" style="margin-left: 10px;"></i>';
        }
    });
}
// Login logic via form submit
const signInForm = document.getElementById("signInForm");
if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const signInBtn = document.getElementById("signInBtn");
        signInBtn.disabled = true;
        signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

        try {
            // reCAPTCHA verification (v2)
            const captchaToken = grecaptcha.getResponse();
            if (!captchaToken) {
                alert("Please check the 'I'm not a robot' box.");
                signInBtn.disabled = false;
                signInBtn.innerHTML = 'Sign In <i class="fas fa-sign-in-alt" style="margin-left: 10px;"></i>';
                return;
            }

            const verifyCaptcha = httpsCallable(functions, 'verifyCaptcha');
            const captchaResult = await verifyCaptcha({ token: captchaToken });

            if (!captchaResult.data.success) {
                alert("reCAPTCHA verification failed. Please try again.");
                grecaptcha.reset();
                signInBtn.disabled = false;
                signInBtn.innerHTML = 'Sign In <i class="fas fa-sign-in-alt" style="margin-left: 10px;"></i>';
                return;
            }

            signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging In...';
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
                alert("Account not verified: Please check your email and verify your account before logging in.");
                await signOut(auth);
                return;
            }

            window.location.href = "mainPage.html";
        } catch (error) {
            alert("Log-in failed. Please check your email or password.");
            console.error("Login error:", error.message);
        } finally {
            signInBtn.disabled = false;
            signInBtn.innerHTML = 'Sign In <i class="fas fa-sign-in-alt" style="margin-left: 10px;"></i>';
        }
    });
}

const googleProvider = new GoogleAuthProvider();

const googleSignInBtn = document.getElementById("googleSignInBtn");

if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // New user — create a document
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    createdAt: new Date()
                });
            }

            alert(`Welcome ${user.displayName}!`);
            window.location.href = "mainPage.html"; // redirect after login

        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("Google Sign-In failed. Try again.");
        }
    });
}

// forgot password funtionality
const forgotBtn = document.getElementById("forgotBtn");
if (forgotBtn) {
    forgotBtn.addEventListener("click", async () => {
        const emailInput = document.getElementById("email");
        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            return;
        }
        const email = emailInput.value;
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Reset password link sent to your email.");
        } catch (error) {
            alert("Error sending reset link: " + error.message);
            console.error(error);
        }
    });
}

// Resend verification email functionality
const resendBtn = document.getElementById("resendBtn");
if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter both your email and password to resend the verification email.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                alert("This account is already verified. You can sign in now.");
                window.location.href = "mainPage.html";
            } else {
                await sendEmailVerification(user);
                alert("Verification email has been resent! Please check your inbox.");
                await signOut(auth);
            }
        } catch (error) {
            alert("Error resending verification: " + error.message);
            console.error("Resend error:", error);
        }
    });
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
        const res = await fetch("https://topictutor-xaudhnk2aq-uc.a.run.app", {
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
    let isNavigating = false;
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
            // --- NEW: Topic Validation Step ---
            const validatePrompt = `Verify if the topic "${topic}" is relevant to the subject "${subject}" for Grade ${grade}. 
            Respond ONLY in JSON: {"valid": true, "reason": "..."} or {"valid": false, "reason": "...", "suggested_subject": "..."}`;
            
            try {
                const vRes = await fetch("https://topictutor-xaudhnk2aq-uc.a.run.app", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: validatePrompt })
                });
                const vData = await vRes.json();
                const vClean = vData.aiResponse.replace(/```json|```/g, "").trim();
                const vResult = JSON.parse(vClean);
                
                if (!vResult.valid) {
                    const proceed = confirm(`MzansiEd Suggestion: ${vResult.reason}. This topic might better belong in "${vResult.suggested_subject}". Do you want to continue anyway?`);
                    if (!proceed) {
                        return; // Stop the generation
                    }
                }
            } catch (vErr) {
                console.warn("Topic validation failed, skipping...", vErr);
            }

            const fullPrompt = `
YOU ARE AN ADVANCED EDUCATIONAL TUTOR AI.

GENERATE STRUCTURED LEARNING CONTENT FOR:
TOPIC: ${topic}
SUBJECT: ${subject}
GRADE: ${grade}
LEVEL: ${level}

GENERATE 3 DIVERSE WORKED EXAMPLES (Varying Difficulty).
STRICT JSON RULES:
- COVER ALL CORE CONCEPTS, COMMON EDGE CASES, AND PITFALLS.
- PROVIDE A "DEEP_DIVE" ARRAY WITH 2-4 SUBTOPICS TO COMPREHENSIVELY COVER THE WHOLE TOPIC INDEPTH.
- FOR "BEGINNER": Keep the entire scope of the topic but use extremely simple language/analogies.
- DO NOT TRUNCATE THE JSON. BE CONCISE TO FIT TOKEN LIMITS IF NEEDED.
- RETURN ONLY VALID JSON.
- USE $...$ FOR ALL MATH (INLINE AND BLOCK).
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
  "DEEP_DIVE": [
    { "SUBTOPIC_TITLE": "...", "CONTENT": "Detailed deep dive explanation of this specific subtopic, breaking it down thoroughly." }
  ],
  "SUMMARY": "Concise bullet points recap.",
  "VOCABULARY": [
    { "TERM": "Word", "DEFINITION": "Definition" }
  ],
  "EXAMPLES": [
    { "TITLE": "Example 1", "PROBLEM": "...", "SOLUTION_STEPS": "..." },
    { "TITLE": "Example 2", "PROBLEM": "...", "SOLUTION_STEPS": "..." },
    { "TITLE": "Example 3", "PROBLEM": "...", "SOLUTION_STEPS": "..." }
  ],
  "APPLICATIONS": [
    { "TITLE": "Field/Use", "DESCRIPTION": "..." }
  ],
  "FORMULAS": [
    { "NAME": "Key Concept", "CONTENT": "..." }
  ],
  "PITFALLS": [
    { "TITLE": "Expert Insight or Common Pitfall", "DESCRIPTION": "..." }
  ]
}
- ALL BACKSLASHES MUST BE ESCAPED (e.g. \\\\frac, \\\\theta).
- NEVER RETURN A SINGLE BACKSLASH UNLESS IT IS FOR LATEX ($...$).
- FOR PLAIN TEXT, DO NOT USE BACKSLASHES (\\) AS LINE BREAKS. USE \\\\n INSTEAD.
- ENSURE ALL JSON STRINGS ARE PROPERLY ESCAPED.
`;
            const res = await fetch("https://topictutor-xaudhnk2aq-uc.a.run.app", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: fullPrompt })
            });
            
            if (!res.ok) throw new Error(`AI Gateway Error ${res.status}`);
            const data = await res.json();
            
            if (!data || !data.aiResponse) throw new Error("The AI didn't provide a lesson. Try a different topic.");

            // --- Robust JSON Extraction & Repair ---
            let rawResponse = data.aiResponse;
            let cleaned = rawResponse;
            
            // 1. Extract JSON block (find first { and last })
            const startIdx = rawResponse.indexOf('{');
            const endIdx = rawResponse.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                cleaned = rawResponse.substring(startIdx, endIdx + 1);
            }

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleaned);
            } catch (pErr) {
                console.warn("Standard JSON parse failed, attempting high-resilience repair...", pErr);
                
                // 1. High-Resilience Repair (Backslashes & Newlines)
                const repaired = cleaned
                    .replace(/\n/g, " ") // Remove literal newlines that break strings
                    .replace(/\\/g, "\\\\") 
                    .replace(/\\\\(["\\\/bfnrtu])/g, "\\$1");
                
                try {
                    parsedResponse = JSON.parse(repaired);
                    cleaned = repaired; 
                    console.log("JSON Deep Repair successful!");
                } catch (retryErr) {
                    console.warn("Deep Repair failed, attempting Last Resort Regex Recovery...");
                    
                    // 2. Last Resort Regex Recovery (Scavenge fields from raw text)
                    try {
                        const scavenge = (field) => {
                            const regex = new RegExp(`"${field}"\\s*:\\s*"(.*?)"(?=\\s*,|\\s*})`, 's');
                            const match = cleaned.match(regex);
                            return match ? match[1] : "";
                        };

                        const scavengeArray = (field) => {
                           const regex = new RegExp(`"${field}"\\s*:\\s*\\[(.*?)\\](?=\\s*,|\\s*})`, 's');
                           const match = cleaned.match(regex);
                           if (!match) return [];
                           try { return JSON.parse(`[${match[1]}]`); } catch(e) { return []; }
                        };

                        parsedResponse = {
                            SUBJECT: scavenge("SUBJECT"),
                            TOPIC: scavenge("TOPIC"),
                            OVERVIEW: scavenge("OVERVIEW"),
                            SUMMARY: scavenge("SUMMARY"),
                            VOCABULARY: scavengeArray("VOCABULARY"),
                            APPLICATIONS: scavengeArray("APPLICATIONS"),
                            EXPLANATION: scavenge("EXPLANATION"),
                            DEEP_DIVE: scavengeArray("DEEP_DIVE"),
                            EXAMPLES: scavengeArray("EXAMPLES"),
                            FORMULAS: scavengeArray("FORMULAS"),
                            PITFALLS: scavengeArray("PITFALLS")
                        };
                        
                        if (!parsedResponse.OVERVIEW && !parsedResponse.EXPLANATION) {
                            throw new Error("Regex recovery failed to find core content.");
                        }
                        console.log("Last Resort Regex Recovery successful!");
                    } catch (finalErr) {
                        console.error("All recovery attempts failed:", finalErr);
                        throw new Error("MzansiEd received a complex response it couldn't decode. Please try a slightly different topic or level.");
                    }
                }
            }
            
            localStorage.setItem("aiResponse", JSON.stringify(parsedResponse));
            
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
        
        isNavigating = true;
        window.location.href = "solutionPage.html";
        
    } catch (error) {
        console.error("Critical Failure in getTopic:", error);
        alert(`MzansiEd Error: ${error.message}. Please try again in few seconds.`);
    } finally {
        if (!isNavigating) {
            if (startedBtn) {
                startedBtn.disabled = false;
                startedBtn.innerText = originalText;
            }
            if (loader) loader.style.display = "none";
        }
    }
}

// Lesson generator logic via form submit
const tutorForm = document.getElementById("tutorForm");
if (tutorForm) {
    tutorForm.addEventListener("submit", async (e) => {
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
            
            // --- Cleanup stray backslashes often added by AI as line-breaks ---
            // safeStr: converts ANY value to a string — prevents TypeError when
            // the AI / Firestore returns an object or array for a text field.
            const safeStr = (val) => {
                if (val == null) return "";
                if (typeof val === "string") return val;
                if (typeof val === "object") {
                    // Flatten arrays to newline-joined text; stringify objects
                    if (Array.isArray(val)) return val.map(safeStr).join("\n");
                    // Some AI responses wrap fields in { text: "..." }
                    if (val.text) return String(val.text);
                    if (val.content) return String(val.content);
                    if (val.value) return String(val.value);
                    return JSON.stringify(val);
                }
                return String(val);
            };

            const sanitize = (text) => {
                const str = safeStr(text);
                if (!str) return "";
                return str
                    .replace(/\\(\s|$)/g, " ")
                    .replace(/\\\\n/g, "\n")
                    .replace(/\\n/g, "\n");
            };

            // marked.parse will convert the Markdown into HTML
            if(typeof marked !== 'undefined' && overView && aiResponse.OVERVIEW){
                const cleanOverview = sanitize(aiResponse.OVERVIEW);
                overView.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="lesson-body">${marked.parse(cleanOverview)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Overview', '${cleanOverview.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }

            // Render New Sections
            const summarySec = document.getElementById("summarySection");
            const summaryCon = document.getElementById("summaryContent");
            if (typeof marked !== 'undefined' && summarySec && summaryCon && aiResponse.SUMMARY) {
                summaryCon.innerHTML = marked.parse(sanitize(aiResponse.SUMMARY));
                summarySec.style.display = "block";
            }

            const vocabSec = document.getElementById("vocabSection");
            const vocabCon = document.getElementById("vocabContent");
            if (vocabSec && vocabCon && aiResponse.VOCABULARY) {
                vocabCon.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 15px;">
                        ${aiResponse.VOCABULARY.map(v => `
                            <div style="padding: 15px; background: rgba(67, 56, 202, 0.03); border-left: 4px solid #4338ca; border-radius: 8px;">
                                <strong style="color: #4338ca; display: block; margin-bottom: 5px;">${v.TERM}</strong>
                                <span style="font-size: 0.95rem; color: #4b5563;">${v.DEFINITION}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                vocabSec.style.display = "block";
            }
            if(typeof marked !== 'undefined' && explanation && aiResponse.EXPLANATION){
                const cleanExpl = sanitize(aiResponse.EXPLANATION);
                explanation.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="lesson-body">${marked.parse(cleanExpl)}</div>
                    <button class="explainSecBtn" onclick="explainSection('Detailed Explanation', '${cleanExpl.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                  </div>
                `;
            }

            // Render Deep Dive (New)
            const deepDiveSec = document.getElementById("deepDiveSection");
            const deepDiveCon = document.getElementById("deepDiveContent");
            if (deepDiveSec && deepDiveCon && aiResponse.DEEP_DIVE && aiResponse.DEEP_DIVE.length > 0) {
                let deepDiveHtml = `<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 15px;">`;
                aiResponse.DEEP_DIVE.forEach(dd => {
                    const cleanContent = sanitize(dd.CONTENT);
                    deepDiveHtml += `
                        <div class="deepDiveCard" style="padding: 20px; background: rgba(67, 56, 202, 0.02); border-left: 4px solid #4338ca; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <h3 style="color: #4338ca; margin: 0;"><i class="fas fa-layer-group"></i> ${dd.SUBTOPIC_TITLE}</h3>
                                <button class="explainSecBtn" onclick="explainSection('${dd.SUBTOPIC_TITLE}', '${cleanContent.replace(/'/g, "\\'").replace(/\n/g, " ")}')"><i class="fas fa-magic"></i> Explain</button>
                            </div>
                            <div class="lesson-body" style="font-size: 0.95rem;">${typeof marked !== 'undefined' ? marked.parse(cleanContent) : cleanContent}</div>
                        </div>
                    `;
                });
                deepDiveHtml += `</div>`;
                deepDiveCon.innerHTML = deepDiveHtml;
                deepDiveSec.style.display = "block";
            }

            const examplesContainer = document.getElementById("examplesContent");
            
            if (examplesContainer && aiResponse.EXAMPLES) {
                let examplesHtml = '';
                const samples = aiResponse.EXAMPLES.slice(0, 3);
                samples.forEach((example, idx) => {
                    const cleanProblem = (example.PROBLEM || "").replace(/\\n/g, '\n');
                    const cleanSolution = (example.SOLUTION_STEPS || example.SOLUTION || "").replace(/\\n/g, '\n');
                    examplesHtml += `
                        <div class="exampleCard">
                            <div class="exampleHeader">
                                <h3 style="margin: 0;">${example.TITLE}</h3>
                                <button class="explainSecBtn" onclick="explainSection('${example.TITLE}', '${(cleanProblem + ' ' + cleanSolution).replace(/'/g, "\\'").replace(/\n/g, " ")}')">
                                    <i class="fas fa-magic"></i> Explain
                                </button>
                            </div>
                            <div class="exampleBody">
                                <div class="exampleProblem">
                                    <strong>Problem:</strong>
                                    <div>${typeof marked !== 'undefined' ? marked.parse(cleanProblem || "See above.") : cleanProblem}</div>
                                </div>
                                <div class="exampleSolution">
                                    <strong>Solution:</strong>
                                    <div>${typeof marked !== 'undefined' ? marked.parse(cleanSolution || "No solution provided.") : cleanSolution}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                examplesContainer.innerHTML = examplesHtml;
            }

            const appsSec = document.getElementById("applicationsSection");
            const appsCon = document.getElementById("applicationsContent");
            if (appsSec && appsCon && aiResponse.APPLICATIONS) {
                appsCon.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 20px;">
                        ${aiResponse.APPLICATIONS.map(a => `
                            <div class="appCard" style="padding: 20px; background: white; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
                                <h4 style="color: #4338ca; margin-bottom: 10px;"><i class="fas fa-rocket"></i> ${a.TITLE}</h4>
                                <div style="font-size: 0.95rem; color: #4b5563; line-height: 1.5;">${marked.parse(a.DESCRIPTION.replace(/\\n/g, "\n"))}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                appsSec.style.display = "block";
            }

            // Render Key Concepts (Simplified Vertical List)
            const formulaContainer = document.getElementById("formulaContent");
            if (formulaContainer && aiResponse.FORMULAS) {
                formulaContainer.innerHTML = aiResponse.FORMULAS.map(f => {
                    const cleanContent = (f.CONTENT || "").replace(/\\n/g, "\n");
                    return `
                        <div class="concept-item">
                            <div class="concept-name">${f.NAME}</div>
                            <div class="concept-value">${typeof marked !== 'undefined' ? marked.parse(cleanContent) : cleanContent}</div>
                        </div>
                    `;
                }).join('');
            }

            // Render Pitfalls Section (New)
            const explanationSection = document.getElementById("explanationContent");
            if (explanationSection && aiResponse.PITFALLS && aiResponse.PITFALLS.length > 0) {
                const pitfallsHtml = `
                    <div class="pitfalls-container" style="margin-top: 30px; padding: 25px; background: rgba(239, 68, 68, 0.05); border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.1);">
                        <h3 style="color: #dc2626; margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Expert Insights & Common Pitfalls</h3>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${aiResponse.PITFALLS.map(p => `
                                <div>
                                    <strong style="color: #dc2626; display: block; margin-bottom: 5px;">${p.TITLE}</strong>
                                    <div class="lesson-body" style="font-size: 0.95rem;">${typeof marked !== 'undefined' ? marked.parse(sanitize(p.DESCRIPTION)) : p.DESCRIPTION}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                explanationSection.insertAdjacentHTML('beforeend', pitfallsHtml);
            }

            // Robust MathJax trigger
            await triggerMathJax();
            
            // Load Videos only after topic title is set
            try {
                await loadVideos();
            } catch (vErr) {
                console.warn("Could not load videos:", vErr);
            }

            // Finally hide the loader after everything is rendered
            const loader = document.getElementById("loaderOverlay");
            if (loader) {
                loader.style.opacity = "0";
                setTimeout(() => {
                    loader.style.display = "none";
                }, 500);
            }
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            const loader = document.getElementById("loaderOverlay");
            if (loader) loader.style.display = "none";
        }
    } else {
         // No stored response - hide loader anyway
         const loader = document.getElementById("loaderOverlay");
         if (loader) loader.style.display = "none";
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


// firebase.js

// --- Watched videos tracking ---
function addToWatched(video) {
    let watched = JSON.parse(localStorage.getItem("watchedVideos") || "[]");
    if (watched.some(v => v.id === video.id)) return;
    watched.push({ 
        id: video.id, 
        title: video.title, 
        topic: video.topic || "", 
        subject: video.subject || "",
        watchedAt: new Date().toISOString() 
    });
    localStorage.setItem("watchedVideos", JSON.stringify(watched));
}

function updateWatchedSection() {
    const list = document.getElementById("videosWatchedList");
    const count = document.getElementById("videosWatchedCount");
    if (!list || !count) return;

    const watched = JSON.parse(localStorage.getItem("watchedVideos") || "[]");
    list.innerHTML = ""; // clear skeletons / old entries

    if (watched.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <i class="fas fa-video"></i>
            <p>No videos watched yet — watch lessons to track your progress!</p>
        </div>`;
    }

    watched.forEach(video => {
        const link = document.createElement("a");
        link.href = `https://www.youtube.com/watch?v=${video.id}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "flex";
        link.style.alignItems = "center";
        link.style.gap = "15px";
        link.style.padding = "16px";
        link.style.marginBottom = "12px";
        link.style.background = "var(--card-bg, #fff)";
        link.style.borderRadius = "12px";
        link.style.fontWeight = "600";
        link.style.textDecoration = "none";
        link.style.color = "var(--text-main, #1e1b4b)";
        link.innerHTML = `<i class="fab fa-youtube" style="color: #ef4444; font-size: 1.5rem;"></i> <span>${video.title}</span>`;
        list.appendChild(link);
    });

    count.innerText = `${watched.length} watched`;
}

// Expose globally so Account.html can call it
window.updateWatchedSection = updateWatchedSection;

function renderVideos(videos, container) {
    if (!container) return;
    container.innerHTML = "";

    const heading = document.createElement("h2");
    heading.innerHTML = "<i class='fas fa-play-circle'></i> Recommended Videos";
    heading.className = "sidebarTitle";
    heading.style.marginBottom = "16px";
    container.appendChild(heading);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
    grid.style.gap = "20px";
    container.appendChild(grid);

    const maxVids = videos.slice(0, 4);

    maxVids.forEach((video) => {
        const watched = JSON.parse(localStorage.getItem("watchedVideos") || "[]");
        const isWatched = watched.some(v => v.id === video.id);

        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
            position:relative; background:var(--card-bg,#fff);
            border:2px solid ${isWatched ? "#ef4444" : "var(--border-color,rgba(0,0,0,0.05))"};
            border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05);
            overflow:hidden; transition:transform 0.2s,box-shadow 0.2s;
            opacity:${isWatched ? "0.7" : "1"};
        `;

        // Thumbnail container
        const thumbWrapper = document.createElement("div");
        thumbWrapper.style.cssText = "position:relative; cursor:pointer; width:100%; height:180px; overflow:hidden;";

        const thumb = document.createElement("img");
        thumb.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
        thumb.style.cssText = "width:100%; height:100%; object-fit:cover; display:block;";

        // Play button overlay
        const playBtn = document.createElement("div");
        playBtn.style.cssText = `
            position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
            background:rgba(0,0,0,0.3); transition:background 0.2s;
        `;
        playBtn.innerHTML = `<div style="width:54px;height:54px;background:#ef4444;border-radius:50%;
            display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M8 5v14l11-7z"/>
            </svg>
        </div>`;

        thumbWrapper.addEventListener("mouseenter", () => playBtn.style.background = "rgba(0,0,0,0.5)");
        thumbWrapper.addEventListener("mouseleave", () => playBtn.style.background = "rgba(0,0,0,0.3)");

        // On click: swap thumbnail for real iframe and mark as watched
        thumbWrapper.addEventListener("click", () => {
            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "180";
            iframe.src = `https://www.youtube.com/embed/${video.id}?rel=0&autoplay=1`;
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframe.style.display = "block";

            thumbWrapper.replaceWith(iframe);

            // Mark as watched
            addToWatched(video);
            wrapper.style.opacity = "0.7";
            wrapper.style.borderColor = "#ef4444";
        });

        thumbWrapper.appendChild(thumb);
        thumbWrapper.appendChild(playBtn);
        wrapper.appendChild(thumbWrapper);

        // Title
        const title = document.createElement("p");
        title.innerText = video.title;
        title.style.cssText = "color:var(--text-main,#1e1b4b);text-align:center;font-weight:600;font-size:0.9rem;padding:8px;margin:0;";
        wrapper.appendChild(title);

        // Hover effect on card
        wrapper.addEventListener("mouseenter", () => {
            wrapper.style.transform = "scale(1.02)";
            wrapper.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
        });
        wrapper.addEventListener("mouseleave", () => {
            wrapper.style.transform = "scale(1)";
            wrapper.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
        });

        grid.appendChild(wrapper);
    });
}

// --- Load videos dynamically from Searlo API ---
async function loadVideos() {
    const topicTitle = document.getElementById("topicTitle");
    const subjectTitle = document.getElementById("subject");
    const vidContainer = document.getElementById("videosContent");

    if (!vidContainer || !topicTitle) return;

    const sHeading = topicTitle.innerText || "";
    const sSubject = subjectTitle?.innerText || "";

    try {
        const response = await fetch(
            `https://yt-videos-xaudhnk2aq-uc.a.run.app?heading=${encodeURIComponent(sHeading)}&subject=${encodeURIComponent(sSubject)}`
        );

        const data = await response.json();

        if (data.error) {
            vidContainer.innerHTML =
                "<p style='text-align:center'>No videos available. Try again later.</p>";
            console.warn("Video fetch error:", data.message);
            return;
        }

       
        renderVideos(data.videos, vidContainer);

    } catch (err) {
        console.error("Video fetch error:", err);
        vidContainer.innerHTML =
            "<p style='text-align:center'>Failed to fetch videos.</p>";
    }
}

// --- Initialize on page load ---
window.addEventListener("DOMContentLoaded", () => {
    loadVideos();  
    updateWatchedSection();         // Recommended videos page
  
});



// Video fetching removed from standalone DOMContentLoaded to handle sync in handleResponse

// --- New Features Logic ---

// Interactive Quiz Logic moved to quiz.js

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

// 3. Generate Dedicated Quiz Page Data
window.generateQuiz = async function() {
    const topic = localStorage.getItem("topic");
    const subject = localStorage.getItem("subject");
    const level = localStorage.getItem("level");

    if (!topic) return;

    const diffEl = document.getElementById("quizDifficulty");
    const countEl = document.getElementById("quizCount");
    const difficulty = diffEl ? diffEl.value : "Medium";
    const count = countEl ? parseInt(countEl.value) : 5;

    const grade = localStorage.getItem("grade") || "NA";
    const cacheKey = `${level}_${grade}_${subject}_${topic}_${difficulty}_${count}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    let globalDocRef = null;
    let globalDocSnap = null;
    
    // Track which variants this local device has already played
    const takenVarKey = "quiz_taken_" + cacheKey;
    const takenIndices = JSON.parse(localStorage.getItem(takenVarKey) || "[]");

    try {
        globalDocRef = doc(db, "public_quizzes", cacheKey);
        globalDocSnap = await getDoc(globalDocRef);
        
        if (globalDocSnap.exists()) {
            const quizVariants = globalDocSnap.data().variants || [];
            // Retrieve first variant index the user has never seen
            const unseenIndex = quizVariants.findIndex((v, idx) => !takenIndices.includes(idx));
            
            if (unseenIndex !== -1) {
                takenIndices.push(unseenIndex);
                localStorage.setItem(takenVarKey, JSON.stringify(takenIndices));
                
                localStorage.setItem("quizResponse", JSON.stringify(quizVariants[unseenIndex]));
                localStorage.setItem("quizTopic", topic);
                window.location.href = "quizPage.html";
                return; // Early return to save API Tokens!
            }
        }
    } catch(err) {
        console.warn("Firestore public pool read skipped:", err);
    }

    const loader = document.getElementById("loaderOverlay");
    const loaderText = document.getElementById("loaderText");
    if (loader && loaderText) {
        loaderText.innerText = "Crafting your Strict Quiz...";
        loader.style.opacity = "1";
        loader.style.display = "flex";
    } else if (loader) {
        loader.style.opacity = "1";
        loader.style.display = "flex";
    }

    try {
        const prompt = `
          Generate a STRICT ${count}-question multiple choice quiz on the topic: "${topic}" (${subject}, ${level} Level).
          DIFFICULTY LEVEL: ${difficulty}.
          RULES:
          - MUST be exactly ${count} questions.
          - Each question MUST have exactly 4 OPTIONS.
          - Return ONLY a valid JSON array format. No markdown blocks outside JSON.
          - Math equations must use MathJax format ($...$ for inline, $$...$$ for block). Escape backslashes natively.
          
          STRUCTURE:
          [
            {
              "QUESTION": "...",
              "OPTIONS": ["A) ...", "B) ...", "C) ...", "D) ..."],
              "CORRECT_INDEX": 0, // Integer 0-3 corresponding to the correct option index
              "MEMO": "Detailed explanation of why this answer is correct and others are wrong."
            }
          ]
        `;

        const response = await fetch("https://topictutor-xaudhnk2aq-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt })
        });
        
        const data = await response.json();
        
        let cleaned = data.aiResponse.replace(/```json|```/g, "").trim();
        const startIdx = cleaned.indexOf('[');
        const endIdx = cleaned.lastIndexOf(']');
        if(startIdx !== -1 && endIdx !== -1) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
        }
        
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            
            // Upload the brand new quiz into the global library so others can use it
            try {
                if (globalDocRef) {
                    let existingVars = globalDocSnap && globalDocSnap.exists() ? globalDocSnap.data().variants || [] : [];
                    existingVars.push(parsed); // Push the new quiz
                    await setDoc(globalDocRef, { variants: existingVars }, { merge: true });
                    
                    // Mark as played locally
                    takenIndices.push(existingVars.length - 1);
                    localStorage.setItem(takenVarKey, JSON.stringify(takenIndices));
                }
            } catch (err) {
                console.warn("Firestore public pool update skipped:", err);
            }

            localStorage.setItem("quizResponse", JSON.stringify(parsed));
            localStorage.setItem("quizTopic", topic); // Cache the relation
            window.location.href = "quizPage.html";
        } else {
            throw new Error("Invalid Output");
        }
    } catch (e) {
        console.error("Quiz fetch failed:", e);
        if (loaderText) loaderText.innerText = "Failed to generate. Please try again.";
        setTimeout(() => { if (loader) loader.style.display = "none"; }, 2000);
    }
};

// 4. Mark as Mastered Logic
const markBtn = document.getElementById("masteredBtn");
if (markBtn) {
    markBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please sign in to track your progress.");
            return;
        }
        
        const topic = localStorage.getItem("topic");
        const subject = localStorage.getItem("subject");
        const grade = localStorage.getItem("grade");
        const level = localStorage.getItem("level");
        const cacheId = `${grade}_${subject}_${topic}_${level}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        
        try {
            markBtn.disabled = true;
            markBtn.innerText = "Mastering...";
            
            await setDoc(doc(db, "users", user.uid, "progress", topic), {
                subject: subject,
                grade: grade,
                level: level,
                cacheId: cacheId,
                masteredAt: new Date(),
                status: "mastered"
            }, { merge: true });
            
            markBtn.innerHTML = '<i class="fas fa-check"></i> Mastered!';
            markBtn.style.background = "#10b981";
            markBtn.style.color = "white";
            
            // Add points (gamification) and reflect on UI
            const newPoints = (window.userPoints || 0) + 50;
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { points: newPoints }, { merge: true });
            
            window.userPoints = newPoints;
            const ptsText = document.getElementById("userPoints");
            if (ptsText) ptsText.innerText = newPoints;
            
            // Mark button as completed
            markBtn.innerHTML = '<i class="fas fa-check-circle"></i> +50 Points Earned!';
            markBtn.style.background = "#059669";
            markBtn.style.color = "white";
        } catch (error) {
            console.error("Error marking as mastered:", error);
            markBtn.disabled = false;
            markBtn.innerText = "Mark as Mastered";
        }
    });
}

// PDF Export Logic removed per user request

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
        const topic = localStorage.getItem("topic") || "General Study";
        const scanContext = window.lastScanResult ? `Based on this scanned question/solution: ${window.lastScanResult.substring(0, 500)}...` : "";
        
        const response = await fetch(
            "https://topictutor-xaudhnk2aq-uc.a.run.app",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `${scanContext} Context: You are tutoring on ${topic}. The user asks: ${msg}. Provide a short, helpful explanation.`
                })
            }
        );
        
        const data = await response.json();
        botDiv.innerText = data.aiResponse || "I'm sorry, I couldn't process that.";
    } catch (error) {
        botDiv.innerText = "Error connecting to MzansiEd.";
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

// --- SCAN & SOLVE LOGIC ---
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const solveBtn = document.getElementById("solveBtn");
const scanResultSection = document.getElementById("scanResultSection");
const scanResultContent = document.getElementById("scanResultContent");
const modeBtns = document.querySelectorAll(".modeBtn");

let selectedScanMode = "teaching";
let base64Image = null;

if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());
    
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
    
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file) handleScanFile(file);
    });
}

if (fileInput) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleScanFile(file);
    });
}

function handleScanFile(file) {
    if (!file) return;
    
    // Show immediate feedback
    if (solveBtn) {
        solveBtn.disabled = true;
        solveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        base64Image = e.target.result;
        
        if (imagePreview) {
            imagePreview.src = base64Image;
            imagePreview.style.display = "block";
        }

        if (solveBtn) {
            solveBtn.disabled = false;
            solveBtn.innerHTML = '<i class="fas fa-magic"></i> Solve Question';
        }
        
        // Scroll to preview
        if (imagePreview) {
            imagePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    reader.onerror = () => {
        if (solveBtn) {
            solveBtn.disabled = false;
            solveBtn.innerHTML = '<i class="fas fa-magic"></i> Solve Question';
            alert("Error reading file. Please try again.");
        }
    };

    reader.readAsDataURL(file);
}

if (modeBtns) {
    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedScanMode = btn.getAttribute("data-mode");
        });
    });
}

if (solveBtn && scanResultSection && scanResultContent) {
    solveBtn.addEventListener("click", async () => {
        if (!base64Image) return;
        
        try {
            solveBtn.disabled = true;
            solveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
            scanResultSection.style.display = "block";
            scanResultContent.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div><p style="text-align:center;">MzansiEd is scanning your question...</p>';
            
            // Construct Prompt based on mode
            let stylePrompt = "";
            if (selectedScanMode === "memo") {
                stylePrompt = "Provide the answer in a 'Memo / Marking Guideline' style. Focus on the correct final answers and list the points/marks for each step. Be concise.";
            } else if (selectedScanMode === "teaching") {
                stylePrompt = "Provide the answer in a 'Teaching / Tutoring' style. Explain the core concepts first, use analogies, and guide the student through the solution while explaining the reasoning (the 'why') for each step.";
            } else {
                stylePrompt = "Provide a clear, detailed 'Step-by-Step Solution'. Number each step and highlight the final answer clearly.";
            }

            const fullPrompt = `
                I am uploading a question image. 
                STYLE: ${stylePrompt}
                - RETURN ONLY THE SOLUTION CONTENT.
                - USE $...$ FOR ALL MATH.
                - USE LATEX FOR SYMBOLS.
                - IF A SKETCH OR DIAGRAM IS NEEDED: Use clear SVG code or highly structured labels.
                - USE MARKDOWN FOR FORMATTING.
                - ENSURE THE RESPONSE IS PROFESSIONAL AND EASY FOR A STUDENT TO FOLLOW.
            `;

            const res = await fetch("https://topictutor-xaudhnk2aq-uc.a.run.app", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: fullPrompt,
                    image: base64Image // Assuming backend handles image field
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "AI Vision Error");
            }
            const data = await res.json();
            
            // Clean and Render
            const cleaned = (data.aiResponse || "").replace(/\\n/g, "\n");
            
            // Store context for chat
            window.lastScanResult = cleaned;
            
            if (typeof marked !== 'undefined') {
                scanResultContent.innerHTML = marked.parse(cleaned);
            } else {
                scanResultContent.innerHTML = cleaned;
            }
            
            // Trigger MathJax
            triggerMathJax();
            
            solveBtn.disabled = false;
            solveBtn.innerHTML = '<i class="fas fa-magic"></i> Solve Question';
            
            // Scroll to result
            scanResultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error("Scan Solve Error:", error);
            scanResultContent.innerHTML = `<p style="color: #dc2626;">Error: ${error.message}. Please try again with a clearer image.</p>`;
            solveBtn.disabled = false;
            solveBtn.innerHTML = '<i class="fas fa-magic"></i> Solve Question';
        }
    });
}


// --- Past Papers Data (replace URLs with real links) ---
const pastPapersData = {
  "Mathematics": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2021, paper: "Paper 1", url: "#", memo: "#" }
  ],

  "Economics": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2021, paper: "Paper 2", url: "#", memo: "#" }
  ],

  "Accounting": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2021, paper: "Paper 1", url: "#", memo: "#" }
  ],

  "Life Science": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 2", url: "#", memo: "#" }
  ],

  "Physical Science": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 2", url: "#", memo: "#" }
  ],

  "Geography": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" }
  ],

  "Life Orientation": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" }
  ],

  "History": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2025, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 2", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 2", url: "#", memo: "#" }
  ],

  "Mathematical Literacy": [
    { year: 2025, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2024, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2023, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2022, paper: "Paper 1", url: "#", memo: "#" },
    { year: 2021, paper: "Paper 1", url: "#", memo: "#" }
  ]
};

// --- Render Past Papers ---
function renderPastPapers(subject = "Mathematics") {
  const papers = pastPapersData[subject] || [];
  const container = document.getElementById("pastPapersList");
  const countEl = document.getElementById("pastPapersCount");

  container.innerHTML = "";
  countEl.innerText = `${papers.length} available`;

  if (!papers.length) {
    container.innerHTML = "<p style='text-align:center'>No past papers available for this subject.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
  grid.style.gap = "16px";
  container.appendChild(grid);

  papers.forEach(paper => {
    const card = document.createElement("div");
    card.className = "pastPaperItem";
    card.style.padding = "12px";
    card.style.borderRadius = "12px";
    //card.style.background = "#f5f5f5";
    card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";
    card.style.transition = "transform 0.2s, box-shadow 0.2s";

    // Hover effect
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.03)";
      card.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
    });

    // Paper Title
    const title = document.createElement("h3");
    title.innerText = `${paper.year} - ${paper.paper}`;
    title.style.textAlign = "center";
    title.style.marginBottom = "8px";
    card.appendChild(title);

    // PDF Link
    const link = document.createElement("a");
    link.href = paper.url;
    link.target = "_blank";
    link.innerText = "View / Download Paper";
    link.className = "paperBtn";
    card.appendChild(link);

    // Memorandum Button + Section
    if (paper.memo) {
      const memoBtn = document.createElement("button");
      memoBtn.innerText = "Show Memorandum";
      memoBtn.className = "showMemoBtn paperBtn";
      memoBtn.style.marginTop = "8px";
      card.appendChild(memoBtn);

      const memoDiv = document.createElement("div");
      memoDiv.className = "memorandum";
      memoDiv.style.display = "none";
      memoDiv.style.marginTop = "8px";

      const memoLink = document.createElement("a");
      memoLink.href = paper.memo;
      memoLink.target = "_blank";
      memoLink.innerText = "Open Memorandum PDF";
      memoLink.className = "paperBtn";
      memoDiv.appendChild(memoLink);

      card.appendChild(memoDiv);
    }

    grid.appendChild(card);
  });
}

// --- Initialize on page load ---
window.addEventListener("DOMContentLoaded", () => {
  renderPastPapers();

  // PDF export
  const pdfBtn = document.getElementById('pdfBtn');
  if(pdfBtn){
    pdfBtn.addEventListener('click', () => {
      const element = document.getElementById('pastPapersSection');
      html2pdf().from(element).save('PastPapers.pdf');
    });
  }
});

// --- Event delegation for memorandum toggle ---
document.addEventListener("click", function(e){
  if(e.target.classList.contains('showMemoBtn')){
    const btn = e.target;
    const memo = btn.closest('.pastPaperItem').querySelector('.memorandum');
    if (memo.style.display === 'none' || memo.style.display === '') {
      memo.style.display = 'block';
      btn.textContent = 'Hide Memorandum';
    } else {
      memo.style.display = 'none';
      btn.textContent = 'Show Memorandum';
    }
  }
});

// 6. Past Papers Database Search
window.searchPastPapers = async function() {
    const grade = document.getElementById("ppGrade").value;
    const subject = document.getElementById("ppSubject").value;
    const year = document.getElementById("ppYear").value;
    const targetPaperId = document.getElementById("ppTitle") ? document.getElementById("ppTitle").value : "All";

    const btn = document.getElementById("scrapeBtn");
    const resultsContainer = document.getElementById("scraperResults");
    const resultsGrid = document.getElementById("resultsGrid");
    const resultTitle = document.getElementById("resultTitle");
    const unavState = document.getElementById("unavailableState");

    if(!btn || !resultsContainer) return;

    // UI Reset
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Searching Database...`;
    btn.disabled = true;
    resultsContainer.style.display = "none";
    unavState.style.display = "none";
    resultsGrid.innerHTML = "";

    try {
        // Dynamically import searching queries so we don't break existing top-level imports
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        
        const q = query(
            collection(db, "past_papers"),
            where("grade", "==", grade),
            where("subject", "==", subject),
            where("year", "==", year)
        );

        const snapshot = await getDocs(q);
        let foundAssets = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Explicit filter: if user wants 'Paper 1', skip 'Paper 2' etc.
            if (targetPaperId !== "All" && data.title !== targetPaperId) return;

            // Generate descriptive subtitle for the card
            const monthText = data.month || "General Term";
            const provText = data.province || "National";
            const desc = `${monthText} • ${provText}`;
            
            if (data.paperUrl) {
                foundAssets.push({
                    title: data.title ? (data.title + "") : "Question Paper",
                    subtitle: desc,
                    tag: "Question Paper",
                    href: data.paperUrl,
                    icon: '<i class="fas fa-file-pdf" style="color: #ef4444;"></i>'
                });
            }
            if (data.memoUrl) {
                foundAssets.push({
                    title: data.title ? (data.title + "") : "Memorandum",
                    subtitle: desc,
                    tag: "Memorandum",
                    href: data.memoUrl,
                    icon: '<i class="fas fa-file-signature" style="color: #10b981;"></i>'
                });
            }
        });

        if (foundAssets.length > 0) {
            resultTitle.innerText = `Database Results: Grade ${grade} ${document.getElementById("ppSubject").options[document.getElementById("ppSubject").selectedIndex].text} (${year})`;
            
            foundAssets.forEach(asset => {
                const card = document.createElement("div");
                card.style.background = "var(--card-bg, #fff)";
                card.style.border = "1px solid var(--border-color, rgba(0,0,0,0.05))";
                card.style.borderRadius = "12px";
                card.style.padding = "20px";
                card.style.display = "flex";
                card.style.flexDirection = "column";
                card.style.justifyContent = "space-between";
                card.style.gap = "15px";

                card.innerHTML = `
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <span style="font-size: 1.6rem; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 10px;">${asset.icon}</span>
                        <div>
                            <span style="display: inline-block; background: ${asset.tag === 'Memorandum' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${asset.tag === 'Memorandum' ? '#10b981' : '#ef4444'}; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; margin-bottom: 6px;">${asset.tag}</span>
                            <h4 style="margin: 0; color: var(--text-main); font-size: 1.1rem; font-weight: 700;">${asset.title}</h4>
                            <div style="font-size: 0.8rem; color: #4338ca; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-calendar-alt"></i> ${asset.subtitle}
                            </div>
                        </div>
                    </div>
                    <a href="${asset.href}" target="_blank" class="authBtn" style="text-align: center; text-decoration: none; padding: 12px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-download"></i> Download PDF
                    </a>
                `;
                resultsGrid.appendChild(card);
            });

            resultsContainer.style.display = "block";
        } else {
            unavState.style.display = "block";
        }

    } catch (err) {
        console.error("Database search failed:", err);
        unavState.style.display = "block";
    } finally {
        btn.innerHTML = `<i class="fas fa-search"></i> Search Database`;
        btn.disabled = false;
    }
};
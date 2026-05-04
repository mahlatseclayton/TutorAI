import { auth, db } from './firebase.js';
import { doc, setDoc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentQuizData = [];
let userAnswers = {};

function loadGeneratedQuiz() {
    const topic = localStorage.getItem("topic");
    const storedResponse = localStorage.getItem("quizResponse");

    if (!topic || !storedResponse) {
        alert("Quiz data missing! Redirecting to setup.");
        window.location.href = "solutionPage.html";
        return;
    }

    document.getElementById("quizTitle").innerText = `${topic} Quiz`;
    document.getElementById("loaderText").innerText = "Rendering Structure and Formulas...";

    try {
        currentQuizData = JSON.parse(storedResponse);
        if (!Array.isArray(currentQuizData) || currentQuizData.length === 0) throw new Error("Invalid structure");
        
        renderQuiz();
    } catch (e) {
        console.error("Quiz parsing failed:", e);
        document.getElementById("loaderText").innerText = "Failed to load quiz display. Redirecting...";
        setTimeout(() => window.location.href = "solutionPage.html", 2000);
    }
}

function renderQuiz() {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";
    
    currentQuizData.forEach((q, qIndex) => {
        let optionsHtml = '';
        q.OPTIONS.forEach((opt, optIndex) => {
            optionsHtml += `
                <div class="quiz-option" id="opt-${qIndex}-${optIndex}">
                    ${typeof marked !== 'undefined' ? marked.parseInline(opt) : opt}
                </div>
            `;
        });
        
        const qHtml = `
            <div class="quiz-card" style="background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); margin-bottom: 30px;">
                <h3 style="margin-top: 0; color: #4338ca; font-size: 1.3rem; margin-bottom: 20px;">Question ${qIndex + 1}</h3>
                <div style="font-size: 1.15rem; margin-bottom: 20px; color: #1e1b4b; font-weight: 500;">
                    ${typeof marked !== 'undefined' ? marked.parse(q.QUESTION || "") : q.QUESTION}
                </div>
                <div class="options-container" id="options-${qIndex}">
                    ${optionsHtml}
                </div>
                <div id="memo-${qIndex}" class="memo-box"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', qHtml);
    });
    
    // Add event listeners for selection
    currentQuizData.forEach((_, qIndex) => {
        const optionEls = document.querySelectorAll(`#options-${qIndex} .quiz-option`);
        optionEls.forEach((el, optIndex) => {
            el.addEventListener("click", () => selectOption(qIndex, optIndex));
        });
    });

    if (window.MathJax) {
        MathJax.typesetPromise().then(() => {
            document.getElementById("loaderOverlay").style.display = "none";
            document.getElementById("submitQuizBtn").style.display = "inline-block";
        }).catch(err => {
            console.error("MathJax error:", err);
            document.getElementById("loaderOverlay").style.display = "none";
            document.getElementById("submitQuizBtn").style.display = "inline-block";
        });
    } else {
        document.getElementById("loaderOverlay").style.display = "none";
        document.getElementById("submitQuizBtn").style.display = "inline-block";
    }
}

function selectOption(qIndex, optIndex) {
    // Cannot change after submission
    if (document.getElementById("submitQuizBtn").disabled) return;
    
    userAnswers[qIndex] = optIndex;
    
    // UI update
    const allOptions = document.querySelectorAll(`#options-${qIndex} .quiz-option`);
    allOptions.forEach(el => el.classList.remove('selected'));
    document.getElementById(`opt-${qIndex}-${optIndex}`).classList.add('selected');
}

document.getElementById("submitQuizBtn").addEventListener("click", async () => {
    // Check if fully answered
    if (Object.keys(userAnswers).length < currentQuizData.length) {
        alert("Please answer all questions before submitting.");
        return;
    }
    
    const submitBtn = document.getElementById("submitQuizBtn");
    submitBtn.innerText = "Marking...";
    submitBtn.disabled = true;
    
    let totalScoreChange = 0;
    
    currentQuizData.forEach((q, qIndex) => {
        const userChoice = userAnswers[qIndex];
        const correctChoice = q.CORRECT_INDEX;
        
        const allOptions = document.querySelectorAll(`#options-${qIndex} .quiz-option`);
        
        if (userChoice === correctChoice) {
            totalScoreChange += 10;
            document.getElementById(`opt-${qIndex}-${userChoice}`).classList.add('correct');
        } else {
            totalScoreChange -= 5;
            document.getElementById(`opt-${qIndex}-${userChoice}`).classList.add('wrong');
            // Show the actual correct answer
            document.getElementById(`opt-${qIndex}-${correctChoice}`).classList.add('correct');
        }
        
        // Disable hovers and clicks
        allOptions.forEach(el => el.style.pointerEvents = 'none');
        
        // Show memo
        const memoEl = document.getElementById(`memo-${qIndex}`);
        memoEl.innerHTML = `<strong><i class="fas fa-lightbulb" style="color: #fbbf24;"></i> Solution Memo:</strong><br/>${typeof marked !== 'undefined' ? marked.parse(q.MEMO) : q.MEMO}`;
        memoEl.style.display = "block";
    });
    
    const resultsCard = document.getElementById("resultsCard");
    const resultsHeading = document.getElementById("resultsHeading");
    const resultsText = document.getElementById("resultsText");
    
    if (totalScoreChange >= 0) {
        resultsCard.style.background = "rgba(16, 185, 129, 0.1)";
        resultsCard.style.borderColor = "#10b981";
        resultsHeading.style.color = "#10b981";
        resultsHeading.innerText = "Excellent Effort!";
        resultsText.innerHTML = `You earned <span style="color: #10b981;">+${totalScoreChange} points</span>!`;
    } else {
        resultsCard.style.background = "rgba(239, 68, 68, 0.1)";
        resultsCard.style.borderColor = "#ef4444";
        resultsHeading.style.color = "#ef4444";
        resultsHeading.innerText = "Keep Practicing.";
        resultsText.innerHTML = `You lost <span style="color: #ef4444;">${totalScoreChange} points</span>.`;
    }
    
    resultsCard.style.display = "block";
    document.getElementById("backBtn").style.display = "inline-block";
    submitBtn.style.display = "none";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    
    if (window.MathJax) {
        MathJax.typesetPromise().then(() => {
            submitBtn.style.display = "none";
        });
    } else {
        submitBtn.style.display = "none";
    }

    // Update Firebase Points
    const user = auth.currentUser;
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            let currentPts = userDoc.exists() && userDoc.data().points ? userDoc.data().points : 0;
            
            currentPts += totalScoreChange;
            if (currentPts < 0) currentPts = 0; // Prevent negative points floor
            
            await setDoc(userRef, { points: currentPts }, { merge: true });
            const ptsEl = document.getElementById("userPoints");
            if (ptsEl) ptsEl.innerText = currentPts;

            // Save quiz attempt to history
            const topic = localStorage.getItem("topic") || "Unknown";
            const subject = localStorage.getItem("subject") || "";
            const grade = localStorage.getItem("grade") || "";
            const level = localStorage.getItem("level") || "Beginner";
            const correct = currentQuizData.filter((q, i) => userAnswers[i] === q.CORRECT_INDEX).length;
            const cacheId = `${grade}_${subject}_${topic}_${level}`.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
            
            await addDoc(collection(db, "users", user.uid, "quizHistory"), {
                topic: topic,
                subject: subject,
                grade: grade,
                level: level,
                cacheId: cacheId,
                totalQuestions: currentQuizData.length,
                correctAnswers: correct,
                scoreChange: totalScoreChange,
                completedAt: new Date()
            });
        } catch (err) {
            console.error("Failed to update points:", err);
        }
    } else {
        console.warn("User not authenticated, points not saved.");
    }
});

window.addEventListener("DOMContentLoaded", () => {
    // Initial Auth Load Points
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (!user.emailVerified) {
                window.location.href = "signIn.html";
                return;
            }
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().points !== undefined) {
                    const ptsEl = document.getElementById("userPoints");
                    if (ptsEl) ptsEl.innerText = docSnap.data().points;
                } else {
                    const ptsEl = document.getElementById("userPoints");
                    if (ptsEl) ptsEl.innerText = "0";
                }
            } catch (e) {
                console.error(e);
            }
        }
    });

    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    loadGeneratedQuiz();
});

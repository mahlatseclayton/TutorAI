
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
    console.log("hi");
    const grade=document.querySelector("#gradeId").value;
    const topic=document.querySelector("#topicId").value;
     const subject=document.querySelector("#gradeId").value;
    const level=document.querySelector("#levelId").value;
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

  "VIDEOS": [
    {
      "TITLE": "VIDEO TITLE IN CAPS",
      "URL": "YOUTUBE LINK"
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
  console.log(data);

}
const startedBtn=document.querySelector("#startedBtn");
if(startedBtn){
startedBtn.addEventListener("click",getTopic);
}
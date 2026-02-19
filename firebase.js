
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


// Initialize Firebase

// the export allows us to use the method outside this file and the async to allow the program to wait a bit
async function signUp(){
    const name=document.getElementById("name").value;
    const grade=document.getElementById("grade").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const cpassword=document.getElementById("cpassword").value;
   
    if(password!=cpassword){
        alert("Passwords do not match");
    //   validation
    }
    else if(password.length<8){
        alert("Password must be at least 8 characters.");}
    // }

    // else if(!/[z-Z]/.test(password)){
    //     alert("Password must contain atleast one upper case");
    // }
    // else if(!/[0-9]/.test(password)){
    //     alert("Password must contain atleast one number");
    // }
    // else if(!/[!@#$%^&*]/.test(password)){
    //     alert("Password must contain atleast one upper case");
    // }
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
        alert("Error creating account :",error.message);
        
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
        await sendPasswordResetEmail(auth,email);
        alert("Reset password link sent.");
    })
}

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjNyRSkepOLHcYuK4ALI2xWibC-P849f0",
  authDomain: "tutorai-5f97d.firebaseapp.com",
  projectId: "tutorai-5f97d",
  storageBucket: "tutorai-5f97d.firebasestorage.app",
  messagingSenderId: "447039931727",
  appId: "1:447039931727:web:e90fa57709aced5bb6713a",
  measurementId: "G-TDDTB6PM28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
function signUp(){
    let name=document.getElementById("name").value;
    let grade=document.getElementById("grade").value;
    let email=document.getElementById("email").value;
    let password=document.getElementById("password").value;
    let cpassword=document.getElementById("cpassword").value;
    if(password!=cpassword){
        alert("Passwords do not match");
        console.log("hey");
    }
    else{
        alert("lets start working!");
        console.log("hiiy");
    }
}
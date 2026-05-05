// Global Alert Override with Custom UI Toast
window.originalAlert = window.alert;
window.alert = function(message) {
    // 1. Translate developer errors to user-friendly messages
    let friendlyMessage = message;
    
    const errorMap = {
        "auth/user-not-found": "We couldn't find an account with that email address.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Login failed. Please check your email and password.",
        "auth/email-already-in-use": "That email is already registered. Try signing in.",
        "auth/weak-password": "Your password is too weak. Please use at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "Failed to fetch": "Network error. Please check your internet connection.",
        "Firebase: Error": "An authentication error occurred. Please try again."
    };

    if (typeof message === 'string') {
        for (const [code, friendlyText] of Object.entries(errorMap)) {
            if (message.includes(code)) {
                friendlyMessage = friendlyText;
                break;
            }
        }
        friendlyMessage = friendlyMessage.replace(/^Firebase:\s*/i, '').replace(/^Error:\s*/i, '').replace(/^MzansiEd Error:\s*/i, '');
    }

    // 2. Create the Custom Toast UI
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    let icon = '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>';
    if (typeof friendlyMessage === 'string' && (friendlyMessage.toLowerCase().includes('success') || friendlyMessage.toLowerCase().includes('welcome'))) {
        icon = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
        toast.classList.add('toast-success');
    }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${friendlyMessage}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
        }
    }, 4500);
};

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
function Start() {

  window.location.href = "signUp.html";

}
// Select all password containers
const passwordContainers = document.querySelectorAll('.password-container');
passwordContainers.forEach(container => {
  const passwordInput = container.querySelector('input[type="password"], input[type="text"]');
  const toggleBtn = container.querySelector('.toggle-password');
  const toggleIcon = container.querySelector('.toggle-password i');

  if (passwordInput && toggleBtn) {
    function togglePassword() {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (toggleIcon) { toggleIcon.classList.remove('fa-eye'); toggleIcon.classList.add('fa-eye-slash'); }
      } else {
        passwordInput.type = 'password';
        if (toggleIcon) { toggleIcon.classList.remove('fa-eye-slash'); toggleIcon.classList.add('fa-eye'); }
      }
    }

    toggleBtn.addEventListener('click', togglePassword);

    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePassword();
      }
    });
  }
});







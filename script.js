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
function Start(){

    window.location.href="signUp.html";

}
// Select the password container and elements
const passwordContainer = document.querySelector('.password-container');
const passwordInput = passwordContainer.querySelector('#password');
const toggle = passwordContainer.querySelector('.toggle-password i'); // select the <i> inside the span

// Function to toggle password visibility
function togglePassword() {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';            // show password
    toggle.classList.remove('fa-eye');
    toggle.classList.add('fa-eye-slash');   // change to eye-slash
  } else {
    passwordInput.type = 'password';        // hide password
    toggle.classList.remove('fa-eye-slash');
    toggle.classList.add('fa-eye');         // change back to eye
  }
}

// Click to toggle
passwordContainer.querySelector('.toggle-password').addEventListener('click', togglePassword);

// Keyboard accessibility (Enter or Space)
passwordContainer.querySelector('.toggle-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    togglePassword();
  }
});






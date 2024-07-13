document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.querySelector('#username').value;
        alert(`Welcome, ${username}!`);
    });
});

const loginForm = document.querySelector('form'); 

loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // empêche le rechargement automatique de la page

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Email ou mot de passe incorrect');
            }
            return response.json();
        })
        .then(data => {
            // Stocke le token pour la session
            sessionStorage.setItem('token', data.token);

            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
        })
        .catch(error => afficherErreur(error.message));
});

// Fonction pour afficher le message d'erreur sous le formulaire
function afficherErreur(message) {
    let errorMessage = document.querySelector('.error-message');

    if (!errorMessage) {
        errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message');
        loginForm.appendChild(errorMessage);
    }

    errorMessage.textContent = message;
}
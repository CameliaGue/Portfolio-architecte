const loginForm = document.querySelector('form'); 


loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
// Appel API pour tenter de se connecter avec les identifiants saisis
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
        // En cas de succès, stocke le token dans sessionStorage et redirige vers index.html
        .then(data => {
            sessionStorage.setItem('token', data.token);

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
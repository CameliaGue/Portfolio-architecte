const URL = 'http://localhost:5678/api/';
const gallery = document.getElementById('gallery-container');
const filterContainer = document.getElementById('filter-container');
const token = sessionStorage.getItem("token");

let projets = [];

function getProjets() {
    fetch(URL + 'works')
        .then(response => response.json())
        .then(works => {
            projets = works;
            afficherProjets(projets);
        })
        .catch(error => console.error('Erreur:', error));
}
getProjets();

function getCategories() {
    fetch(URL + 'categories')
        .then(response => response.json())
        .then(categories => creerBoutonsFiltres(categories)) 
        // on crée les boutons de filtre après avoir récupéré les catégories
        .catch(error => console.error('Erreur fetch catégories:', error));
}
getCategories();

function afficherProjets(projets) {

    gallery.innerHTML = '';
    projets.forEach(projet => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = projet.imageUrl;
        img.alt = projet.title;

        const caption = document.createElement('figcaption');
        caption.textContent = projet.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });
}


//Fonction pour créer les boutons de filtre
function creerBoutonsFiltres(categories) {
    // Bouton "Tous"
    const tousButton = document.createElement('button');
    tousButton.textContent = 'Tous';
    tousButton.addEventListener('click', () => afficherProjets(projets));
    filterContainer.appendChild(tousButton);

    // Boutons par catégorie
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.addEventListener('click', () => {
            const projetsFiltres = projets.filter(p => p.categoryId === category.id);
            afficherProjets(projetsFiltres);
        });
        filterContainer.appendChild(button);
    });
}

//Mode édition
const editionBar = document.getElementById('edition-bar');
const loginLink = document.querySelector('nav ul li:nth-child(3)');

if (token) {
    // Affiche la barre noire
    editionBar.style.display = "block";

    // Change "login" en "logout"
    loginLink.textContent = "logout";

    // Cache les filtres
    filterContainer.style.display = "none";

    // Déconnexion
    loginLink.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        window.location.reload();
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const editionBar = document.getElementById('edition-bar');
    const modal = document.getElementById('modal');
    const modalGallery = document.getElementById('modal-gallery');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    // Affiche les projets dynamiquement dans la modale
    function afficherProjetsModale(projets) {
        modalGallery.innerHTML = '';
        projets.forEach(projet => {
            const figure = document.createElement('figure');

            const img = document.createElement('img');
            img.src = projet.imageUrl;
            img.alt = projet.title;

            const caption = document.createElement('figcaption');
            caption.textContent = projet.title;

            figure.appendChild(img);
            figure.appendChild(caption);

            // Bouton supprimer (optionnel)
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => figure.remove());
            figure.appendChild(deleteButton);

            modalGallery.appendChild(figure);
        });
    }

    // Clic sur Mode édition → ouvre modale
    editionBar.addEventListener('click', () => {
        modal.classList.remove('hidden');
        afficherProjetsModale(projets); // projets déjà récupérés via getProjets()
    });

    // Clic sur croix → ferme modale
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => modal.classList.add('hidden'));
    });
});
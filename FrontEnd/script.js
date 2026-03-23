const URL = 'http://localhost:5678/api/';
const gallery = document.getElementById('gallery-container');
const filterContainer = document.getElementById('filter-container');
const token = sessionStorage.getItem("token");
const modal = document.getElementById('modal');
const modalGallery = document.getElementById('modal-gallery');
const modifierBtn = document.getElementById('modifier-projets');

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

function afficherProjetsModale(projets) {
    modalGallery.innerHTML = '';
    projets.forEach(projet => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = projet.imageUrl;
        img.alt = projet.title;
        figure.appendChild(img);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            fetch(URL + 'works/' + projet.id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => {
                    if (response.status === 204) {
                        projets = projets.filter(p => p.id !== projet.id);
                        afficherProjets(projets);
                        afficherProjetsModale(projets);
                    } else {
                        console.error('Erreur lors de la suppression');
                    }
                })
                .catch(error => console.error('Erreur:', error));
        });

        figure.appendChild(deleteButton);
        modalGallery.appendChild(figure);
    });
}

function creerBoutonsFiltres(categories) {
    const tousButton = document.createElement('button');
    tousButton.textContent = 'Tous';
    tousButton.addEventListener('click', () => afficherProjets(projets));
    filterContainer.appendChild(tousButton);
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

// Mode édition
const editionBar = document.getElementById('edition-bar');
const loginLink = document.querySelector('nav ul li:nth-child(3)');

if (token) {
    editionBar.style.display = "block";
    modifierBtn.style.display = "block";
    document.getElementById('portfolio-header').style.paddingBottom = "80px";
    loginLink.textContent = "logout";
    filterContainer.style.display = "none";

    // Ouverture modale via bouton Modifier (sécurisé)
    modifierBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        afficherProjetsModale(projets);
    });

    // Déconnexion sans reload
    loginLink.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        editionBar.style.display = "none";
        modifierBtn.style.display = "none";
        filterContainer.style.display = "flex";
        loginLink.innerHTML = '<a href="login.html">login</a>';
        document.getElementById('portfolio-header').style.paddingBottom = "0px";
    });
}

// Fermeture modale croix
document.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Fermeture modale overlay
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
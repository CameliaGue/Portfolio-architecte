

const URL = 'http://localhost:5678/api/';
const gallery = document.getElementById('gallery-container');
const filterContainer = document.getElementById('filter-container');

let projets = [];

fetch(URL + 'works') 
    .then(response => response.json())
    .then(works => {
        projets = works;      
        afficherProjets(projets);
    })
    .catch(error => console.error('Erreur:', error));

fetch(URL + 'categories')
    .then(response => response.json())
    .then(categories => creerBoutonsFiltres(categories)) // on crée les boutons de filtre après avoir récupéré les catégories
    .catch(error => console.error('Erreur fetch catégories:', error));

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
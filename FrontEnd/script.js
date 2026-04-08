const URL = 'http://localhost:5678/api/';
const gallery = document.getElementById('gallery-container');
const filterContainer = document.getElementById('filter-container');
const token = sessionStorage.getItem("token");
const modal = document.getElementById('modal');
const modalGallery = document.getElementById('modal-gallery');
const modifierBtn = document.getElementById('modifier-projets');

let projets = [];

// Navigation entre les sections Galerie et Ajout dans la modale
function afficherSectionGalerie() {
    document.getElementById('modal-section-galerie').classList.remove('hidden');
    document.getElementById('modal-section-ajout').classList.add('hidden');
}

function afficherSectionAjout() {
    document.getElementById('modal-section-galerie').classList.add('hidden');
    document.getElementById('modal-section-ajout').classList.remove('hidden');
}

// Récupération des projets depuis l'API
function getProjets() {
    return fetch(URL + 'works') 
        .then(response => response.json()) 
        .then(works => {
            projets = works; 
            afficherProjets(projets); 
        })
        .catch(error => console.error('Erreur:', error));
}
getProjets(); 

// Récupération des catégories depuis l'API
function getCategories() {
    fetch(URL + 'categories')
        .then(response => response.json())
        .then(categories => {
            creerBoutonsFiltres(categories); 
            remplirSelectCategories(categories); 
        })
        .catch(error => console.error('Erreur fetch catégories:', error));
}
getCategories();

// Affichage des projets dans la galerie principale
function afficherProjets(projets) {
    gallery.innerHTML = '';

    projets.forEach(projet => {
        const figure = document.createElement('figure');
        figure.dataset.id = projet.id;

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

// Affichage des projets dans la modale d’édition avec possibilité de suppression
function afficherProjetsModale(projets) {   
    modalGallery.innerHTML = '';

    projets.forEach(projet => {
        const figure = document.createElement('figure');
        figure.dataset.id = projet.id;

        const img = document.createElement('img');
        img.src = projet.imageUrl;
        img.alt = projet.title;
        figure.appendChild(img);

        // Création du bouton de suppression pour chaque projet
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
                        figure.remove();
                        const figureGalerie = gallery.querySelector(`figure[data-id="${projet.id}"]`);
                        figureGalerie.remove();
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

// Création des boutons de filtre par catégorie
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

// Remplissage du select de catégories dans le formulaire d’ajout
function remplirSelectCategories(categories) {
    const select = document.getElementById('categorie-input');
    select.innerHTML = '<option value="">-- Choisir --</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Validation et envoi du formulaire d’ajout
function validerFormulaire() {
    const titre = document.getElementById('titre-input').value;
    const categorie = document.getElementById('categorie-input').value;
    const photoFile = document.getElementById('photo-input').files[0];

    console.log('titre:', titre);
    console.log('categorie:', categorie);
    console.log('photo:', photoFile);

    // Création d’un message d’erreur si nécessaire
    let errorMsg = document.getElementById('error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.id = 'error-message';
        errorMsg.style.color = 'red';
        errorMsg.style.textAlign = 'center';
        document.getElementById('valider-ajout').before(errorMsg);
    }

    // Vérification que tous les champs sont remplis
    if (!titre || !categorie || !photoFile) {
        errorMsg.textContent = 'Veuillez remplir tous les champs et ajouter une photo !';
        return;
    }
    errorMsg.textContent = '';

    // Préparation des données pour l’API
    const formData = new FormData();
    formData.append('title', titre);
    formData.append('category', categorie);
    formData.append('image', photoFile);

    // Envoi du formulaire à l’API
    fetch(URL + 'works', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de l\'ajout');
            }
        })
        .then(nouveauProjet => {
            projets.push(nouveauProjet);
            afficherProjets(projets);
            afficherProjetsModale(projets);

            // Réinitialisation du formulaire
            document.getElementById('titre-input').value = '';
            document.getElementById('categorie-input').value = '';
            document.getElementById('photo-upload-zone').innerHTML = `
            <i class="fa-regular fa-image"></i>
            <label for="photo-input">+ Ajouter photo</label>
            <input type="file" id="photo-input" accept=".jpg,.png" class="hidden">
            <p>jpg, png : 4mo max</p>
        `;
            // Ré-attache le listener sur le nouvel input et gère l’aperçu de la photo sélectionnée
            document.getElementById('photo-input').addEventListener('change', gererPreview);

            afficherSectionGalerie();
        })
        .catch(error => {
            errorMsg.textContent = 'Une erreur est survenue, veuillez réessayer.';
            console.error('Erreur:', error);
        });
}

// Gestion de l’aperçu de la photo sélectionnée
function gererPreview(e) { 
    const file = e.target.files[0];

    if (file) { 
        const reader = new FileReader();
        reader.onload = (event) => {  
            const uploadZone = document.getElementById('photo-upload-zone');
            uploadZone.innerHTML = `
                <img src="${event.target.result}" style="width: 100%; max-height: 200px; object-fit: contain;">
                <input type="file" id="photo-input" accept=".jpg,.png" class="hidden">
            `;

            // Recrée l’input pour permettre de changer l’image
            const newInput = document.getElementById('photo-input');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            newInput.files = dataTransfer.files;
            newInput.addEventListener('change', gererPreview);
        };
        reader.readAsDataURL(file);
    }
}

// Mode édition (affichage de la barre d’édition et bouton modifier)
const editionBar = document.getElementById('edition-bar');
const loginLink = document.querySelector('nav ul li:nth-child(3)');

if (token) {
    editionBar.style.display = "block";
    modifierBtn.style.display = "block";
    document.getElementById('portfolio-header').style.paddingBottom = "80px";
    loginLink.textContent = "logout";
    filterContainer.style.display = "none";

    // Ouverture de la modale d’édition
    modifierBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        getProjets().then(() => afficherProjetsModale(projets));
        afficherSectionGalerie();
    });

    // Déconnexion
    loginLink.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        editionBar.style.display = "none";
        modifierBtn.style.display = "none";
        filterContainer.style.display = "flex";
        loginLink.innerHTML = '<a href="login.html">login</a>';
        document.getElementById('portfolio-header').style.paddingBottom = "0px";
    });
}

// Bouton "Ajouter une photo" affiche section ajout
document.getElementById('open-add-photo').addEventListener('click', () => {
    afficherSectionAjout();
    document.getElementById('valider-ajout').onclick = validerFormulaire;
    document.getElementById('photo-input').addEventListener('change', gererPreview);
});

// Bouton retour, revient à la galerie
document.getElementById('back-to-galerie').addEventListener('click', () => {
    afficherSectionGalerie();
});

// Fermeture modale avec croix
document.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
    afficherSectionGalerie();
});

// Fermeture modale en cliquant sur l’overlay
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        afficherSectionGalerie();
    }
});
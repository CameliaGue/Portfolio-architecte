const gallery = document.getElementById('gallery-container');

fetch('http://localhost:5678/api/works') 
    .then(response => response.json())
    .then(projets => {
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
    })
    .catch(error => console.error('Erreur:', error));
    

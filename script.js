// REMPLACE CETTE URL par l'URL de déploiement de ton Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzjE6l2crxL1_De3d55V-EOQXHt3NwrgEx8gxaQjnt4QvUf9-oa9BAzIISl6ALYHA8t/exec';

async function loadGallery() {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des images');
        }

        const imageUrls = await response.json();
        
        if (imageUrls.error) {
            throw new Error(imageUrls.error);
        }

        loading.style.display = 'none';

        if (imageUrls.length === 0) {
            error.textContent = 'Aucune image trouvée dans le dossier.';
            error.style.display = 'block';
            return;
        }

        // Charger les images et calculer leur hauteur
        imageUrls.forEach((url, index) => {
            const img = new Image();
            img.onload = function() {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                // Calculer le nombre de rows nécessaires basé sur le ratio de l'image
                const ratio = this.height / this.width;
                const rows = Math.ceil(ratio * 20); // 20 est ajustable selon la taille souhaitée
                
                item.style.gridRowEnd = `span ${rows}`;
                
                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.alt = `Photo SAHP ${index + 1}`;
                imgElement.loading = 'lazy';
                imgElement.onclick = () => openLightbox(url);
                
                item.appendChild(imgElement);
                gallery.appendChild(item);
            };
            
            img.onerror = function() {
                console.error('Erreur de chargement pour:', url);
            };
            
            img.src = url;
        });

    } catch (err) {
        console.error('Erreur:', err);
        loading.style.display = 'none';
        error.textContent = `Erreur: ${err.message}`;
        error.style.display = 'block';
    }
}

function openLightbox(imageUrl) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imageUrl;
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
}

// Fermer le lightbox en cliquant en dehors de l'image
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// Fermer avec la touche Échap
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// Charger la galerie au chargement de la page
window.addEventListener('DOMContentLoaded', loadGallery);

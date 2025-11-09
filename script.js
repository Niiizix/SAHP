// REMPLACE CETTE URL par l'URL de déploiement de ton Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbwlwlOXrICvHumi_sCGgRyuFSpr8mdFYsvLkArNgrwhpfhC1DuGbtJ3Uu3MprIYDxn2/exec';

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

        imageUrls.forEach((url, index) => {
            
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.alt = `Photo SAHP ${index + 1}`;
            imgElement.loading = 'lazy';
            imgElement.onclick = () => openLightbox(url);
            
            item.appendChild(imgElement);
            gallery.appendChild(item);
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



// CONNEXION LOGIN

const API_URL = 'https://sahp.charliemoimeme.workers.dev/login';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const badge = document.getElementById('badge').value;
    const code_acces = document.getElementById('password').value;
    const submitBtn = document.querySelector('.btn-login');
    
    // Désactiver le bouton pendant la requête
    submitBtn.disabled = true;
    submitBtn.textContent = 'CONNEXION...';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ badge, code_acces })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Stocker les infos de l'agent (sécurisé car pas de données sensibles)
            sessionStorage.setItem('agent', JSON.stringify(data.agent));
            
            // Rediriger vers la page interne
            window.location.href = 'dashboard.html';
        } else {
            // Afficher l'erreur
            alert(data.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'CONNEXION';
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONNEXION';
    }
});

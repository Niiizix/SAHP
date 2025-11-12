// ========================================
// GALERIE MÉDIA
// ========================================

const API_URL = 'https://script.google.com/macros/s/AKfycbwlwlOXrICvHumi_sCGgRyuFSpr8mdFYsvLkArNgrwhpfhC1DuGbtJ3Uu3MprIYDxn2/exec';

async function loadGallery() {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    // Vérifier si les éléments existent (on est sur la page médias)
    if (!gallery || !loading || !error) return;

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
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageUrl;
        lightbox.classList.add('active');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

// ========================================
// LOGIN / AUTHENTIFICATION
// ========================================

const API2_URL = 'https://sahp.charliemoimeme.workers.dev/login';

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    
    // Vérifier si on est sur la page login
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const badge = document.getElementById('badge').value;
        const code_acces = document.getElementById('password').value;
        const submitBtn = document.querySelector('.btn-login');
        
        // Désactiver le bouton pendant la requête
        submitBtn.disabled = true;
        submitBtn.textContent = 'CONNEXION...';
        
        try {
            const response = await fetch(API2_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ badge, code_acces })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Stocker les infos de l'agent
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
}

// ========================================
// DASHBOARD - AFFICHAGE INFO AGENT
// ========================================
function initDashboard() {
    const agentName = document.getElementById('agentName');
    
    if (!agentName) return;
    
    const agentData = sessionStorage.getItem('agent');
    
    if (!agentData) {
        window.location.href = 'login.html';
    } else {
        const agent = JSON.parse(agentData);
        
        document.getElementById('agentName').textContent = `${agent.prenom} ${agent.nom}`;
        document.getElementById('agentBadge').textContent = `Badge: ${agent.badge}`;
        document.getElementById('agentGrade').textContent = `Grade: ${agent.grade}`;
    }
}

// ========================================
// NAVIGATION - SUBMENU
// ========================================

function initSubmenuToggle() {
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const parent = this.parentElement;
            const isOpen = parent.classList.contains('open');
            
            // Fermer tous les sous-menus du même niveau
            const siblings = parent.parentElement.querySelectorAll(':scope > .has-submenu');
            siblings.forEach(sibling => {
                if (sibling !== parent) {
                    sibling.classList.remove('open');
                }
            });
            
            // Toggle le sous-menu actuel
            parent.classList.toggle('open');
        });
    });
}

// ========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    // Initialiser la galerie si on est sur medias.html
    loadGallery();
    
    // Initialiser le login si on est sur login.html
    initLogin();

    // Initialiser le chargement des infos de l'agent
    initDashboard();

    // Initialiser le sous menu de la partie interne du site
    initSubmenuToggle();
    
    // Gérer le lightbox si présent
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        // Fermer le lightbox en cliquant en dehors de l'image
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});

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
// PERSONNEL - AFFICHAGE ET RECHERCHE
// ========================================

async function initPersonnel() {
    const tableContainer = document.getElementById('personnelTableContainer');
    const loading = document.getElementById('personnelLoading');
    const error = document.getElementById('personnelError');
    const searchInput = document.getElementById('personnelSearch');
    
    if (!tableContainer) return; // Pas sur la page personnel
    
    try {
        // TODO: Remplacer par l'URL de ton Worker Cloudflare
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/personnel');
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement du personnel');
        }
        
        const agents = await response.json();
        
        loading.style.display = 'none';
        
        if (agents.length === 0) {
            error.textContent = 'Aucun agent trouvé dans la base de données.';
            error.style.display = 'block';
            return;
        }
        
        // Stocker les agents pour la recherche
        window.allAgents = agents;
        
        // Afficher le tableau
        displayPersonnel(agents);
        
        // Gérer la recherche
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const filtered = agents.filter(agent => {
                    return (
                        agent.nom.toLowerCase().includes(searchTerm) ||
                        agent.prenom.toLowerCase().includes(searchTerm) ||
                        agent.badge.toLowerCase().includes(searchTerm) ||
                        agent.matricule.toLowerCase().includes(searchTerm) ||
                        agent.grade.toLowerCase().includes(searchTerm) ||
                        agent.poste_affectation.toLowerCase().includes(searchTerm)
                    );
                });
                displayPersonnel(filtered);
            });
        }
        
    } catch (err) {
        console.error('Erreur:', err);
        loading.style.display = 'none';
        error.textContent = `Erreur: ${err.message}`;
        error.style.display = 'block';
    }
}

function displayPersonnel(agents) {
    const container = document.getElementById('personnelTableContainer');
    
    if (agents.length === 0) {
        container.innerHTML = '<p class="no-results">Aucun résultat trouvé</p>';
        return;
    }
    
    // Hiérarchie des grades par poste
    const gradeOrder = {
        'La Mesa': ['Commissioner', 'Deputy Commissioner', 'Assistant Commissioner', 'Chief', 'Assistant Chief'],
        'Grapeseed': ['Captain', 'Lieutenant', 'Sergent', 'Senior Officer', 'Field Training Officer', 'Officer', 'Cadet'],
        'Chumash': ['Captain', 'Lieutenant', 'Sergent', 'Senior Officer', 'Field Training Officer', 'Officer', 'Cadet']
    };
    
    // Grouper par poste
    const groupedByPoste = {
        'La Mesa': [],
        'Grapeseed': [],
        'Chumash': []
    };
    
    agents.forEach(agent => {
        if (groupedByPoste[agent.poste_affectation]) {
            groupedByPoste[agent.poste_affectation].push(agent);
        }
    });
    
    // Générer le HTML
    let html = '';
    
    Object.keys(groupedByPoste).forEach(poste => {
        const agentsInPoste = groupedByPoste[poste];
        
        if (agentsInPoste.length === 0) return;
        
        // Trier par hiérarchie de grade
        agentsInPoste.sort((a, b) => {
            const orderA = gradeOrder[poste].indexOf(a.grade);
            const orderB = gradeOrder[poste].indexOf(b.grade);
            return orderA - orderB;
        });
        
        const posteClass = poste.toLowerCase().replace(' ', '');
        
        html += `
            <div class="poste-group">
                <div class="poste-header ${posteClass}">${poste}</div>
                <table class="personnel-table">
                    <thead>
                        <tr>
                            <th>Poste</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Grade</th>
                            <th>Matricule</th>
                            <th>Badge</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        agentsInPoste.forEach(agent => {
            html += `
                <tr>
                    <td><span class="poste-badge ${posteClass}">${agent.poste_affectation}</span></td>
                    <td>${agent.nom}</td>
                    <td>${agent.prenom}</td>
                    <td>${agent.grade}</td>
                    <td>${agent.matricule}</td>
                    <td>${agent.badge}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    container.innerHTML = html;
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

    // Initialiser le tableau du personnel
    initPersonnel();
    
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

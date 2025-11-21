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
// SYSTÈME DE PERMISSIONS
// ========================================

function getPermissionLevel(grade) {
    const niveaux = {
        // Niveau 1 - Direction
        'Commissioner': 1,
        'Deputy Commissioner': 1,
        'Assistant Commissioner': 1,
        'Chief': 1,
        'Assistant Chief': 1,
        
        // Niveau 2 - Captain
        'Captain': 2,
        
        // Niveau 3 - Lieutenant
        'Lieutenant': 3,
        
        // Niveau 4 - Grades inférieurs
        'Sergent': 4,
        'Senior Officer': 4,
        'Field Training Officer': 4,
        'Officer': 4,
        'Cadet': 4
    };
    
    return niveaux[grade] || 4; // Par défaut niveau 4 (le plus restreint)
}

function canSeeAllPostes(level) {
    return level <= 2; // Direction et Captain voient tout
}

function canCreateAgent(level) {
    return level <= 3; // Direction, Captain et Lieutenant
}

function canModifyAgent(level) {
    return level <= 2; // Direction et Captain
}

function canSeeCodeAcces(level) {
    return level === 1; // Seulement Direction
}

function canAddMedaille(level) {
    return level === 1; // Seulement Direction
}

function canAddRecommandation(level) {
    return level === 1; // Seulement Direction
}

function canAddSanction(level) {
    return level <= 3; // Direction, Captain, Lieutenant
}

function canSeeSanctionsTab(level, isOwnProfile) {
    // Niveau 1-3 voient toujours, niveau 4 seulement leur propre profil
    return level <= 3 || isOwnProfile;
}

function canSeeRecommandationsTab(level, isOwnProfile) {
    // Niveau 1-3 voient toujours, niveau 4 seulement leur propre profil
    return level <= 3 || isOwnProfile;
}

function canArchiveAgent(level) {
    return level <= 2; // Direction et Captain
}

function canSeeArchivesSection(level) {
    return level === 1; // Seulement Direction
}

function canDeleteAgent(level) {
    return level === 1; // Seulement Direction
}

// ========================================
// MAPPING DES INSIGNES
// ========================================

function getInsigneUrl(grade) {
    const insignesMap = {
        'Commissioner': 'imgs/insigne_commissioner.png',
        'Deputy Commissioner': 'imgs/insigne_deputy_commissioner.png',
        'Assistant Commissioner': 'imgs/insigne_assistant_commissioner.png',
        'Chief': 'imgs/insigne_chief.png',
        'Assistant Chief': 'imgs/insigne_assistant_chief.png',
        'Captain': 'imgs/insigne_captain.png',
        'Lieutenant': 'imgs/insigne_lieutenant.png',
        'Sergent': 'imgs/insigne_sergent.png',
        'Field Training Officer': 'imgs/insigne_fto.png'
    };
    
    return insignesMap[grade] || null;
}

// ========================================
// PERSONNEL - AFFICHAGE ET RECHERCHE
// ========================================

async function initPersonnel() {
    const tableContainer = document.getElementById('personnelTableContainer');
    const loading = document.getElementById('personnelLoading');
    const error = document.getElementById('personnelError');
    const searchInput = document.getElementById('personnelSearch');
    const addAgentBtn = document.querySelector('.add-agent-btn');
    
    if (!tableContainer) return;
    
    const agentData = sessionStorage.getItem('agent');
    if (!agentData) {
        window.location.href = 'login.html';
        return;
    }
    
    const currentAgent = JSON.parse(agentData);
    const permissionLevel = getPermissionLevel(currentAgent.grade);
    
    if (addAgentBtn && !canCreateAgent(permissionLevel)) {
        addAgentBtn.style.display = 'none';
    }
    
    try {
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/personnel');
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement du personnel');
        }
        
        let agents = await response.json();
        
        loading.style.display = 'none';
        
        if (agents.length === 0) {
            error.textContent = 'Aucun agent trouvé dans la base de données.';
            error.style.display = 'block';
            return;
        }
        
        // FILTRER selon les permissions
        if (!canSeeAllPostes(permissionLevel)) {
            const agentFullData = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${currentAgent.id}`).then(r => r.json());
            const posteAgent = agentFullData.poste_affectation;
            
            agents = agents.filter(agent => agent.poste_affectation === posteAgent);
        }
        
        window.allAgents = agents;
        window.currentPermissionLevel = permissionLevel;
        window.currentAgentId = currentAgent.id;
        window.currentAgentPoste = null; // Sera chargé si besoin
        
        // Charger le poste de l'agent si Lieutenant (pour la création)
        if (permissionLevel === 3) {
            const agentFullData = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${currentAgent.id}`).then(r => r.json());
            window.currentAgentPoste = agentFullData.poste_affectation;
        }
        
        displayPersonnel(agents);
        
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
    
    const permissionLevel = window.currentPermissionLevel || 4;
    
    // Séparer agents actifs et archivés
    const agentsActifs = agents.filter(a => !a.est_archive);
    const agentsArchives = agents.filter(a => a.est_archive);
    
    const gradeOrder = {
        'La Mesa': ['Commissioner', 'Deputy Commissioner', 'Assistant Commissioner', 'Chief', 'Assistant Chief'],
        'Grapeseed': ['Captain', 'Lieutenant', 'Sergent', 'Senior Officer', 'Field Training Officer', 'Officer', 'Cadet'],
        'Chumash': ['Captain', 'Lieutenant', 'Sergent', 'Senior Officer', 'Field Training Officer', 'Officer', 'Cadet']
    };
    
    const groupedByPoste = {
        'La Mesa': [],
        'Grapeseed': [],
        'Chumash': []
    };
    
    agentsActifs.forEach(agent => {
        if (groupedByPoste[agent.poste_affectation]) {
            groupedByPoste[agent.poste_affectation].push(agent);
        }
    });
    
    let html = '';
    
    // Afficher les postes actifs
    Object.keys(groupedByPoste).forEach(poste => {
        const agentsInPoste = groupedByPoste[poste];
        
        if (agentsInPoste.length === 0) return;
        
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
                <tr class="agent-row" data-agent-id="${agent.id}">
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
    
    // Afficher la section Archives (seulement pour Direction)
    if (canSeeArchivesSection(permissionLevel) && agentsArchives.length > 0) {
        agentsArchives.sort((a, b) => a.nom.localeCompare(b.nom));
        
        html += `
            <div class="poste-group archives-group">
                <div class="poste-header archives" onclick="toggleArchives()">
                    <span class="archive-toggle-icon">▶</span> Archives (${agentsArchives.length})
                </div>
                <div class="archives-content" style="display: none;">
                    <table class="personnel-table">
                        <thead>
                            <tr>
                                <th>Ancien Poste</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Grade</th>
                                <th>Matricule</th>
                                <th>Badge</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        agentsArchives.forEach(agent => {
            const posteClass = agent.poste_affectation.toLowerCase().replace(' ', '');
            html += `
                <tr class="agent-row archived-row" data-agent-id="${agent.id}">
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
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Event listeners
    document.querySelectorAll('.agent-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const agentId = this.dataset.agentId;
            openAgentModal(agentId);
        });
    });
}

function toggleArchives() {
    const content = document.querySelector('.archives-content');
    const icon = document.querySelector('.archive-toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}


// ========================================
// MODAL AGENT DÉTAIL
// ========================================

async function openAgentModal(agentId) {
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agentId}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails');
        }
        
        const agent = await response.json();
        
        displayAgentModal(agent);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de charger les détails de l\'agent');
    }
}

const TIMEZONE = 'Europe/Brussels';

function convertToLocalTime(dateString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return date;
}

function formatDate(dateString) {
    if (!dateString) return 'Non renseignée';
    
    // Si c'est déjà au format DD/MM/YYYY
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
    }
    
    // Si c'est au format YYYY-MM-DD (format SQL)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    // Essayer de parser avec Date en tenant compte du fuseau horaire
    const date = convertToLocalTime(dateString);
    if (!date) return 'Format invalide';
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: TIMEZONE
    };
    
    const formatted = new Intl.DateTimeFormat('fr-BE', options).format(date);
    return formatted;
}

function displayAgentModal(agent) {
    let modal = document.getElementById('agentModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'agentModal';
        modal.className = 'agent-modal';
        document.body.appendChild(modal);
    }
    
    const photoUrl = agent.photo_url || 'imgs/default-agents.png';
    const photoHTML = `<img src="${photoUrl}" alt="Photo ${agent.prenom} ${agent.nom}">`;
    
    const dateEntree = agent.date_entree ? formatDate(agent.date_entree) : 'Non renseignée';
    
    const permissionLevel = window.currentPermissionLevel || 4;
    const currentAgentId = window.currentAgentId;
    const isOwnProfile = agent.id === currentAgentId;
    
    const showEditBtn = canModifyAgent(permissionLevel);
    const showArchiveBtn = canArchiveAgent(permissionLevel);
    const showDeleteBtn = canDeleteAgent(permissionLevel) && agent.est_archive;
    
    const showSanctionsTab = canSeeSanctionsTab(permissionLevel, isOwnProfile);
    const showRecommandationsTab = canSeeRecommandationsTab(permissionLevel, isOwnProfile);
    
    // Boutons d'action
    let buttonsHTML = '';
    
    // Bouton modifier
    if (showEditBtn) {
        buttonsHTML += `<button class="edit-agent-btn" onclick="openEditAgentModal(${agent.id})" title="Modifier l'agent">✏️</button>`;
    }
    
    // Bouton archiver/déployer
    if (showArchiveBtn) {
        if (agent.est_archive) {
            buttonsHTML += `<button class="deploy-agent-btn" onclick="deployAgent(${agent.id})" title="Déployer l'agent">🔄</button>`;
        } else {
            buttonsHTML += `<button class="archive-agent-btn" onclick="archiveAgent(${agent.id})" title="Archiver l'agent">📦</button>`;
        }
    }
    
    // Bouton supprimer (seulement si archivé et Direction)
    if (showDeleteBtn) {
        buttonsHTML += `<button class="delete-agent-btn" onclick="deleteAgent(${agent.id})" title="Supprimer définitivement">🗑️</button>`;
    }
    
    // Insigne de grade
    const insigneUrl = getInsigneUrl(agent.grade);
    const insigneHTML = insigneUrl ? `<img src="${insigneUrl}" alt="Insigne ${agent.grade}" class="grade-insigne">` : '';

    // Service Strips
     let serviceStripHTML = '';
    if (agent.date_entree) {
        const serviceStripData = getServiceStripData(agent.date_entree);
        if (serviceStripData.url) {
            serviceStripHTML = `<img src="${serviceStripData.url}" alt="Service Strip" class="service-strip strips-${serviceStripData.stripCount}">`;
        }
    }
    
    modal.innerHTML = `
        <div class="agent-modal-content">
            <span class="modal-close" onclick="closeAgentModal()">&times;</span>
            
            <div class="agent-sidebar">
                ${buttonsHTML}
                <div class="agent-photo" ${permissionLevel === 1 ? `onclick="uploadPhoto(${agent.id})"` : ''}>
                    ${photoHTML}
                    ${permissionLevel === 1 ? '<div class="agent-photo-overlay">Cliquer pour changer</div>' : ''}
                </div>
                
                <div class="agent-grade-badge">
                    ${insigneHTML}
                    <span class="grade-text">${agent.grade}</span>
                </div>
                <div class="agent-fullname">${agent.prenom} ${agent.nom}</div>
                ${agent.est_archive ? '<div class="agent-archived-badge">ARCHIVÉ</div>' : ''}
                
                <div class="agent-info-list">
                    <div class="agent-info-item">
                        <div class="agent-info-label">Téléphone</div>
                        <div class="agent-info-value">${agent.numero_telephone || 'Non renseigné'}</div>
                    </div>
                    
                    <div class="agent-info-item">
                        <div class="agent-info-label">Matricule</div>
                        <div class="agent-info-value">${agent.matricule}</div>
                    </div>
                    
                    <div class="agent-info-item">
                        <div class="agent-info-label">Badge</div>
                        <div class="agent-info-value">${agent.badge}</div>
                    </div>
                    
                    <div class="agent-info-item">
                        <div class="agent-info-label">Date d'entrée</div>
                        <div class="agent-info-value service-info">
                            <span>${dateEntree}</span>
                            ${serviceStripHTML}
                        </div>
                    </div>
                    
                    ${agent.specialisation_1 || agent.specialisation_2 ? `
                    <div class="agent-info-item">
                        <div class="agent-info-label">Spécialisations</div>
                        <div class="agent-info-value">
                            ${[agent.specialisation_1, agent.specialisation_2].filter(Boolean).join('<br>')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${agent.qualification_1 || agent.qualification_2 ? `
                    <div class="agent-info-item">
                        <div class="agent-info-label">Qualifications</div>
                        <div class="agent-info-value">
                            ${[agent.qualification_1, agent.qualification_2].filter(Boolean).join('<br>')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="agent-main-content">
                <div class="agent-tabs">
                    <button class="agent-tab active" data-tab="medailles">Médailles</button>
                    ${showRecommandationsTab ? '<button class="agent-tab" data-tab="recommandations">Recommandations</button>' : ''}
                    ${showSanctionsTab ? '<button class="agent-tab" data-tab="sanctions">Sanctions</button>' : ''}
                </div>
                
                <div id="medailles-tab" class="tab-content active">
                    ${canAddMedaille(permissionLevel) ? `<button class="add-item-btn" onclick="openAddMedailleModal(${agent.id})">+ Ajouter une Médaille</button>` : ''}
                    <div id="medailles-list" class="items-list"></div>
                </div>
                
                ${showRecommandationsTab ? `
                <div id="recommandations-tab" class="tab-content">
                    ${canAddRecommandation(permissionLevel) ? `<button class="add-item-btn" onclick="openAddRecommandationModal(${agent.id})">+ Ajouter une Recommandation</button>` : ''}
                    <div id="recommandations-list" class="items-list"></div>
                </div>
                ` : ''}
                
                ${showSanctionsTab ? `
                <div id="sanctions-tab" class="tab-content">
                    ${canAddSanction(permissionLevel) ? `<button class="add-item-btn" onclick="openAddSanctionModal(${agent.id})">+ Ajouter une Sanction</button>` : ''}
                    <div id="sanctions-list" class="items-list"></div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAgentModal();
        }
    });
    
    initTabs();
    
    loadAgentMedailles(agent.id);
    if (showRecommandationsTab) loadAgentRecommandations(agent.id);
    if (showSanctionsTab) loadAgentSanctions(agent.id);
}

function closeAgentModal() {
    const modal = document.getElementById('agentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function uploadPhoto(agentId) {
    // Créer un input file caché
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop volumineuse (max 5MB)');
            return;
        }
        
        // Créer un FormData
        const formData = new FormData();
        formData.append('agentId', agentId);
        formData.append('photo', file);
        
        try {
            // Afficher un loader
            const photoDiv = document.querySelector('.agent-photo');
            if (photoDiv) {
                photoDiv.style.opacity = '0.5';
                photoDiv.style.pointerEvents = 'none';
            }
            
            const response = await fetch('https://sahp.charliemoimeme.workers.dev/upload-photo', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Recharger la modal avec la nouvelle photo
                openAgentModal(agentId);
            } else {
                alert('Erreur: ' + data.error);
                if (photoDiv) {
                    photoDiv.style.opacity = '1';
                    photoDiv.style.pointerEvents = 'auto';
                }
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'upload: ' + error.message);
            const photoDiv = document.querySelector('.agent-photo');
            if (photoDiv) {
                photoDiv.style.opacity = '1';
                photoDiv.style.pointerEvents = 'auto';
            }
        }
    };
    
    // Déclencher le sélecteur de fichier
    input.click();
}

// ========================================
// ARCHIVER / DÉPLOYER UN AGENT
// ========================================

async function archiveAgent(agentId) {
    if (!confirm('Êtes-vous sûr de vouloir archiver cet agent ? Il perdra l\'accès à la partie interne du site.')) {
        return;
    }
    
    try {
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAgentModal();
            alert('Agent archivé avec succès.');
            initPersonnel();
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'archivage');
    }
}

async function deployAgent(agentId) {
    if (!confirm('Êtes-vous sûr de vouloir déployer cet agent ? Il retrouvera l\'accès à la partie interne.')) {
        return;
    }
    
    try {
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAgentModal();
            alert('Agent déployé avec succès.');
            initPersonnel();
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du déploiement');
    }
}

// ========================================
// TABS NAVIGATION
// ========================================

function initTabs() {
    const tabs = document.querySelectorAll('.agent-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Désactiver tous les tabs
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activer le tab cliqué
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// ========================================
// MÉDAILLES
// ========================================

async function loadAgentMedailles(agentId) {
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agentId}/medailles`);
        const medailles = await response.json();
        
        const list = document.getElementById('medailles-list');
        const permissionLevel = window.currentPermissionLevel || 4;
        const canDelete = permissionLevel === 1; // Seulement Direction
        
        if (medailles.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>Aucune médaille attribuée</p></div>';
            return;
        }
        
        list.innerHTML = medailles.map(m => `
            <div class="item-card">
                <div class="item-content">
                    <div class="item-title">🏅 ${m.nom}</div>
                    <div class="item-description">${m.description_personnalisee || m.description || ''}</div>
                    <div class="item-meta">
                        <span>Attribuée par: ${m.attribue_par}</span>
                        <span>Le: ${formatDateTime(m.date_attribution)}</span>
                    </div>
                </div>
                ${canDelete ? `<button class="delete-btn" onclick="deleteAgentMedaille(${m.id}, ${agentId})">🗑️</button>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function openAddMedailleModal(agentId) {
    try {
        // Récupérer la liste des médailles disponibles
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/medailles');
        const medailles = await response.json();
        
        // Créer la modal
        const modal = document.createElement('div');
        modal.className = 'form-modal active';
        modal.innerHTML = `
            <div class="form-modal-content">
                <h3>Ajouter une Médaille</h3>
                <form id="addMedailleForm">
                    <div class="form-group">
                        <label>Sélectionner une médaille *</label>
                        <select id="medailleSelect" required>
                            <option value="">-- Choisir --</option>
                            ${medailles.map(m => `<option value="${m.id}" data-description="${m.description || ''}">${m.nom}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description personnalisée *</label>
                        <textarea id="medailleDescription" required placeholder="Décrivez pourquoi cette médaille est attribuée..." style="min-height: 100px;"></textarea>
                    </div>
                    <div class="form-buttons">
                        <button type="button" class="form-btn cancel" onclick="closeFormModal()">Annuler</button>
                        <button type="submit" class="form-btn submit">Valider</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Afficher la description par défaut quand on sélectionne une médaille
        document.getElementById('medailleSelect').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const defaultDesc = selectedOption.getAttribute('data-description');
            document.getElementById('medailleDefaultDescription').value = defaultDesc || 'Aucune description par défaut';
        });
        
        document.getElementById('addMedailleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const medailleId = document.getElementById('medailleSelect').value;
            const description = document.getElementById('medailleDescription').value;
            const agentData = JSON.parse(sessionStorage.getItem('agent'));
            
            const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/add-medaille', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: agentId,
                    medaille_id: medailleId,
                    description_personnalisee: description,
                    attribue_par: `${agentData.prenom} ${agentData.nom}`
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeFormModal();
                loadAgentMedailles(agentId);
            } else {
                alert('Erreur: ' + data.error);
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des médailles');
    }
}

async function deleteAgentMedaille(medailleId, agentId) {
    if (!confirm('Supprimer cette médaille ?')) return;
    
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/medaille/${medailleId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadAgentMedailles(agentId);
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// ========================================
// RECOMMANDATIONS
// ========================================

async function loadAgentRecommandations(agentId) {
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agentId}/recommandations`);
        const recommandations = await response.json();
        
        const list = document.getElementById('recommandations-list');
        const permissionLevel = window.currentPermissionLevel || 4;
        const canDelete = permissionLevel === 1; // Seulement Direction
        
        if (recommandations.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>Aucune recommandation</p></div>';
            return;
        }
        
        list.innerHTML = recommandations.map(r => `
            <div class="item-card">
                <div class="item-content">
                    <div class="item-description">${r.texte}</div>
                    <div class="item-meta">
                        <span>Ajoutée par: ${r.ajoutee_par}</span>
                        <span>Le: ${formatDateTime(r.date_ajout)}</span>
                    </div>
                </div>
                ${canDelete ? `<button class="delete-btn" onclick="deleteAgentRecommandation(${r.id}, ${agentId})">🗑️</button>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function openAddRecommandationModal(agentId) {
    const modal = document.createElement('div');
    modal.className = 'form-modal active';
    modal.innerHTML = `
        <div class="form-modal-content">
            <h3>Ajouter une Recommandation</h3>
            <form id="addRecommandationForm">
                <div class="form-group">
                    <label>Texte de la recommandation</label>
                    <textarea id="recommandationTexte" required placeholder="Entrez la recommandation..."></textarea>
                </div>
                <div class="form-buttons">
                    <button type="button" class="form-btn cancel" onclick="closeFormModal()">Annuler</button>
                    <button type="submit" class="form-btn submit">Valider</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('addRecommandationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const texte = document.getElementById('recommandationTexte').value;
        const agentData = JSON.parse(sessionStorage.getItem('agent'));
        
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/add-recommandation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_id: agentId,
                texte: texte,
                ajoutee_par: `${agentData.prenom} ${agentData.nom}`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeFormModal();
            loadAgentRecommandations(agentId);
        } else {
            alert('Erreur: ' + data.error);
        }
    });
}

async function deleteAgentRecommandation(recommandationId, agentId) {
    if (!confirm('Supprimer cette recommandation ?')) return;
    
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/recommandation/${recommandationId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadAgentRecommandations(agentId);
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// ========================================
// SANCTIONS
// ========================================

async function loadAgentSanctions(agentId) {
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agentId}/sanctions`);
        const sanctions = await response.json();
        
        const list = document.getElementById('sanctions-list');
        const permissionLevel = window.currentPermissionLevel || 4;
        const canDelete = permissionLevel === 1; // Seulement Direction
        
        if (sanctions.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>Aucune sanction</p></div>';
            return;
        }
        
        list.innerHTML = sanctions.map(s => `
            <div class="item-card sanction severity-${s.gravite}">
                <div class="item-content">
                    <div class="item-title">${s.nom}</div>
                    <div class="item-description">${s.explication}</div>
                    <div class="item-meta">
                        <span>Ajoutée par: ${s.ajoutee_par}</span>
                        <span>Le: ${formatDateTime(s.date_ajout)}</span>
                    </div>
                </div>
                ${canDelete ? `<button class="delete-btn" onclick="deleteAgentSanction(${s.id}, ${agentId})">🗑️</button>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function openAddSanctionModal(agentId) {
    try {
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/sanctions-types');
        const sanctionsTypes = await response.json();
        
        const modal = document.createElement('div');
        modal.className = 'form-modal active';
        modal.innerHTML = `
            <div class="form-modal-content">
                <h3>Ajouter une Sanction</h3>
                <form id="addSanctionForm">
                    <div class="form-group">
                        <label>Type de sanction</label>
                        <select id="sanctionTypeSelect" required>
                            <option value="">-- Choisir --</option>
                            ${sanctionsTypes.map(s => `<option value="${s.id}">${s.nom}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Explication</label>
                        <textarea id="sanctionExplication" required placeholder="Expliquez la raison de la sanction..."></textarea>
                    </div>
                    <div class="form-buttons">
                        <button type="button" class="form-btn cancel" onclick="closeFormModal()">Annuler</button>
                        <button type="submit" class="form-btn submit">Valider</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('addSanctionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const sanctionTypeId = document.getElementById('sanctionTypeSelect').value;
            const explication = document.getElementById('sanctionExplication').value;
            const agentData = JSON.parse(sessionStorage.getItem('agent'));
            
            const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/add-sanction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: agentId,
                    sanction_type_id: sanctionTypeId,
                    explication: explication,
                    ajoutee_par: `${agentData.prenom} ${agentData.nom}`
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeFormModal();
                loadAgentSanctions(agentId);
            } else {
                alert('Erreur: ' + data.error);
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des sanctions');
    }
}

async function deleteAgentSanction(sanctionId, agentId) {
    if (!confirm('Supprimer cette sanction ?')) return;
    
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/sanction/${sanctionId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadAgentSanctions(agentId);
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// ========================================
// UTILITAIRES
// ========================================

function closeFormModal() {
    const modal = document.querySelector('.form-modal');
    if (modal) {
        modal.remove();
    }
}

function formatDateTime(dateString) {
    if (!dateString) return 'Date inconnue';
    
    const date = convertToLocalTime(dateString);
    if (!date) return 'Date invalide';
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE,
        hour12: false
    };
    
    const formatted = new Intl.DateTimeFormat('fr-BE', options).format(date);
    return formatted.replace(',', ' à');
}

// ========================================
// GESTION AGENTS (CRÉER / MODIFIER)
// ========================================

function convertToInputDate(dateString) {
    if (!dateString) return '';
    
    // Si déjà au format YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    
    // Si au format DD/MM/YYYY
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }
    
    return '';
}

function convertToDisplayDate(dateString) {
    if (!dateString) return '';
    
    // Si au format YYYY-MM-DD (input date)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    return dateString;
}

const GRADES_LIST = [
    'Commissioner',
    'Deputy Commissioner',
    'Assistant Commissioner',
    'Chief',
    'Assistant Chief',
    'Captain',
    'Lieutenant',
    'Sergent',
    'Senior Officer',
    'Field Training Officer',
    'Officer',
    'Cadet'
];

const POSTES_LIST = ['La Mesa', 'Grapeseed', 'Chumash'];

function openAddAgentModal() {
    const permissionLevel = window.currentPermissionLevel || 4;
    const currentPoste = window.currentAgentPoste;
    const isLieutenant = permissionLevel === 3;
    
    const today = new Date().toISOString().split('T')[0];
    
    const modal = document.createElement('div');
    modal.className = 'agent-form-modal active';
    modal.innerHTML = `
        <div class="agent-form-content">
            <h3>Nouvel Agent</h3>
            <form id="addAgentForm">
                <div class="agent-form-grid">
                    <div class="form-group">
                        <label>Prénom *</label>
                        <input type="text" id="agent_prenom" required>
                    </div>
                    <div class="form-group">
                        <label>Nom *</label>
                        <input type="text" id="agent_nom" required>
                    </div>
                    <div class="form-group">
                        <label>Numéro de téléphone *</label>
                        <input type="text" id="agent_telephone" placeholder="555-0123">
                    </div>
                    <div class="form-group">
                        <label>Matricule *</label>
                        <input type="text" id="agent_matricule" required placeholder="MAT-2024-001">
                    </div>
                    <div class="form-group">
                        <label>Badge *</label>
                        <input type="text" id="agent_badge" required placeholder="BADGE-001">
                    </div>
                    <div class="form-group">
                        <label>Code d'accès *</label>
                        <input type="password" id="agent_code_acces" required>
                    </div>
                    <div class="form-group">
                        <label>Grade *</label>
                        <select id="agent_grade" required>
                            <option value="">-- Sélectionner --</option>
                            ${GRADES_LIST.map(g => `<option value="${g}">${g}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Poste d'affectation *</label>
                        <select id="agent_poste" required ${isLieutenant ? 'disabled' : ''}>
                            ${isLieutenant ? 
                                `<option value="${currentPoste}" selected>${currentPoste}</option>` :
                                `<option value="">-- Sélectionner --</option>
                                ${POSTES_LIST.map(p => `<option value="${p}">${p}</option>`).join('')}`
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date d'entrée *</label>
                        <input type="date" id="agent_date_entree" value="${today}" required>
                    </div>
                    <div class="form-group full-width">
                        <label>Spécialisation 1</label>
                        <input type="text" id="agent_specialisation_1">
                    </div>
                    <div class="form-group full-width">
                        <label>Spécialisation 2</label>
                        <input type="text" id="agent_specialisation_2">
                    </div>
                    <div class="form-group full-width">
                        <label>Qualification 1</label>
                        <input type="text" id="agent_qualification_1">
                    </div>
                    <div class="form-group full-width">
                        <label>Qualification 2</label>
                        <input type="text" id="agent_qualification_2">
                    </div>
                </div>
                <div class="agent-form-buttons">
                    <button type="button" class="form-btn cancel" onclick="closeAgentFormModal()">Annuler</button>
                    <button type="submit" class="form-btn submit">Créer l'agent</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('addAgentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const agentData = {
            prenom: document.getElementById('agent_prenom').value,
            nom: document.getElementById('agent_nom').value,
            numero_telephone: document.getElementById('agent_telephone').value,
            matricule: document.getElementById('agent_matricule').value,
            badge: document.getElementById('agent_badge').value,
            code_acces: document.getElementById('agent_code_acces').value,
            grade: document.getElementById('agent_grade').value,
            poste_affectation: isLieutenant ? currentPoste : document.getElementById('agent_poste').value,
            date_entree: convertToDisplayDate(document.getElementById('agent_date_entree').value),
            specialisation_1: document.getElementById('agent_specialisation_1').value,
            specialisation_2: document.getElementById('agent_specialisation_2').value,
            qualification_1: document.getElementById('agent_qualification_1').value,
            qualification_2: document.getElementById('agent_qualification_2').value
        };
        
        try {
            const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agentData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeAgentFormModal();
                alert('Agent créé avec succès !');
                initPersonnel();
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création');
        }
    });
}

function closeAgentFormModal() {
    const modal = document.querySelector('.agent-form-modal');
    if (modal) {
        modal.remove();
    }
}

async function openEditAgentModal(agentId) {
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agentId}`);
        const agent = await response.json();
        
        const permissionLevel = window.currentPermissionLevel || 4;
        const showCodeAcces = canSeeCodeAcces(permissionLevel);
        
        const modal = document.createElement('div');
        modal.className = 'agent-form-modal active';
        modal.innerHTML = `
            <div class="agent-form-content">
                <h3>Modifier l'agent</h3>
                <form id="editAgentForm">
                    <div class="agent-form-grid">
                        <div class="form-group">
                            <label>Prénom *</label>
                            <input type="text" id="edit_prenom" value="${agent.prenom}" required>
                        </div>
                        <div class="form-group">
                            <label>Nom *</label>
                            <input type="text" id="edit_nom" value="${agent.nom}" required>
                        </div>
                        <div class="form-group">
                            <label>Numéro de téléphone *</label>
                            <input type="text" id="edit_telephone" value="${agent.numero_telephone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Matricule *</label>
                            <input type="text" id="edit_matricule" value="${agent.matricule}" required>
                        </div>
                        <div class="form-group">
                            <label>Badge *</label>
                            <input type="text" id="edit_badge" value="${agent.badge}" required>
                        </div>
                        ${showCodeAcces ? `
                        <div class="form-group">
                            <label>Code d'accès *</label>
                            <input type="password" id="edit_code_acces" value="${agent.code_acces}" required>
                        </div>
                        ` : ''}
                        <div class="form-group">
                            <label>Grade *</label>
                            <select id="edit_grade" required>
                                ${GRADES_LIST.map(g => `<option value="${g}" ${g === agent.grade ? 'selected' : ''}>${g}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Poste d'affectation *</label>
                            <select id="edit_poste" required>
                                ${POSTES_LIST.map(p => `<option value="${p}" ${p === agent.poste_affectation ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date d'entrée *</label>
                            <input type="date" id="edit_date_entree" value="${convertToInputDate(agent.date_entree)}" required>
                        </div>
                        <div class="form-group full-width">
                            <label>Spécialisation 1</label>
                            <input type="text" id="edit_specialisation_1" value="${agent.specialisation_1 || ''}">
                        </div>
                        <div class="form-group full-width">
                            <label>Spécialisation 2</label>
                            <input type="text" id="edit_specialisation_2" value="${agent.specialisation_2 || ''}">
                        </div>
                        <div class="form-group full-width">
                            <label>Qualification 1</label>
                            <input type="text" id="edit_qualification_1" value="${agent.qualification_1 || ''}">
                        </div>
                        <div class="form-group full-width">
                            <label>Qualification 2</label>
                            <input type="text" id="edit_qualification_2" value="${agent.qualification_2 || ''}">
                        </div>
                    </div>
                    <div class="agent-form-buttons">
                        <button type="button" class="form-btn cancel" onclick="closeAgentFormModal()">Annuler</button>
                        <button type="submit" class="form-btn submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('editAgentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const agentData = {
                id: agentId,
                prenom: document.getElementById('edit_prenom').value,
                nom: document.getElementById('edit_nom').value,
                numero_telephone: document.getElementById('edit_telephone').value,
                matricule: document.getElementById('edit_matricule').value,
                badge: document.getElementById('edit_badge').value,
                code_acces: showCodeAcces ? document.getElementById('edit_code_acces').value : agent.code_acces,
                grade: document.getElementById('edit_grade').value,
                poste_affectation: document.getElementById('edit_poste').value,
                date_entree: convertToDisplayDate(document.getElementById('edit_date_entree').value),
                specialisation_1: document.getElementById('edit_specialisation_1').value,
                specialisation_2: document.getElementById('edit_specialisation_2').value,
                qualification_1: document.getElementById('edit_qualification_1').value,
                qualification_2: document.getElementById('edit_qualification_2').value
            };
            
            try {
                const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(agentData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    closeAgentFormModal();
                    closeAgentModal();
                    alert('Agent modifié avec succès !');
                    initPersonnel();
                } else {
                    alert('Erreur: ' + data.error);
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification');
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des données');
    }
}

// ========================================
// FONCTION SUPPRESSION
// ========================================

async function deleteAgent(agentId) {
    if (!confirm('⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de SUPPRIMER DÉFINITIVEMENT cet agent de la base de données.\n\nCette action est IRRÉVERSIBLE.\n\nÊtes-vous absolument certain ?')) {
        return;
    }
    
    // Double confirmation
    if (!confirm('Dernière confirmation : voulez-vous vraiment supprimer cet agent définitivement ?')) {
        return;
    }
    
    try {
        const response = await fetch('https://sahp.charliemoimeme.workers.dev/agent/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAgentModal();
            alert('Agent supprimé définitivement.');
            initPersonnel();
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// ========================================
// SERVICE STRIPS
// ========================================

function calculateServiceMonths(dateEntree) {
    if (!dateEntree) return 0;

    let entreeDate;

    // Format DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateEntree)) {
        const [day, month, year] = dateEntree.split('/');
        entreeDate = new Date(year, month - 1, day);
    }
    // Format YYYY-MM-DD
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateEntree)) {
        entreeDate = new Date(dateEntree);
    } 
    else {
        return 0;
    }

    const now = new Date();

    let yearsDiff = now.getFullYear() - entreeDate.getFullYear();
    let monthsDiff = now.getMonth() - entreeDate.getMonth();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    // Si le jour actuel est plus petit que le jour d'entrée → on enlève 1 mois
    if (now.getDate() < entreeDate.getDate()) {
        totalMonths--;
    }

    // Si résultat négatif, on retourne 0
    return Math.max(0, totalMonths);
}

function getServiceStripData(dateEntree) {
    const months = calculateServiceMonths(dateEntree);
    
    let url = null;
    let stripCount = 0;
    
    // Déterminer le service strip approprié
    if (months >= 24) {
        url = 'imgs/STRIPS_8.png';
        stripCount = 8; // 24 mois = 8 strips
    } else if (months >= 18) {
        url = 'imgs/STRIPS_7.png';
        stripCount = 7; // 18 mois = 7 strips
    } else if (months >= 15) {
        url = 'imgs/STRIPS_6.png';
        stripCount = 6; // 15 mois = 6 strips
    } else if (months >= 12) {
        url = 'imgs/STRIPS_5.png';
        stripCount = 5; // 12 mois = 5 strips
    } else if (months >= 9) {
        url = 'imgs/STRIPS_4.png';
        stripCount = 4; // 9 mois = 4 strips
    } else if (months >= 6) {
        url = 'imgs/STRIPS_3.png';
        stripCount = 3; // 6 mois = 3 strips
    } else if (months >= 3) {
        url = 'imgs/STRIPS_2.png';
        stripCount = 2; // 3 mois = 2 strip
    } else if (months >= 1) {
        url = 'imgs/STRIPS_1.png';
        stripCount = 1; // 1 mois = 1 strip
    } else {
        stripCount = 0; // Autres = 0 strip
    }
    
    return { url, stripCount };
}

// ========================================
// RAPPORTS - CHARGEMENT ET AFFICHAGE
// ========================================

async function initRapports() {
    const tableContainer = document.getElementById('rapportsTableContainer');
    const loading = document.getElementById('rapportsLoading');
    const error = document.getElementById('rapportsError');
    const searchInput = document.getElementById('rapportsSearch');
    
    if (!tableContainer) return;
    
    try {
        // Charger les rapports d'arrestation
        const responseArrestations = await fetch('https://sahp.charliemoimeme.workers.dev/rapports/arrestations');
        const arrestations = await responseArrestations.json();
        
        // Charger les rapports OIS
        const responseOIS = await fetch('https://sahp.charliemoimeme.workers.dev/rapports/ois');
        const ois = await responseOIS.json();
        
        loading.style.display = 'none';
        
        // Combiner et marquer le type
        const allRapports = [
            ...arrestations.map(r => ({ ...r, type: 'arrestation' })),
            ...ois.map(r => ({ ...r, type: 'ois' }))
        ];
        
        // Trier par date (plus récent en premier)
        allRapports.sort((a, b) => new Date(b.date_rapport) - new Date(a.date_rapport));
        
        if (allRapports.length === 0) {
            error.textContent = 'Aucun rapport trouvé.';
            error.style.display = 'block';
            return;
        }
        
        window.allRapports = allRapports;
        
        displayRapports(allRapports);
        
        // Gérer la recherche
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const filtered = allRapports.filter(rapport => {
                    return (
                        rapport.agent_nom.toLowerCase().includes(searchTerm) ||
                        rapport.agent_prenom.toLowerCase().includes(searchTerm) ||
                        rapport.agent_badge.toLowerCase().includes(searchTerm) ||
                        rapport.statut.toLowerCase().includes(searchTerm) ||
                        rapport.type.toLowerCase().includes(searchTerm)
                    );
                });
                displayRapports(filtered);
            });
        }
        
    } catch (err) {
        console.error('Erreur:', err);
        loading.style.display = 'none';
        error.textContent = `Erreur: ${err.message}`;
        error.style.display = 'block';
    }
}

function displayRapports(rapports) {
    const container = document.getElementById('rapportsTableContainer');
    
    if (rapports.length === 0) {
        container.innerHTML = '<p class="no-results">Aucun résultat trouvé</p>';
        return;
    }
    
    // Grouper par type
    const groupedByType = {
        'Arrestations': rapports.filter(r => r.type === 'arrestation'),
        'OIS': rapports.filter(r => r.type === 'ois')
    };
    
    let html = '';
    
    Object.keys(groupedByType).forEach(typeName => {
        const rapportsInType = groupedByType[typeName];
        
        if (rapportsInType.length === 0) return;
        
        const typeClass = typeName.toLowerCase();
        
        html += `
            <div class="poste-group">
                <div class="poste-header ${typeClass}">${typeName}</div>
                <table class="personnel-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Badge</th>
                            <th>Date/Heure</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        rapportsInType.forEach(rapport => {
            const statutClass = rapport.statut.toLowerCase().replace(' ', '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const typeLabel = rapport.type === 'arrestation' ? 'Arrestation' : 'OIS';
            
            html += `
                <tr class="agent-row" data-rapport-id="${rapport.id}" data-rapport-type="${rapport.type}">
                    <td><span class="type-badge ${rapport.type}">${typeLabel}</span></td>
                    <td>${rapport.agent_nom}</td>
                    <td>${rapport.agent_prenom}</td>
                    <td>${rapport.agent_badge}</td>
                    <td>${formatDateTime(rapport.date_rapport)}</td>
                    <td><span class="statut-badge ${statutClass}">${rapport.statut}</span></td>
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
    
    // Ajouter les event listeners
    document.querySelectorAll('.agent-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const rapportId = this.dataset.rapportId;
            const rapportType = this.dataset.rapportType;
            openRapportModal(rapportId, rapportType);
        });
    });
}

// ========================================
// MODAL CHOIX TYPE DE RAPPORT
// ========================================

function openNewRapportTypeModal() {
    const modal = document.createElement('div');
    modal.className = 'type-rapport-modal active';
    modal.innerHTML = `
        <div class="type-rapport-content">
            <h3>Nouveau Rapport</h3>
            <div class="type-rapport-grid">
                <div class="type-rapport-card" onclick="openNewRapportArrestationModal()">
                    <div class="type-rapport-card-icon">🚔</div>
                    <div class="type-rapport-card-title">Rapport d'Arrestation</div>
                    <div class="type-rapport-card-desc">
                        Pour documenter une arrestation, les charges retenues et les circonstances.
                    </div>
                </div>
                
                <div class="type-rapport-card" onclick="openNewRapportOISModal()">
                    <div class="type-rapport-card-icon">🔫</div>
                    <div class="type-rapport-card-title">Rapport OIS</div>
                    <div class="type-rapport-card-desc">
                        Officer Involved Shooting - Usage de l'arme à feu par un agent.
                    </div>
                </div>
            </div>
            <div class="type-rapport-cancel">
                <button onclick="closeTypeRapportModal()">Annuler</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTypeRapportModal();
        }
    });
}

function closeTypeRapportModal() {
    const modal = document.querySelector('.type-rapport-modal');
    if (modal) {
        modal.remove();
    }
}

// ========================================
// MODALS CRÉATION RAPPORTS (PLACEHOLDERS)
// ========================================

function openNewRapportArrestationModal() {
    closeTypeRapportModal();
    alert('Formulaire de rapport d\'arrestation à implémenter');
    // TODO: Créer le formulaire complet
}

function openNewRapportOISModal() {
    closeTypeRapportModal();
    alert('Formulaire de rapport OIS à implémenter');
    // TODO: Créer le formulaire complet
}

// ========================================
// MODAL DÉTAIL RAPPORT (PLACEHOLDER)
// ========================================

function openRapportModal(rapportId, rapportType) {
    alert(`Affichage du rapport ${rapportType} #${rapportId} - À implémenter`);
    // TODO: Créer la modal de détail complète
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

    // Initialiser les rapports
    initRapports();
    
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







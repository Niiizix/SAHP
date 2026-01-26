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

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        // Effacer toutes les données de session
        sessionStorage.clear();
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    }
}

// ========================================
// SYSTÈME DE THÈME CLAIR/SOMBRE
// À AJOUTER dans script.js
// ========================================

// Initialiser le thème au chargement
function initTheme() {
    // Récupérer le thème sauvegardé (par défaut: clair)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle entre clair et sombre
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Appliquer le nouveau thème
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Mettre à jour l'icône avec animation
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.classList.add('rotating');
        setTimeout(() => btn.classList.remove('rotating'), 500);
    }
    
    updateThemeIcon(newTheme);
}

// Mettre à jour l'icône du bouton
function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        sessionStorage.clear();
        // Ne pas effacer localStorage pour garder la préférence de thème
        window.location.href = 'index.html';
    }
}

// ========================================
// SYSTÈME DE HIÉRARCHIE
// ========================================

const GRADE_HIERARCHY = {
    'Commissioner': 1,
    'Deputy Commissioner': 2,
    'Assistant Commissioner': 3,
    'Chief': 4,
    'Assistant Chief': 5,
    'Captain': 6,
    'Lieutenant': 7,
    'Sergent': 8,
    'Senior Officer': 9,
    'Field Training Officer': 10,
    'Officer': 11,
    'Cadet': 12
};

function getGradeHierarchyLevel(grade) {
    return GRADE_HIERARCHY[grade] || 999;
}

function canActOnAgent(actorGrade, targetGrade) {
    const actorLevel = getGradeHierarchyLevel(actorGrade);
    const targetLevel = getGradeHierarchyLevel(targetGrade);
    return actorLevel < targetLevel;
}

function canCreateAgentWithGrade(creatorGrade, newAgentGrade) {
    const creatorLevel = getGradeHierarchyLevel(creatorGrade);
    const newAgentLevel = getGradeHierarchyLevel(newAgentGrade);
    return creatorLevel <= newAgentLevel;
}

function getSelectableGrades(creatorGrade) {
    const creatorLevel = getGradeHierarchyLevel(creatorGrade);
    return Object.keys(GRADE_HIERARCHY).filter(grade => {
        const gradeLevel = getGradeHierarchyLevel(grade);
        return gradeLevel >= creatorLevel;
    });
}

// ========================================
// VÉRIFICATION DES PERMISSIONS EN TEMPS RÉEL
// ========================================

async function verifyAgentAccess() {
    const agentData = sessionStorage.getItem('agent');
    
    // Si pas connecté, rediriger vers login
    if (!agentData) {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    const agent = JSON.parse(agentData);
    
    try {
        // Récupérer les infos actuelles de l'agent depuis la BDD
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/agent/${agent.id}`);
        
        if (!response.ok) {
            throw new Error('Agent non trouvé');
        }
        
        const currentAgentData = await response.json();
        
        // VÉRIFICATION 1 : Agent archivé
        if (currentAgentData.est_archive) {
            sessionStorage.clear();
            alert('⚠️ Votre compte a été archivé. Vous n\'avez plus accès à l\'intranet.');
            window.location.href = 'login.html';
            return false;
        }
        
        // VÉRIFICATION 2 : Mettre à jour les données si le grade a changé
        if (currentAgentData.grade !== agent.grade || 
            currentAgentData.poste_affectation !== agent.poste_affectation ||
            currentAgentData.nom !== agent.nom ||
            currentAgentData.prenom !== agent.prenom) {
            
            // Mettre à jour les données en session
            const updatedAgent = {
                id: currentAgentData.id,
                prenom: currentAgentData.prenom,
                nom: currentAgentData.nom,
                grade: currentAgentData.grade,
                badge: currentAgentData.badge
            };
            
            sessionStorage.setItem('agent', JSON.stringify(updatedAgent));
            
            // Afficher une notification si le grade a changé
            if (currentAgentData.grade !== agent.grade) {
                console.log(`Grade modifié : ${agent.grade} → ${currentAgentData.grade}`);
                
                // Recharger la page pour appliquer les nouvelles permissions
                window.location.reload();
                return false;
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        sessionStorage.clear();
        alert('⚠️ Erreur de vérification. Veuillez vous reconnecter.');
        window.location.href = 'login.html';
        return false;
    }
}

// ========================================
// DASHBOARD - AFFICHAGE INFO AGENT
// ========================================
async function initDashboard() {
    const agentName = document.getElementById('agentName');
    
    if (!agentName) return;
    
    // VÉRIFIER L'ACCÈS AVANT TOUT
    const hasAccess = await verifyAgentAccess();
    if (!hasAccess) return;
    
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

function canModifyAgent(level, actorGrade, targetGrade) {
    if (level > 2) return false;
    return canActOnAgent(actorGrade, targetGrade);
}

function canSeeCodeAcces(level) {
    return level === 1;
}

function canAddMedaille(level) {
    return level === 1;
}

function canAddRecommandation(level) {
    return level === 1;
}

function canAddSanction(level, actorGrade, targetGrade) {
    if (level > 3) return false;
    return canActOnAgent(actorGrade, targetGrade);
}

function canSeeSanctionsTab(level, isOwnProfile) {
    return level <= 3 || isOwnProfile;
}

function canSeeRecommandationsTab(level, isOwnProfile) {
    return level <= 3 || isOwnProfile;
}

function canArchiveAgent(level, actorGrade, targetGrade) {
    if (level > 2) return false;
    return canActOnAgent(actorGrade, targetGrade);
}

function canSeeArchivesSection(level) {
    return level === 1;
}

function canDeleteAgent(level, actorGrade, targetGrade) {
    if (level !== 1) return false;
    return canActOnAgent(actorGrade, targetGrade);
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
    
    // VÉRIFIER L'ACCÈS AVANT TOUT
    const hasAccess = await verifyAgentAccess();
    if (!hasAccess) return;
    
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
        window.currentAgentPoste = null;
        
        // Charger le poste de l'agent si Lieutenant
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
                <table class="personnel-table-new">
                    <thead>
                        <tr>
                            <th>Date d'entrée</th>
                            <th>Grade</th>
                            <th>Insigne</th>
                            <th>Badge</th>
                            <th>Nom</th>
                            <th>Ancienneté</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        agentsInPoste.forEach(agent => {
            const insigneUrl = getInsigneUrl(agent.grade);
            const insigneHTML = insigneUrl ? `<img src="${insigneUrl}" alt="Insigne ${agent.grade}" class="table-insigne">` : '';
            
            const serviceMonths = calculateServiceMonths(agent.date_entree);
            const serviceStripData = agent.date_entree ? getServiceStripData(agent.date_entree) : { url: null, stripCount: 0 };
            const serviceStripHTML = serviceStripData.url 
                ? `<img src="${serviceStripData.url}" alt="Service Strip" class="table-service-strip strips-${serviceStripData.stripCount}">` 
                : '';
            
            html += `
                <tr class="agent-row" data-agent-id="${agent.id}">
                    <td class="td-date">${DateFormatter.toDisplay(agent.date_entree)}</td>
                    <td class="td-grade">${agent.grade}</td>
                    <td class="td-insigne">${insigneHTML}</td>
                    <td class="td-badge">${agent.badge}</td>
                    <td class="td-nom">${agent.nom} ${agent.prenom}</td>
                    <td class="td-anciennete">
                        <div class="anciennete-container">
                            <span class="anciennete-months">${serviceMonths} mois</span>
                            ${serviceStripHTML}
                        </div>
                    </td>
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
                    <table class="personnel-table-new">
                        <thead>
                            <tr>
                                <th>Date d'entrée</th>
                                <th>Grade</th>
                                <th>Insigne</th>
                                <th>Badge</th>
                                <th>Nom</th>
                                <th>Ancienneté</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        agentsArchives.forEach(agent => {
            const insigneUrl = getInsigneUrl(agent.grade);
            const insigneHTML = insigneUrl ? `<img src="${insigneUrl}" alt="Insigne ${agent.grade}" class="table-insigne">` : '';
            
            const serviceMonths = calculateServiceMonths(agent.date_entree);
            const serviceStripData = agent.date_entree ? getServiceStripData(agent.date_entree) : { url: null, stripCount: 0 };
            const serviceStripHTML = serviceStripData.url 
                ? `<img src="${serviceStripData.url}" alt="Service Strip" class="table-service-strip strips-${serviceStripData.stripCount}">` 
                : '';
            
            html += `
                <tr class="agent-row archived-row" data-agent-id="${agent.id}">
                    <td class="td-date">${DateFormatter.toDisplay(agent.date_entree)}</td>
                    <td class="td-grade">${agent.grade}</td>
                    <td class="td-insigne">${insigneHTML}</td>
                    <td class="td-badge">${agent.badge}</td>
                    <td class="td-nom">${agent.nom} ${agent.prenom}</td>
                    <td class="td-anciennete">
                        <div class="anciennete-container">
                            <span class="anciennete-months">${serviceMonths} mois</span>
                            ${serviceStripHTML}
                        </div>
                    </td>
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

async function displayAgentModal(agent) {
    let modal = document.getElementById('agentModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'agentModal';
        modal.className = 'agent-modal';
        document.body.appendChild(modal);
    }
    
    const photoUrl = agent.photo_url || 'imgs/default-agents.png';
    const photoHTML = `<img src="${photoUrl}" alt="Photo ${agent.prenom} ${agent.nom}">`;
    
    const dateEntree = agent.date_entree ? DateFormatter.toDisplay(agent.date_entree) : 'Non renseignée';
    
    const agentData = JSON.parse(sessionStorage.getItem('agent'));
    const currentAgentGrade = agentData.grade;
    const permissionLevel = window.currentPermissionLevel || 4;
    const currentAgentId = window.currentAgentId;
    const isOwnProfile = agent.id === currentAgentId;
    
    // VÉRIFICATIONS HIÉRARCHIQUES
    const canModify = canModifyAgent(permissionLevel, currentAgentGrade, agent.grade);
    const canArchive = canArchiveAgent(permissionLevel, currentAgentGrade, agent.grade);
    const canDelete = canDeleteAgent(permissionLevel, currentAgentGrade, agent.grade) && agent.est_archive;
    const canAddSanctions = canAddSanction(permissionLevel, currentAgentGrade, agent.grade);
    
    const showSanctionsTab = canSeeSanctionsTab(permissionLevel, isOwnProfile);
    const showRecommandationsTab = canSeeRecommandationsTab(permissionLevel, isOwnProfile);
    
    // Boutons d'action
    let buttonsHTML = '';
    
    // Bouton modifier (seulement si hiérarchiquement autorisé)
    if (canModify) {
        buttonsHTML += `<button class="edit-agent-btn" onclick="openEditAgentModal(${agent.id})" title="Modifier l'agent">✏️</button>`;
    }
    
    // Bouton archiver/déployer (seulement si hiérarchiquement autorisé)
    if (canArchive) {
        if (agent.est_archive) {
            buttonsHTML += `<button class="deploy-agent-btn" onclick="deployAgent(${agent.id})" title="Déployer l'agent">🔄</button>`;
        } else {
            buttonsHTML += `<button class="archive-agent-btn" onclick="archiveAgent(${agent.id})" title="Archiver l'agent">📦</button>`;
        }
    }
    
    // Bouton supprimer (seulement si archivé ET hiérarchiquement autorisé)
    if (canDelete) {
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
                ${agent.est_archive ? `<div class="agent-archived-badge">ARCHIVÉ LE ${DateFormatter.toDisplay(agent.date_archivage)}</div>` : ''}
                
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
                    ${canAddSanctions ? `<button class="add-item-btn" onclick="openAddSanctionModal(${agent.id})">+ Ajouter une Sanction</button>` : ''}
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
                CacheManager.delete(`/agent/${agentId}`);
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
        await LoadingManager.wrap(
            APIManager.post('/agent/archive', { agent_id: agentId }),
            'Archivage en cours...'
        );
        
        closeAgentModal();
        CacheManager.delete('/personnel');
        alert('Agent archivé avec succès.');
        initPersonnel();
        
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
        await LoadingManager.wrap(
            APIManager.post('/agent/deploy', { agent_id: agentId }),
            'Déploiement en cours...'
        );
        
        closeAgentModal();
        CacheManager.delete('/personnel');
        alert('Agent déployé avec succès.');
        initPersonnel();
        
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
                        <span>Le: ${DateFormatter.toDateTime(m.date_attribution)}</span>
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
                        <button type="button" class="form-btn cancel" onclick="ModalManager.close('.form-modal')">Annuler</button>
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
                ModalManager.close('.form-modal');
                CacheManager.delete(`/agent/${agentId}/medailles`);
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
    await APIManager.deleteItem('medaille', medailleId, agentId, loadAgentMedailles);
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
                        <span>Le: ${DateFormatter.toDateTime(r.date_ajout)}</span>
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
    ModalManager.createFormModal({
        title: 'Ajouter une Recommandation',
        formId: 'addRecommandationForm',
        fields: [
            {
                type: 'textarea',
                id: 'recommandationTexte',
                label: 'Texte de la recommandation',
                required: true,
                placeholder: 'Entrez la recommandation...'
            }
        ],
        submitText: 'Valider',
        onSubmit: async (e) => {
            e.preventDefault();
            
            try {
                const texte = document.getElementById('recommandationTexte').value;
                const agentData = JSON.parse(sessionStorage.getItem('agent'));
                
                const data = await APIManager.post('/agent/add-recommandation', {
                    agent_id: agentId,
                    texte: texte,
                    ajoutee_par: `${agentData.prenom} ${agentData.nom}`
                });
                
                if (data.success) {
                    ModalManager.close('.form-modal');
                    CacheManager.delete(`/agent/${agentId}/recommandations`);
                    loadAgentRecommandations(agentId);
                } else {
                    alert('Erreur: ' + data.error);
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de l\'ajout de la recommandation');
            }
        }
    });
}

async function deleteAgentRecommandation(recommandationId, agentId) {
    await APIManager.deleteItem('recommandation', recommandationId, agentId, loadAgentRecommandations);
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
                        <span>Le: ${DateFormatter.toDateTime(s.date_ajout)}</span>
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
        const sanctionsTypes = await APIManager.get('/sanctions-types');
        
        ModalManager.createFormModal({
            title: 'Ajouter une Sanction',
            formId: 'addSanctionForm',
            fields: [
                {
                    type: 'select',
                    id: 'sanctionTypeSelect',
                    label: 'Type de sanction',
                    required: true,
                    options: sanctionsTypes.map(s => ({ value: s.id, label: s.nom }))
                },
                {
                    type: 'textarea',
                    id: 'sanctionExplication',
                    label: 'Explication',
                    required: true,
                    placeholder: 'Expliquez la raison de la sanction...'
                }
            ],
            submitText: 'Valider',
            onSubmit: async (e) => {
                e.preventDefault();
                
                try {
                    const sanctionTypeId = document.getElementById('sanctionTypeSelect').value;
                    const explication = document.getElementById('sanctionExplication').value;
                    const agentData = JSON.parse(sessionStorage.getItem('agent'));
                    
                    const data = await APIManager.post('/agent/add-sanction', {
                        agent_id: agentId,
                        sanction_type_id: sanctionTypeId,
                        explication: explication,
                        ajoutee_par: `${agentData.prenom} ${agentData.nom}`
                    });
                    
                    if (data.success) {
                        ModalManager.close('.form-modal');
                        CacheManager.delete(`/agent/${agentId}/sanctions`);
                        loadAgentSanctions(agentId);
                    } else {
                        alert('Erreur: ' + data.error);
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'ajout de la sanction');
                }
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des sanctions');
    }
}

async function deleteAgentSanction(sanctionId, agentId) {
    await APIManager.deleteItem('sanction', sanctionId, agentId, loadAgentSanctions);
}

// ========================================
// GESTION AGENTS (CRÉER / MODIFIER)
// ========================================

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
    const agentData = JSON.parse(sessionStorage.getItem('agent'));
    const currentAgentGrade = agentData.grade;
    const permissionLevel = window.currentPermissionLevel || 4;
    const currentPoste = window.currentAgentPoste;
    const isLieutenant = permissionLevel === 3;
    
    // Récupérer les grades sélectionnables
    const selectableGrades = getSelectableGrades(currentAgentGrade);
    
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
                            ${selectableGrades.map(g => `<option value="${g}">${g}</option>`).join('')}
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
        
        const selectedGrade = document.getElementById('agent_grade').value;
        
        // VÉRIFICATION HIÉRARCHIQUE AVANT CRÉATION
        if (!canCreateAgentWithGrade(currentAgentGrade, selectedGrade)) {
            alert('❌ Vous ne pouvez pas créer un agent avec un grade supérieur au vôtre.');
            return;
        }
        
        const agentData = {
            prenom: document.getElementById('agent_prenom').value,
            nom: document.getElementById('agent_nom').value,
            numero_telephone: document.getElementById('agent_telephone').value,
            matricule: document.getElementById('agent_matricule').value,
            badge: document.getElementById('agent_badge').value,
            code_acces: document.getElementById('agent_code_acces').value,
            grade: selectedGrade,
            poste_affectation: isLieutenant ? currentPoste : document.getElementById('agent_poste').value,
            date_entree: DateFormatter.toDisplay(document.getElementById('agent_date_entree').value),
            specialisation_1: document.getElementById('agent_specialisation_1').value,
            specialisation_2: document.getElementById('agent_specialisation_2').value,
            qualification_1: document.getElementById('agent_qualification_1').value,
            qualification_2: document.getElementById('agent_qualification_2').value
        };
        
        try {
        Validator.validate(agentData, {
            prenom: { required: true, label: 'Prénom' },
            nom: { required: true, label: 'Nom' },
            numero_telephone: { required: true, label: 'Numéro de téléphone' },
            matricule: { required: true, label: 'Matricule' },
            badge: { required: true, label: 'Badge' },
            code_acces: { required: true, minLength: 4, label: 'Code d\'accès' },
            grade: { required: true, label: 'Grade' },
            poste_affectation: { required: true, label: 'Poste d\'affectation' },
            date_entree: { required: true, label: 'Date d\'entrée' }
        });
    } catch (error) {
        alert('⚠️ Erreur de validation:\n' + error.message);
        return;
    }
    
    try {
        await LoadingManager.wrap(
            APIManager.post('/agent/create', agentData),
            'Création de l\'agent...'
        );
        
        closeAgentFormModal();
        CacheManager.delete('/personnel');
        alert('Agent créé avec succès !');
        initPersonnel();
        
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
        
        const agentData = JSON.parse(sessionStorage.getItem('agent'));
        const currentAgentGrade = agentData.grade;
        const permissionLevel = window.currentPermissionLevel || 4;
        const showCodeAcces = canSeeCodeAcces(permissionLevel);
        
        // Vérifier si on peut modifier cet agent
        if (!canModifyAgent(permissionLevel, currentAgentGrade, agent.grade)) {
            alert('❌ Vous ne pouvez pas modifier un agent de grade supérieur ou égal au vôtre.');
            return;
        }
        
        // Récupérer les grades sélectionnables
        const selectableGrades = getSelectableGrades(currentAgentGrade);
        
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
                                ${selectableGrades.map(g => `<option value="${g}" ${g === agent.grade ? 'selected' : ''}>${g}</option>`).join('')}
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
                            <input type="date" id="edit_date_entree" value="${DateFormatter.toInput(agent.date_entree)}" required>
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
            
            const selectedGrade = document.getElementById('edit_grade').value;
            
            // VÉRIFICATION HIÉRARCHIQUE AVANT MODIFICATION
            if (!canCreateAgentWithGrade(currentAgentGrade, selectedGrade)) {
                alert('❌ Vous ne pouvez pas attribuer un grade supérieur au vôtre.');
                return;
            }
            
            const agentData = {
                id: agentId,
                prenom: document.getElementById('edit_prenom').value,
                nom: document.getElementById('edit_nom').value,
                numero_telephone: document.getElementById('edit_telephone').value,
                matricule: document.getElementById('edit_matricule').value,
                badge: document.getElementById('edit_badge').value,
                code_acces: showCodeAcces ? document.getElementById('edit_code_acces').value : agent.code_acces,
                grade: selectedGrade,
                poste_affectation: document.getElementById('edit_poste').value,
                date_entree: DateFormatter.toDisplay(document.getElementById('edit_date_entree').value),
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
                    CacheManager.delete('/personnel');
                    CacheManager.deleteByPrefix('/agent/');
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
    
    if (!confirm('Dernière confirmation : voulez-vous vraiment supprimer cet agent définitivement ?')) {
        return;
    }
    
    try {
        await LoadingManager.wrap(
            fetch('https://sahp.charliemoimeme.workers.dev/agent/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: agentId })
            }).then(r => r.json()),
            'Suppression en cours...'
        );
        
        closeAgentModal();
        CacheManager.delete('/personnel');
        CacheManager.deleteByPrefix('/agent/');
        alert('Agent supprimé définitivement.');
        initPersonnel();
        
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
        stripCount = 6; // 18 mois = 6 strips
    } else if (months >= 15) {
        url = 'imgs/STRIPS_6.png';
        stripCount = 5; // 15 mois = 5 strips
    } else if (months >= 12) {
        url = 'imgs/STRIPS_5.png';
        stripCount = 4; // 12 mois = 4 strips
    } else if (months >= 9) {
        url = 'imgs/STRIPS_4.png';
        stripCount = 3; // 9 mois = 3 strips
    } else if (months >= 6) {
        url = 'imgs/STRIPS_3.png';
        stripCount = 2; // 6 mois = 2 strips
    } else if (months >= 3) {
        url = 'imgs/STRIPS_2.png';
        stripCount = 1; // 3 mois = 1 strip
    } else if (months >= 1) {
        url = 'imgs/STRIPS_1.png';
        stripCount = 1; // 1 mois = 1 strip
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
    
    // VÉRIFIER L'ACCÈS AVANT TOUT
    const hasAccess = await verifyAgentAccess();
    if (!hasAccess) return;
    
    try {
        // Charger les rapports d'arrestation
        const responseArrestations = await fetch('https://sahp.charliemoimeme.workers.dev/rapports/arrestations');
        const arrestations = await responseArrestations.json();
        
        // Charger les rapports OIS (gérer si la route n'existe pas encore)
        let ois = [];
        try {
            const responseOIS = await fetch('https://sahp.charliemoimeme.workers.dev/rapports/ois');
            if (responseOIS.ok) {
                ois = await responseOIS.json();
            }
        } catch (e) {
            console.log('Rapports OIS pas encore disponibles');
        }
        
        loading.style.display = 'none';
        
        // Combiner et marquer le type
        const allRapports = [
            ...(Array.isArray(arrestations) ? arrestations : []).map(r => ({ ...r, type: 'arrestation' })),
            ...(Array.isArray(ois) ? ois : []).map(r => ({ ...r, type: 'ois' }))
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
                    <td>${DateFormatter.toDateTime(rapport.date_rapport)}</td>
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
                
                <div class="type-rapport-card" onclick="openNewRapportPlainteModal()">
                    <div class="type-rapport-card-icon">📋</div>
                    <div class="type-rapport-card-title">Plainte</div>
                    <div class="type-rapport-card-desc">
                        Enregistrer une plainte déposée par un citoyen.
                    </div>
                </div>

                <div class="type-rapport-card" onclick="openNewRapportIncidentModal()">
                    <div class="type-rapport-card-icon">📁​</div>
                    <div class="type-rapport-card-title">Rapport d'incident</div>
                    <div class="type-rapport-card-desc">
                        Pour documenter un incident et le faire remonter à la hiérarchie
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
// FORMULAIRE RAPPORT D'ARRESTATION COMPLET
// À REMPLACER dans script.js
// ========================================

let currentCitoyen = null; // Citoyen trouvé dans la BDD
let mugshotFiles = { face: null, gauche: null, droit: null }; // Photos uploadées

function openNewRapportArrestationModal() {
    closeTypeRapportModal();
    
    const agentData = JSON.parse(sessionStorage.getItem('agent'));
    const now = new Date().toTimeString().slice(0, 5);
    
    // Reset des variables globales
    currentCitoyen = null;
    mugshotFiles = { face: null, gauche: null, droit: null };
    
    const modal = document.createElement('div');
    modal.className = 'rapport-form-modal active';
    modal.innerHTML = `
        <div class="rapport-form-content">
            <h3>📝 Rapport d'Arrestation</h3>
            <form id="rapportArrestationForm">
                
                <!-- Section : Personne Arrêtée -->
                <div class="form-section">
                    <h4>👤 Personne Arrêtée</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nom *</label>
                            <input type="text" id="citoyen_nom" required>
                        </div>
                        <div class="form-group">
                            <label>Prénom *</label>
                            <input type="text" id="citoyen_prenom" required>
                        </div>
                        <div class="form-group">
                            <label>Date de naissance * (JJ/MM/AAAA)</label>
                            <input type="text" id="citoyen_ddn" placeholder="01/01/1990" required>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn-check-citoyen" onclick="checkCitoyen()">🔍 Vérifier dans la base</button>
                        </div>
                        <div class="form-group full-width">
                            <label>Lieu de résidence *</label>
                            <input type="text" id="lieu_residence" placeholder="123 Main Street, Los Santos" required>
                        </div>
                        <div class="form-group full-width">
                            <label>Caractéristiques physiques spécifiques *</label>
                            <textarea id="caracteristiques" rows="3" placeholder="Ex: Tatouage bras gauche, cicatrice front, etc." required></textarea>
                        </div>
                    </div>
                    
                    <!-- Zone Mugshots -->
                    <div id="mugshotZone" style="display: none;">
                        <!-- Sera rempli dynamiquement -->
                    </div>
                </div>
                
                <!-- Section : Détails de l'arrestation -->
                <div class="form-section">
                    <h4>🚔 Détails de l'Arrestation</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Heure de lecture des droits *</label>
                            <input type="time" id="heure_droits" value="${now}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Contexte de l'interpellation *</label>
                        <textarea id="contexte" rows="8" placeholder="Décrivez en détail le contexte et le déroulement de l'interpellation..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Faits retenus contre le suspect *</label>
                        <textarea id="faits_retenus" rows="6" placeholder="Listez les faits et infractions retenus..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Autres informations sur le dossier</label>
                        <textarea id="autres_infos" rows="4" placeholder="Informations complémentaires (facultatif)"></textarea>
                    </div>
                </div>
                
                <div class="rapport-form-buttons">
                    <button type="button" class="form-btn cancel" onclick="closeRapportFormModal()">Annuler</button>
                    <button type="submit" class="form-btn submit">Soumettre le rapport</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gestion de la soumission
    document.getElementById('rapportArrestationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitRapportArrestation(agentData);
    });
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            if (confirm('Fermer le formulaire ? Les données non sauvegardées seront perdues.')) {
                closeRapportFormModal();
            }
        }
    });
}

// ========================================
// VÉRIFIER SI LE CITOYEN EXISTE
// ========================================

async function checkCitoyen() {
    const nom = document.getElementById('citoyen_nom').value.trim();
    const prenom = document.getElementById('citoyen_prenom').value.trim();
    const ddn = document.getElementById('citoyen_ddn').value.trim();
    
    if (!nom || !prenom || !ddn) {
        alert('⚠️ Veuillez remplir Nom, Prénom et Date de naissance');
        return;
    }
    
    try {
        const response = await fetch(`https://sahp.charliemoimeme.workers.dev/citoyen/search?nom=${encodeURIComponent(nom)}&prenom=${encodeURIComponent(prenom)}&ddn=${encodeURIComponent(ddn)}`);
        const data = await response.json();
        
        if (data.found) {
            currentCitoyen = data.citoyen;
            
            // PRÉ-REMPLIR LES CHAMPS avec les données existantes
            document.getElementById('lieu_residence').value = data.citoyen.lieu_residence || '';
            document.getElementById('caracteristiques').value = data.citoyen.caracteristiques_physiques || '';
            
            displayMugshotCheck(data.citoyen);
        } else {
            currentCitoyen = null;
            
            // VIDER LES CHAMPS si pas trouvé
            document.getElementById('lieu_residence').value = '';
            document.getElementById('caracteristiques').value = '';
            
            displayMugshotUpload();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la vérification');
    }
}

// ========================================
// AFFICHER MUGSHOTS EXISTANTS
// ========================================

function displayMugshotCheck(citoyen) {
    const zone = document.getElementById('mugshotZone');
    
    if (!citoyen.mugshot_face_url) {
        displayMugshotUpload();
        return;
    }
    
    zone.innerHTML = `
        <div class="mugshot-check-section">
            <h5>📸 Mugshots existants</h5>
            <div class="mugshots-display">
                <div class="mugshot-item">
                    <img src="${citoyen.mugshot_face_url}" alt="Face">
                    <p>Face</p>
                </div>
                <div class="mugshot-item">
                    <img src="${citoyen.mugshot_gauche_url}" alt="Profil gauche">
                    <p>Profil Gauche</p>
                </div>
                <div class="mugshot-item">
                    <img src="${citoyen.mugshot_droit_url}" alt="Profil droit">
                    <p>Profil Droit</p>
                </div>
            </div>
            <div class="mugshot-question">
                <label>L'individu a-t-il toujours la même apparence ?</label>
                <div class="radio-group">
                    <label><input type="radio" name="meme_apparence" value="oui" checked> Oui</label>
                    <label><input type="radio" name="meme_apparence" value="non"> Non</label>
                </div>
            </div>
            <div id="newMugshotUpload" style="display: none;"></div>
        </div>
    `;
    zone.style.display = 'block';
    
    // Écouter le changement
    document.querySelectorAll('input[name="meme_apparence"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'non') {
                displayNewMugshotUpload();
            } else {
                document.getElementById('newMugshotUpload').style.display = 'none';
            }
        });
    });
}

function displayNewMugshotUpload() {
    const container = document.getElementById('newMugshotUpload');
    container.innerHTML = `
        <h5>📸 Nouveaux Mugshots</h5>
        <div class="mugshot-upload-grid">
            <div class="mugshot-upload-item">
                <label>Photo de Face *</label>
                <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'face')" required>
                <div id="preview-face"></div>
            </div>
            <div class="mugshot-upload-item">
                <label>Profil Gauche *</label>
                <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'gauche')" required>
                <div id="preview-gauche"></div>
            </div>
            <div class="mugshot-upload-item">
                <label>Profil Droit *</label>
                <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'droit')" required>
                <div id="preview-droit"></div>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

// ========================================
// AFFICHER UPLOAD MUGSHOTS (NOUVEAU CITOYEN)
// ========================================

function displayMugshotUpload() {
    const zone = document.getElementById('mugshotZone');
    
    zone.innerHTML = `
        <div class="mugshot-upload-section">
            <h5>📸 Mugshots (obligatoires)</h5>
            <div class="mugshot-upload-grid">
                <div class="mugshot-upload-item">
                    <label>Photo de Face *</label>
                    <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'face')" required>
                    <div id="preview-face"></div>
                </div>
                <div class="mugshot-upload-item">
                    <label>Profil Gauche *</label>
                    <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'gauche')" required>
                    <div id="preview-gauche"></div>
                </div>
                <div class="mugshot-upload-item">
                    <label>Profil Droit *</label>
                    <input type="file" accept="image/*" onchange="handleMugshotUpload(event, 'droit')" required>
                    <div id="preview-droit"></div>
                </div>
            </div>
        </div>
    `;
    zone.style.display = 'block';
}

// ========================================
// GÉRER UPLOAD MUGSHOT
// ========================================

function handleMugshotUpload(event, position) {
    const file = event.target.files[0];
    if (!file) return;
    
    mugshotFiles[position] = file;
    
    // Preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(`preview-${position}`).innerHTML = `<img src="${e.target.result}" alt="${position}" style="max-width: 100%; max-height: 150px; margin-top: 10px;">`;
    };
    reader.readAsDataURL(file);
}

// ========================================
// SOUMETTRE LE RAPPORT
// ========================================

async function submitRapportArrestation(agentData) {
    try {
        await LoadingManager.wrap(
            (async () => {
                // 1. Gérer le citoyen
                let citoyenId;
                
                if (currentCitoyen) {
                    const memeApparence = document.querySelector('input[name="meme_apparence"]:checked')?.value === 'oui';
                    
                    if (!memeApparence) {
                        const mugshots = await uploadMugshots();
                        await updateCitoyen(currentCitoyen.id, mugshots);
                    } else {
                        await updateCitoyen(currentCitoyen.id, null);
                    }
                    
                    citoyenId = currentCitoyen.id;
                } else {
                    const mugshots = await uploadMugshots();
                    citoyenId = await createCitoyen(mugshots);
                }
                
                // 2. Créer le rapport
                const rapportData = {
                    agent_id: agentData.id,
                    agent_nom: agentData.nom,
                    agent_prenom: agentData.prenom,
                    agent_badge: agentData.badge,
                    citoyen_id: citoyenId,
                    heure_lecture_droits: document.getElementById('heure_droits').value,
                    contexte_interpellation: document.getElementById('contexte').value,
                    faits_retenus: document.getElementById('faits_retenus').value,
                    autres_informations: document.getElementById('autres_infos').value
                };
                
                const agentFullData = await APIManager.get(`/agent/${agentData.id}`);
                rapportData.agent_poste = agentFullData.poste_affectation;
                rapportData.agent_grade = agentFullData.grade;
                
                const data = await APIManager.post('/rapport/arrestation/create', rapportData);
                
                if (data.success) {
                    closeRapportFormModal();
                    alert('✅ Rapport d\'arrestation créé avec succès !');
                    if (typeof initRapports === 'function') initRapports();
                } else {
                    throw new Error(data.error);
                }
            })(),
            'Création du rapport en cours...'
        );
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('⚠️ Erreur: ' + error.message);
    }
}
// ========================================
// UPLOAD MUGSHOTS VERS IMGBB
// ========================================

async function uploadMugshots() {
    if (!mugshotFiles.face || !mugshotFiles.gauche || !mugshotFiles.droit) {
        throw new Error('Les 3 mugshots sont obligatoires');
    }
    
    const uploads = await Promise.all([
        uploadToImgBB(mugshotFiles.face),
        uploadToImgBB(mugshotFiles.gauche),
        uploadToImgBB(mugshotFiles.droit)
    ]);
    
    return {
        face: uploads[0],
        gauche: uploads[1],
        droit: uploads[2]
    };
}

async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://sahp.charliemoimeme.workers.dev/upload-mugshot', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (!data.success) throw new Error('Erreur upload mugshot');
    
    return data.url;
}

// ========================================
// CRÉER UN CITOYEN
// ========================================

async function createCitoyen(mugshots) {
    const citoyenData = {
        nom: document.getElementById('citoyen_nom').value,
        prenom: document.getElementById('citoyen_prenom').value,
        date_naissance: document.getElementById('citoyen_ddn').value,
        lieu_residence: document.getElementById('lieu_residence').value,
        caracteristiques_physiques: document.getElementById('caracteristiques').value,
        mugshot_face: mugshots.face,
        mugshot_gauche: mugshots.gauche,
        mugshot_droit: mugshots.droit
    };
    
    const response = await fetch('https://sahp.charliemoimeme.workers.dev/citoyen/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citoyenData)
    });
    
    const data = await response.json();
    if (!data.success) throw new Error('Erreur création citoyen');
    
    return data.citoyen_id;
}

// ========================================
// METTRE À JOUR UN CITOYEN EXISTANT (infos + mugshots optionnels)
// ========================================

async function updateCitoyen(citoyenId, mugshots = null) {
    const updateData = {
        citoyen_id: citoyenId,
        lieu_residence: document.getElementById('lieu_residence').value,
        caracteristiques_physiques: document.getElementById('caracteristiques').value
    };
    
    // Si nouveaux mugshots, les ajouter
    if (mugshots) {
        updateData.mugshot_face = mugshots.face;
        updateData.mugshot_gauche = mugshots.gauche;
        updateData.mugshot_droit = mugshots.droit;
    }
    
    const response = await fetch('https://sahp.charliemoimeme.workers.dev/citoyen/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    if (!data.success) throw new Error('Erreur mise à jour citoyen');
}

function closeRapportFormModal() {
    const modal = document.querySelector('.rapport-form-modal');
    if (modal) {
        modal.remove();
    }
    currentCitoyen = null;
    mugshotFiles = { face: null, gauche: null, droit: null };
}

// ========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    // Initialiser le thème au chargement de la page
    initTheme();
    
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





// ========================================
// COMPONENTS.JS - Composants réutilisables
// ========================================

// Sidebar publique (index, bureaux, plaintes, recrutements, medias)
function getPublicSidebar() {
    return `
    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="index.html">
                <div class="sidebar-logo">
                    <img src="imgs/LOGO.png" alt="SAHP Badge">
                </div>
                <div class="sidebar-title">
                    <h1>SAHP</h1>
                </div>
            </a>
        </div>
        
        <nav class="nav">
            <ul>
                <li><a href="index.html" id="nav-index">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Accueil</span>
                </a></li>
                <li><a href="bureaux.html" id="nav-bureaux">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Bureaux Régionaux</span>
                </a></li>
                <li><a href="plaintes.html" id="nav-plaintes">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Plaintes</span>
                </a></li>
                <li><a href="recrutements.html" id="nav-recrutements">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Nous Rejoindre</span>
                </a></li>
                <li><a href="medias.html" id="nav-medias">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Galerie Média</span>
                </a></li>
            </ul>
        </nav>
    </aside>
    `;
}

// Sidebar intranet (dashboard, personnel, rapports)
function getIntraSidebar() {
    return `
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <img src="imgs/LOGO.png" alt="SAHP Badge">
            </div>
            <div class="agent-details">
                <p class="agent-name" id="agentName">Chargement...</p>
                <p class="agent-badge" id="agentBadge">Badge: ---</p>
                <p class="agent-grade" id="agentGrade">Grade: ---</p>
            </div>
        </div>
        
        <nav class="nav">
            <ul>
                <li><a href="dashboard.html" id="nav-dashboard">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Tableau de bord</span>
                </a></li>
                
                <li class="has-submenu">
                    <a href="#" class="submenu-toggle">
                        <span class="nav-dot">●</span>
                        <span class="nav-text">Divisions</span>
                        <span class="arrow">▶</span>
                    </a>
                    <ul class="submenu">
                        <li class="has-submenu">
                            <a href="#" class="submenu-toggle">
                                <span class="nav-text">CVS</span>
                                <span class="arrow">▶</span>
                            </a>
                            <ul class="submenu submenu-level-2">
                                <li><a href="#"><span class="nav-text">Informations</span></a></li>
                                <li><a href="#"><span class="nav-text">Recrutements</span></a></li>
                            </ul>
                        </li>
                        <li class="has-submenu">
                            <a href="#" class="submenu-toggle">
                                <span class="nav-text">PSD</span>
                                <span class="arrow">▶</span>
                            </a>
                            <ul class="submenu submenu-level-2">
                                <li><a href="#"><span class="nav-text">Informations</span></a></li>
                                <li><a href="#"><span class="nav-text">Recrutements</span></a></li>
                            </ul>
                        </li>
                        <li class="has-submenu">
                            <a href="#" class="submenu-toggle">
                                <span class="nav-text">SOU</span>
                                <span class="arrow">▶</span>
                            </a>
                            <ul class="submenu submenu-level-2">
                                <li><a href="#"><span class="nav-text">Informations</span></a></li>
                                <li><a href="#"><span class="nav-text">Recrutements</span></a></li>
                            </ul>
                        </li>
                        <li class="has-submenu">
                            <a href="#" class="submenu-toggle">
                                <span class="nav-text">OAO</span>
                                <span class="arrow">▶</span>
                            </a>
                            <ul class="submenu submenu-level-2">
                                <li><a href="#"><span class="nav-text">Informations</span></a></li>
                                <li><a href="#"><span class="nav-text">Recrutements</span></a></li>
                            </ul>
                        </li>
                        <li class="has-submenu">
                            <a href="#" class="submenu-toggle">
                                <span class="nav-text">OCI</span>
                                <span class="arrow">▶</span>
                            </a>
                            <ul class="submenu submenu-level-2">
                                <li><a href="#"><span class="nav-text">Informations</span></a></li>
                                <li><a href="#"><span class="nav-text">Recrutements</span></a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
                
                <li><a href="personnel.html" id="nav-personnel">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Personnel</span>
                </a></li>
                <li><a href="rapports.html" id="nav-rapports">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Rapports</span>
                </a></li>
                <li><a href="#" id="nav-logs">
                    <span class="nav-dot">●</span>
                    <span class="nav-text">Logs</span>
                </a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
            <div class="footer-buttons">
                <button class="theme-toggle-btn" onclick="toggleTheme()" id="themeToggle" title="Changer de thème">
                    <span class="theme-icon">🌙</span>
                </button>
                <button class="logout-btn" onclick="logout()" title="Déconnexion">
                    <span class="logout-icon">🚪</span>
                </button>
            </div>
        </div>
    </aside>
    `;
}

// Hero header publique
function getPublicHeroHeader(bgClass) {
    return `
    <header class="hero-header ${bgClass}">
        <a href="login.html" class="profile-icon">
            <img src="imgs/profile.png" alt="Profil">
        </a>
    </header>
    `;
}

// Hero header intranet
function getIntraHeroHeader(bgClass) {
    return `
    <header class="hero-header ${bgClass}">
        <a href="#" class="mail-icon">
            <img src="imgs/mail.png" alt="Mail">
        </a>
    </header>
    `;
}

// Footer (identique partout)
function getFooter() {
    return `
    <footer class="footer">
        <p>&copy; MST - San Andreas Highway Patrol. Tous droits réservés.</p>
    </footer>
    `;
}

// Fonction d'initialisation pour marquer le lien actif
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageId = currentPage.replace('.html', '');
    const activeLink = document.getElementById(`nav-${pageId}`);
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Charger la sidebar publique
function loadPublicSidebar() {
    document.body.insertAdjacentHTML('afterbegin', getPublicSidebar());
    setActiveNavLink();
}

// Charger la sidebar intranet
function loadIntraSidebar() {
    document.body.insertAdjacentHTML('afterbegin', getIntraSidebar());
    setActiveNavLink();
}

// Charger le hero header publique
function loadPublicHero(bgClass) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', getPublicHeroHeader(bgClass));
    }
}

// Charger le hero header intranet
function loadIntraHero(bgClass) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', getIntraHeroHeader(bgClass));
    }
}

// Charger le footer
function loadFooter() {
    document.body.insertAdjacentHTML('beforeend', getFooter());
}

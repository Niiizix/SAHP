// ========================================
// UTILS.JS - Fonctions utilitaires
// ========================================

// ========================================
// GESTION DES DATES
// ========================================

class DateFormatter {
    static TIMEZONE = 'Europe/Brussels';
    
    /**
     * Parse une date depuis différents formats
     * @param {string} dateString - Date au format DD/MM/YYYY, YYYY-MM-DD ou ISO
     * @returns {Date|null}
     */
    static parse(dateString) {
        if (!dateString) return null;
        
        // Format DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        }
        
        // Format YYYY-MM-DD ou ISO
        return new Date(dateString);
    }
    
    /**
     * Formate une date pour l'affichage (DD/MM/YYYY)
     * @param {string} dateString
     * @returns {string}
     */
    static toDisplay(dateString) {
        if (!dateString) return 'Non renseignée';
        
        // Si déjà au format DD/MM/YYYY
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        
        const date = this.parse(dateString);
        if (!date || isNaN(date.getTime())) return 'Format invalide';
        
        return new Intl.DateTimeFormat('fr-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: this.TIMEZONE
        }).format(date);
    }
    
    /**
     * Formate une date avec l'heure (DD/MM/YYYY à HH:MM)
     * @param {string} dateString
     * @returns {string}
     */
    static toDateTime(dateString) {
        if (!dateString) return 'Date inconnue';
        
        const date = this.parse(dateString);
        if (!date || isNaN(date.getTime())) return 'Date invalide';
        
        const formatted = new Intl.DateTimeFormat('fr-BE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: this.TIMEZONE,
            hour12: false
        }).format(date);
        
        return formatted.replace(',', ' à');
    }
    
    /**
     * Convertit vers le format input date (YYYY-MM-DD)
     * @param {string} dateString
     * @returns {string}
     */
    static toInput(dateString) {
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
        
        const date = this.parse(dateString);
        if (!date || isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
}

// ========================================
// GESTION DES MODALS
// ========================================

class ModalManager {
    /**
     * Ferme une modal
     * @param {string} selector - Sélecteur CSS de la modal
     */
    static close(selector) {
        const modal = document.querySelector(selector);
        if (modal) {
            modal.remove();
        }
    }
    
    /**
     * Crée une modal de formulaire simple
     * @param {Object} config - Configuration de la modal
     * @param {string} config.title - Titre de la modal
     * @param {Array} config.fields - Champs du formulaire
     * @param {Function} config.onSubmit - Callback de soumission
     */
    static createFormModal(config) {
        const modal = document.createElement('div');
        modal.className = 'form-modal active';
        
        const fieldsHTML = config.fields.map(field => {
            if (field.type === 'select') {
                return `
                    <div class="form-group">
                        <label>${field.label}${field.required ? ' *' : ''}</label>
                        <select id="${field.id}" ${field.required ? 'required' : ''}>
                            <option value="">-- Choisir --</option>
                            ${field.options ? field.options.map(opt => 
                                `<option value="${opt.value}" ${opt.data ? `data-description="${opt.data}"` : ''}>${opt.label}</option>`
                            ).join('') : ''}
                        </select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                return `
                    <div class="form-group">
                        <label>${field.label}${field.required ? ' *' : ''}</label>
                        <textarea id="${field.id}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}"></textarea>
                    </div>
                `;
            } else {
                return `
                    <div class="form-group">
                        <label>${field.label}${field.required ? ' *' : ''}</label>
                        <input type="${field.type || 'text'}" id="${field.id}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}">
                    </div>
                `;
            }
        }).join('');
        
        modal.innerHTML = `
            <div class="form-modal-content">
                <h3>${config.title}</h3>
                <form id="${config.formId || 'genericForm'}">
                    ${fieldsHTML}
                    <div class="form-buttons">
                        <button type="button" class="form-btn cancel" onclick="ModalManager.close('.form-modal')">Annuler</button>
                        <button type="submit" class="form-btn submit">${config.submitText || 'Valider'}</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = document.getElementById(config.formId || 'genericForm');
        form.addEventListener('submit', config.onSubmit);
        
        return modal;
    }
}

// ========================================
// GESTION DES REQUÊTES API
// ========================================

class APIManager {
    static BASE_URL = 'https://sahp.charliemoimeme.workers.dev';
    
    /**
     * Supprime un item (médaille, recommandation, sanction)
     * @param {string} type - Type d'item (medaille, recommandation, sanction)
     * @param {number} id - ID de l'item
     * @param {number} agentId - ID de l'agent
     * @param {Function} reloadFunction - Fonction à appeler après suppression
     */
    static async deleteItem(type, id, agentId, reloadFunction) {
        const labels = {
            medaille: 'cette médaille',
            recommandation: 'cette recommandation',
            sanction: 'cette sanction'
        };
        
        if (!confirm(`Supprimer ${labels[type]} ?`)) return;
        
        try {
            const response = await fetch(`${this.BASE_URL}/agent/${type}/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                reloadFunction(agentId);
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    }
    
    /**
     * Effectue une requête GET avec cache
     * @param {string} endpoint - Endpoint de l'API
     * @param {boolean} useCache - Utiliser le cache ou non (défaut: true)
     * @param {number} ttl - Durée de vie du cache en ms (optionnel)
     * @returns {Promise<any>}
     */
    static async get(endpoint, useCache = true, ttl = undefined) {
        // Vérifier le cache d'abord
        if (useCache) {
            const cached = CacheManager.get(endpoint);
            if (cached) {
                return cached;
            }
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            
            // Mettre en cache si demandé
            if (useCache) {
                CacheManager.set(endpoint, data, ttl);
            }
            
            return data;
        } catch (error) {
            console.error('Erreur GET:', error);
            throw error;
        }
    }
    
    /**
     * Effectue une requête POST
     * @param {string} endpoint - Endpoint de l'API
     * @param {Object} data - Données à envoyer
     * @returns {Promise<any>}
     */
    static async post(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur POST:', error);
            throw error;
        }
    }
}

// ========================================
// GESTION DES ÉTATS DE CHARGEMENT
// ========================================

class LoadingManager {
    /**
     * Affiche un loader global
     * @param {string} message - Message à afficher
     */
    static show(message = 'Chargement...') {
        // Supprimer l'ancien loader s'il existe
        this.hide();
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            flex-direction: column;
            gap: 1rem;
        `;
        
        loader.innerHTML = `
            <div style="
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="color: white; font-size: 1.1rem;">${message}</p>
        `;
        
        // Ajouter l'animation CSS
        if (!document.getElementById('loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loader);
    }
    
    /**
     * Cache le loader global
     */
    static hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    /**
     * Entoure une promesse avec un loader
     * @param {Promise} promise - Promesse à exécuter
     * @param {string} message - Message du loader
     * @returns {Promise<any>}
     */
    static async wrap(promise, message = 'Chargement...') {
        this.show(message);
        try {
            return await promise;
        } finally {
            this.hide();
        }
    }
}

// ========================================
// GESTION DU CACHE
// ========================================

class CacheManager {
    static cache = new Map();
    static TTL = 5 * 60 * 1000; // 5 minutes par défaut
    
    /**
     * Récupère une donnée du cache
     * @param {string} key - Clé du cache
     * @returns {any|null}
     */
    static get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Vérifier si expiré
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        console.log('📦 Cache HIT:', key);
        return item.data;
    }
    
    /**
     * Stocke une donnée dans le cache
     * @param {string} key - Clé du cache
     * @param {any} data - Données à stocker
     * @param {number} ttl - Durée de vie en ms (optionnel)
     */
    static set(key, data, ttl = this.TTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
        console.log('💾 Cache SET:', key, `(expire dans ${ttl/1000}s)`);
    }
    
    /**
     * Supprime une entrée du cache
     * @param {string} key - Clé à supprimer
     */
    static delete(key) {
        this.cache.delete(key);
        console.log('🗑️ Cache DELETE:', key);
    }
    
    /**
     * Vide tout le cache
     */
    static clear() {
        this.cache.clear();
        console.log('🧹 Cache CLEAR: Tout effacé');
    }
    
    /**
     * Supprime toutes les entrées commençant par un préfixe
     * @param {string} prefix - Préfixe des clés à supprimer
     */
    static deleteByPrefix(prefix) {
        const keys = Array.from(this.cache.keys());
        let count = 0;
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        });
        console.log(`🗑️ Cache DELETE BY PREFIX: "${prefix}" (${count} entrées supprimées)`);
    }
    
    /**
     * Affiche le contenu du cache (debug)
     */
    static debug() {
        console.log('🔍 Cache DEBUG:', {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        });
    }
}

// ========================================
// VALIDATION DES DONNÉES
// ========================================

class Validator {
    /**
     * Vérifie qu'un champ est rempli
     * @param {any} value - Valeur à vérifier
     * @param {string} fieldName - Nom du champ
     * @throws {Error}
     */
    static required(value, fieldName) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            throw new Error(`${fieldName} est requis`);
        }
    }
    
    /**
     * Vérifie la longueur minimale
     * @param {string} value - Valeur à vérifier
     * @param {number} length - Longueur minimale
     * @param {string} fieldName - Nom du champ
     * @throws {Error}
     */
    static minLength(value, length, fieldName) {
        if (value.length < length) {
            throw new Error(`${fieldName} doit contenir au moins ${length} caractères`);
        }
    }
    
    /**
     * Valide un objet selon des règles
     * @param {Object} data - Données à valider
     * @param {Object} rules - Règles de validation
     * @throws {Error}
     */
    static validate(data, rules) {
        const errors = [];
        
        Object.entries(rules).forEach(([field, rule]) => {
            try {
                if (rule.required) {
                    this.required(data[field], rule.label || field);
                }
                if (rule.minLength && data[field]) {
                    this.minLength(data[field], rule.minLength, rule.label || field);
                }
            } catch (error) {
                errors.push(error.message);
            }
        });
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    }
}

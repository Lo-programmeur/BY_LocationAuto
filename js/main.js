// BY_LocationAuto - JavaScript principal (version statique)
// Développé par Basile lo Programmeur

// Configuration globale
const CONFIG = {
    ANIMATION_DURATION: 300,
    ITEMS_PER_PAGE: 6
};

// État global de l'application
const AppState = {
    currentUser: null,
    selectedVehicles: [],
    currentBooking: null,
    isLoading: false
};

// Utilitaires
const Utils = {
    // Formatage des prix
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(price).replace('XAF', 'FCFA');
    },

    // Génération d'IDs uniques
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
};

// ======================
//  VEHICLES (STATIQUES)
// ======================
const VehicleManager = {
    vehicles: [
        {
            id: "v1",
            brand: "Toyota",
            model: "Corolla",
            year: 2022,
            pricePerDay: 25000,
            seats: 5,
            doors: 4,
            transmission: "Automatique",
            fuel: "Essence",
            mileage: 15000,
            category: "berline",
            location: "centre-ville",
            isAvailable: true,
            imageUrl: "images/vehicles/toyota-corolla.png",
            features: ["Climatisation", "Bluetooth", "Caméra de recul", "GPS intégré"]
        },
        {
            id: "v2",
            brand: "Hyundai",
            model: "Tucson",
            year: 2021,
            pricePerDay: 35000,
            seats: 5,
            doors: 5,
            transmission: "Automatique",
            fuel: "Diesel",
            mileage: 22000,
            category: "suv",
            location: "aeroport",
            isAvailable: true,
            imageUrl: "images/vehicles/Hyundai Tucson 2021.png",
            features: ["Toit ouvrant", "Climatisation", "Caméra 360°", "Écran tactile"]
        },
        {
            id: "v3",
            brand: "Mercedes-Benz",
            model: "C-Class",
            year: 2023,
            pricePerDay: 70000,
            seats: 5,
            doors: 4,
            transmission: "Automatique",
            fuel: "Essence",
            mileage: 9000,
            category: "luxe",
            location: "centre-ville",
            isAvailable: false,
            imageUrl: "images/vehicles/Mercedes-Benz C-Class 2023.png",
            features: ["Cuir", "Caméra 360°", "GPS", "Bluetooth"]
        },
        {
            id: "v4",
            brand: "Suzuki",
            model: "Swift",
            year: 2020,
            pricePerDay: 20000,
            seats: 4,
            doors: 4,
            transmission: "Manuelle",
            fuel: "Essence",
            mileage: 32000,
            category: "economique",
            location: "port-gentil",
            isAvailable: true,
            imageUrl: "images/vehicles/Suzuki Swift 2020.png",
            features: ["Climatisation", "USB", "Économique"]
        }
    ],

    filteredVehicles: [],
    currentFilter: "all",

    async loadVehicles() {
        this.filteredVehicles = [...this.vehicles];
        this.renderVehicles();
        Utils.showNotification("Véhicules chargés avec succès");
    },

    filterVehicles(category) {
        this.currentFilter = category;
        this.filteredVehicles =
            category === "all"
                ? [...this.vehicles]
                : this.vehicles.filter(v => v.category === category);
        this.renderVehicles();
    },

    renderVehicles() {
        const container = document.getElementById("vehicleGallery");
        if (!container) return;

        if (this.filteredVehicles.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-car text-muted fs-1 mb-3"></i>
                    <h5 class="text-muted">Aucun véhicule disponible dans cette catégorie</h5>
                </div>`;
            return;
        }

        container.innerHTML = this.filteredVehicles
            .map(vehicle => this.createVehicleCard(vehicle))
            .join("");
    },

    createVehicleCard(vehicle) {
        const featuresHtml =
            vehicle.features?.slice(0, 4)
                .map(f => `<div class="feature-item"><i class="fas fa-check"></i>${f}</div>`)
                .join("") || "";

        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card vehicle-card h-100">
                    <div class="vehicle-image">
                        <img src="${vehicle.imageUrl}" alt="${vehicle.brand} ${vehicle.model}" class="card-img-top">
                        <div class="vehicle-badge">${this.getCategoryLabel(vehicle.category)}</div>
                    </div>
                    <div class="vehicle-info">
                        <h5 class="vehicle-title">${vehicle.brand} ${vehicle.model} ${vehicle.year}</h5>
                        <div class="vehicle-price mb-3">${Utils.formatPrice(vehicle.pricePerDay)}/jour</div>
                        
                        <div class="vehicle-features mb-3">
                            <div class="feature-item"><i class="fas fa-users"></i>${vehicle.seats} places</div>
                            <div class="feature-item"><i class="fas fa-cog"></i>${vehicle.transmission}</div>
                            <div class="feature-item"><i class="fas fa-gas-pump"></i>${vehicle.fuel}</div>
                            <div class="feature-item"><i class="fas fa-map-marker-alt"></i>${this.getLocationLabel(vehicle.location)}</div>
                            ${featuresHtml}
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-rent" onclick="VehicleManager.selectVehicle('${vehicle.id}')" ${vehicle.isAvailable ? "" : "disabled"}>
                                <i class="fas fa-calendar-check me-2"></i>${vehicle.isAvailable ? "Réserver maintenant" : "Non disponible"}
                            </button>
                            <button class="btn btn-outline-primary" onclick="VehicleManager.showVehicleDetails('${vehicle.id}')">
                                <i class="fas fa-info-circle me-2"></i>Plus de détails
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    getCategoryLabel(category) {
        const labels = {
            "economique": "Économique",
            "berline": "Berline",
            "suv": "SUV",
            "luxe": "Luxe"
        };
        return labels[category] || category;
    },

    getLocationLabel(location) {
        const labels = {
            "aeroport": "Aéroport Léon-Mba",
            "centre-ville": "Centre-ville",
            "port-gentil": "Port-Gentil",
            "franceville": "Franceville"
        };
        return labels[location] || location;
    },

    selectVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle || !vehicle.isAvailable) {
            Utils.showNotification("Ce véhicule n'est pas disponible", "warning");
            return;
        }

        if (!AppState.currentUser) {
            Utils.showNotification("Veuillez vous connecter pour réserver", "info");
            const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
            loginModal.show();
            return;
        }

        BookingManager.startBooking(vehicle);
    },

    showVehicleDetails(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        const modalHtml = `
            <div class="modal fade" id="vehicleDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-car me-2"></i>${vehicle.brand} ${vehicle.model} ${vehicle.year}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${vehicle.imageUrl}" alt="${vehicle.brand} ${vehicle.model}" class="img-fluid rounded mb-3">
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">Informations générales</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Prix:</strong> ${Utils.formatPrice(vehicle.pricePerDay)}/jour</li>
                                        <li><strong>Places:</strong> ${vehicle.seats}</li>
                                        <li><strong>Portes:</strong> ${vehicle.doors}</li>
                                        <li><strong>Transmission:</strong> ${vehicle.transmission}</li>
                                        <li><strong>Carburant:</strong> ${vehicle.fuel}</li>
                                        <li><strong>Kilométrage:</strong> ${vehicle.mileage.toLocaleString()} km</li>
                                        <li><strong>Lieu:</strong> ${this.getLocationLabel(vehicle.location)}</li>
                                    </ul>
                                </div>
                            </div>
                            <h6 class="text-primary mb-3 mt-4">Équipements inclus</h6>
                            <div class="row">
                                ${vehicle.features.map(f => `<div class="col-md-6 mb-2"><i class="fas fa-check text-success me-2"></i>${f}</div>`).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                            <button class="btn btn-primary" onclick="VehicleManager.selectVehicle('${vehicle.id}')" data-bs-dismiss="modal">
                                <i class="fas fa-calendar-check me-2"></i>Réserver
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        const existingModal = document.getElementById("vehicleDetailsModal");
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modal = new bootstrap.Modal(document.getElementById("vehicleDetailsModal"));
        modal.show();
    }
};

// ======================
//  INITIALISATION
// ======================
document.addEventListener("DOMContentLoaded", () => {
    VehicleManager.loadVehicles();

    // Filtres
    document.querySelectorAll("#vehicleFilters input[name='vehicleFilter']").forEach(radio => {
        radio.addEventListener("change", e => VehicleManager.filterVehicles(e.target.value));
    });
});

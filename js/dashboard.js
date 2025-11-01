// Dashboard JavaScript - BY_LocationAuto
// Développé par Basile lo Programmeur

const DashboardState = {
    currentUser: null,
    bookings: [],
    charts: {}
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard - Initialisation...');
    
    // Vérifier l'authentification
    checkAuth();
    
    // Charger les données
    loadDashboardData();
    
    // Initialiser les graphiques
    setTimeout(() => {
        initCharts();
    }, 500);
    
    // Gestionnaire du formulaire de profil
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
    
    console.log('✅ Dashboard initialisé');
});

// Vérification de l'authentification
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (!savedUser) {
        alert('Veuillez vous connecter pour accéder au tableau de bord');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        DashboardState.currentUser = JSON.parse(savedUser);
        updateUserInfo();
    } catch (error) {
        console.error('Erreur de lecture utilisateur:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Mise à jour des informations utilisateur
function updateUserInfo() {
    const user = DashboardState.currentUser;
    
    // Navbar
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    // Profile section
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileEmail').textContent = user.email;
    
    // Formulaire de profil
    document.getElementById('editFirstName').value = user.firstName || '';
    document.getElementById('editLastName').value = user.lastName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editBirthDate').value = user.birthDate || '';
    document.getElementById('editAddress').value = user.address || '';
    
    // Membre depuis
    const memberSince = document.getElementById('memberSince');
    if (user.registrationDate) {
        const regDate = new Date(user.registrationDate);
        memberSince.textContent = regDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
}

// Chargement des données du dashboard
async function loadDashboardData() {
    try {
        // Charger les réservations de l'utilisateur
        const response = await fetch(`tables/bookings?limit=100`);
        const data = await response.json();
        
        DashboardState.bookings = data.data.filter(b => b.userId === DashboardState.currentUser.id);
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Afficher les réservations récentes
        displayRecentBookings();
        
        // Afficher toutes les réservations
        displayAllBookings();
        
    } catch (error) {
        console.error('Erreur de chargement des données:', error);
    }
}

// Mise à jour des statistiques
function updateStats() {
    const bookings = DashboardState.bookings;
    
    // Total des réservations
    document.getElementById('totalBookings').textContent = bookings.length;
    
    // Réservations actives (confirmées + en cours)
    const activeBookings = bookings.filter(b => 
        b.status === 'confirmee' || b.status === 'en_cours'
    ).length;
    document.getElementById('activeBookings').textContent = activeBookings;
    
    // Réservations en attente
    const pendingBookings = bookings.filter(b => b.status === 'en_attente').length;
    document.getElementById('pendingBookings').textContent = pendingBookings;
    
    // Total dépensé
    const totalSpent = bookings
        .filter(b => b.status !== 'annulee')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
    
    // Badge du nombre de réservations
    document.getElementById('bookingsCount').textContent = bookings.length;
}

// Affichage des réservations récentes
function displayRecentBookings() {
    const container = document.getElementById('recentBookingsList');
    const recentBookings = DashboardState.bookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 5);
    
    if (recentBookings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-inbox fs-1 mb-3"></i>
                <p>Aucune réservation pour le moment</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html#vehicles'">
                    Réserver un véhicule
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentBookings.map(booking => createBookingCard(booking)).join('');
}

// Affichage de toutes les réservations
function displayAllBookings() {
    const container = document.getElementById('bookingsList');
    const bookings = DashboardState.bookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-calendar-times fs-1 mb-3"></i>
                <p>Aucune réservation trouvée</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html#vehicles'">
                    Réserver maintenant
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bookings.map(booking => createBookingCard(booking, true)).join('');
}

// Création d'une carte de réservation
function createBookingCard(booking, withActions = false) {
    const statusLabels = {
        'en_attente': 'En attente',
        'confirmee': 'Confirmée',
        'en_cours': 'En cours',
        'terminee': 'Terminée',
        'annulee': 'Annulée'
    };
    
    const statusIcons = {
        'en_attente': 'hourglass-half',
        'confirmee': 'check-circle',
        'en_cours': 'car',
        'terminee': 'flag-checkered',
        'annulee': 'times-circle'
    };
    
    const startDate = new Date(booking.startDate).toLocaleDateString('fr-FR');
    const endDate = new Date(booking.endDate).toLocaleDateString('fr-FR');
    
    const actionButtons = withActions ? `
        <div class="booking-actions">
            ${booking.status === 'en_attente' ? `
                <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking('${booking.id}')">
                    <i class="fas fa-times me-1"></i>Annuler
                </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.id}')">
                <i class="fas fa-eye me-1"></i>Détails
            </button>
        </div>
    ` : '';
    
    return `
        <div class="booking-item">
            <img src="${getVehicleImage(booking.vehicleId)}" alt="Véhicule" class="booking-image">
            <div class="booking-details">
                <h5>${booking.customerName || 'Réservation'}</h5>
                <div class="booking-info">
                    <span><i class="fas fa-calendar"></i>${startDate} - ${endDate}</span>
                    <span><i class="fas fa-map-marker-alt"></i>${getLocationLabel(booking.pickupLocation)}</span>
                    ${booking.withDriver ? '<span><i class="fas fa-user-tie"></i>Avec chauffeur</span>' : ''}
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                        <span class="booking-status status-${booking.status}">
                            <i class="fas fa-${statusIcons[booking.status]}"></i>
                            ${statusLabels[booking.status]}
                        </span>
                    </div>
                    <div class="booking-price">${formatPrice(booking.totalPrice)}</div>
                </div>
                ${actionButtons}
            </div>
        </div>
    `;
}

// Obtenir l'image du véhicule
function getVehicleImage(vehicleId) {
    const vehicleImages = {
        'v1': 'images/vehicles/toyota-corolla.png',
        'v2': 'images/vehicles/nissan-altima.png',
        'v3': 'images/vehicles/toyota-landcruiser.png',
        'v4': 'images/vehicles/mercedes-sclass.png',
        'v5': 'images/vehicles/hyundai-elantra.png',
        'v6': 'images/vehicles/bmw-x5.jpg'
    };
    return vehicleImages[vehicleId] || 'images/logo.png';
}

// Labels des lieux
function getLocationLabel(location) {
    const labels = {
        'aeroport': 'Aéroport Léon-Mba',
        'centre-ville': 'Centre-ville',
        'port-gentil': 'Port-Gentil',
        'franceville': 'Franceville'
    };
    return labels[location] || location;
}

// Formatage des prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA');
}

// Initialisation des graphiques
function initCharts() {
    // Graphique des réservations
    const bookingsCtx = document.getElementById('bookingsChart');
    if (bookingsCtx) {
        const bookingsByMonth = getBookingsByMonth();
        DashboardState.charts.bookings = new Chart(bookingsCtx, {
            type: 'line',
            data: {
                labels: bookingsByMonth.labels,
                datasets: [{
                    label: 'Réservations',
                    data: bookingsByMonth.data,
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Graphique des véhicules
    const vehiclesCtx = document.getElementById('vehiclesChart');
    if (vehiclesCtx) {
        const vehicleStats = getVehicleStats();
        DashboardState.charts.vehicles = new Chart(vehiclesCtx, {
            type: 'doughnut',
            data: {
                labels: vehicleStats.labels,
                datasets: [{
                    data: vehicleStats.data,
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.8)',
                        'rgba(25, 135, 84, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Obtenir les réservations par mois
function getBookingsByMonth() {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const labels = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        labels.push(months[monthIndex]);
        
        const count = DashboardState.bookings.filter(b => {
            const bookingMonth = new Date(b.bookingDate).getMonth();
            return bookingMonth === monthIndex;
        }).length;
        
        data.push(count);
    }
    
    return { labels, data };
}

// Statistiques des véhicules
function getVehicleStats() {
    const categories = {
        'economique': 0,
        'berline': 0,
        'suv': 0,
        'luxe': 0
    };
    
    // Simulation - Dans une vraie app, on chargerait les véhicules depuis l'API
    const mockData = {
        'economique': 2,
        'berline': 1,
        'suv': 2,
        'luxe': 1
    };
    
    return {
        labels: ['Économique', 'Berline', 'SUV', 'Luxe'],
        data: [mockData.economique, mockData.berline, mockData.suv, mockData.luxe]
    };
}

// Navigation entre sections
function showSection(sectionId) {
    // Cacher toutes les sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les items du menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Activer l'item du menu correspondant
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('onclick')?.includes(sectionId)) {
            item.classList.add('active');
        }
    });
}

// Mise à jour du profil
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }
    
    const updatedUser = {
        ...DashboardState.currentUser,
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        birthDate: document.getElementById('editBirthDate').value,
        address: document.getElementById('editAddress').value
    };
    
    if (newPassword) {
        updatedUser.password = newPassword;
    }
    
    try {
        // Mettre à jour via l'API
        await fetch(`tables/users/${updatedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });
        
        // Mettre à jour le localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        DashboardState.currentUser = updatedUser;
        
        updateUserInfo();
        alert('Profil mis à jour avec succès!');
        
        // Réinitialiser les champs de mot de passe
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        alert('Erreur lors de la mise à jour du profil');
    }
}

// Annuler une réservation
async function cancelBooking(bookingId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        return;
    }
    
    try {
        await fetch(`tables/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'annulee' })
        });
        
        alert('Réservation annulée avec succès');
        loadDashboardData();
        
    } catch (error) {
        console.error('Erreur d\'annulation:', error);
        alert('Erreur lors de l\'annulation de la réservation');
    }
}

// Voir les détails d'une réservation
function viewBookingDetails(bookingId) {
    const booking = DashboardState.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    alert(`Détails de la réservation:\n\nClient: ${booking.customerName}\nDates: ${new Date(booking.startDate).toLocaleDateString('fr-FR')} - ${new Date(booking.endDate).toLocaleDateString('fr-FR')}\nLieu: ${getLocationLabel(booking.pickupLocation)}\nPrix: ${formatPrice(booking.totalPrice)}\nStatut: ${booking.status}`);
}

// Filtrer les réservations
function filterBookings() {
    const statusFilter = document.getElementById('bookingStatusFilter').value;
    const monthFilter = document.getElementById('bookingMonthFilter').value;
    
    let filteredBookings = [...DashboardState.bookings];
    
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
    }
    
    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredBookings = filteredBookings.filter(b => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate.getFullYear() === parseInt(year) && 
                   (bookingDate.getMonth() + 1) === parseInt(month);
        });
    }
    
    const container = document.getElementById('bookingsList');
    if (filteredBookings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-search fs-1 mb-3"></i>
                <p>Aucune réservation trouvée avec ces filtres</p>
            </div>
        `;
    } else {
        container.innerHTML = filteredBookings.map(b => createBookingCard(b, true)).join('');
    }
}

// Déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
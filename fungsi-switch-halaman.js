function showContainer(containerId) {
    const containers = ['home', 'saya', 'profil', 'burung', 'roll', 'belanja', 'payment', 'editProfil', 'inbox', 'leaderboard', 'faq', 'term', 'investor', 'return', 'privacy', 'bos', 'rulle', 'disclaimer'];
    
    containers.forEach(id => {
        const element = document.getElementById(id + '-container');
        if (element) {
            element.style.display = 'none';
        }
    });

    const selectedContainer = document.getElementById(containerId + '-container');
    if (selectedContainer) {
        selectedContainer.style.display = 'block';
    }
}

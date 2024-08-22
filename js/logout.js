document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o Firebase foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); // Usa a instância existente
    }

    var auth = firebase.auth();

    // Função de logout
    window.logout = function() {
        auth.signOut().then(function() {
            console.log('Usuário deslogado');
            window.location.href = 'index.html';
        }).catch(function(error) {
            console.error('Erro ao deslogar: ', error);
        });
    };

    // Exibir ou ocultar o botão de logout com base na autenticação do usuário
    auth.onAuthStateChanged(function(user) {
        var logoutButton = document.getElementById('logoutButton');
        if (user) {
            if (logoutButton) {
                logoutButton.style.display = 'block';
            }
        } else {
            if (logoutButton) {
                logoutButton.style.display = 'none';
            }
        }
    });
});

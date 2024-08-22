
document.addEventListener('DOMContentLoaded', function() {
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

var auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
        if (!idTokenResult.claims.admin) {
            // Se o usuário não for administrador, redirecionar ou exibir mensagem
            window.location.href = 'acesso-negado.html'; // Redireciona para uma página de acesso negado
            // Ou exibe uma mensagem de acesso negado
            // document.body.innerHTML = '<h1>Acesso negado. Somente administradores podem acessar esta página.</h1>';
        }
    }).catch((error) => {
        console.error('Erro ao verificar as claims do usuário:', error);
    });
} else {
    window.location.href = 'index.html'; // Redireciona para a página de login se o usuário não estiver autenticado
}
});
});


// Verificar se o usuário está autenticado
document.addEventListener('DOMContentLoaded', function() {
    var auth = firebase.auth();
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            // Se o usuário não estiver autenticado, redirecionar para a página de login
            window.location.href = 'index.html';
        } else {
            // Se o usuário estiver autenticado, exibir o status de login com o email
            document.getElementById('adminStatus').innerText = 'Usuário logado: ' + user.email;
        }
    });
});


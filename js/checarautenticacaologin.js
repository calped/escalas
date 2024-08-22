// Verificar se o usuário está autenticado
document.addEventListener('DOMContentLoaded', function() {
    var auth = firebase.auth();
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Se o usuário estiver autenticado, exibir o status de login com o email
            document.getElementById('adminStatus').innerText = 'Usuário logado: ' + user.email;
        } else {
            // Caso o usuário não esteja autenticado, exibir uma mensagem alternativa ou deixar vazio
            document.getElementById('adminStatus').innerText = 'Usuário não autenticado';
        }
    });
});



// Verifica se o Firebase já foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Usa a instância já inicializada
}

// Referência ao serviço de autenticação
var auth = firebase.auth();

// Função para lidar com o login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Usuário logado com sucesso
            var user = userCredential.user;

            // Verifica as claims do usuário
            user.getIdTokenResult().then(idTokenResult => {
                if (idTokenResult.claims.admin) {
                    // Se for admin, redireciona para a página administrativa
                    window.location.href = 'admin.html';
                } else {
                    // Caso contrário, redireciona para a página de boas-vindas
                    window.location.href = 'bemvindo.html';
                }
            }).catch(error => {
                console.error('Erro ao obter claims do usuário:', error);
                // Exibe uma mensagem de erro ou redireciona para uma página de erro
            });

        })
        .catch(function(error) {
            var errorMessage;

            // Tratamento específico para mensagens que não estão nos padrões do Firebase
            if (error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
                errorMessage = 'Credenciais inválidas. Verifique o email e a senha e tente novamente.';
            } else {
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Email inválido. Por favor, verifique o formato do email.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Esta conta foi desativada. Entre em contato com o suporte.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'Usuário não encontrado. Verifique o email ou registre-se.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Senha incorreta. Por favor, tente novamente.';
                        break;
                    default:
                        errorMessage = 'Erro ao logar. Por favor, tente novamente.';
                        break;
                }
            }

            document.getElementById('loginMessage').innerText = errorMessage;
            document.getElementById('loginMessage').style.color = 'red';
        });
});


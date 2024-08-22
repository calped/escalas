document.addEventListener('DOMContentLoaded', function() {
    // Certifique-se de que o Firebase foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var auth = firebase.auth();
    var db = firebase.firestore();

    // Verificar se o usuário logado é um administrador
    auth.onAuthStateChanged(function(user) {
        if (user) {
            user.getIdTokenResult().then((idTokenResult) => {
                if (idTokenResult.claims.admin) {
                    document.getElementById('adminStatus').innerText = 'Administrador logado';

                    // Mostrar a seção de adicionar usuário
                    document.getElementById('userSection').style.display = 'block';
                } else {
                    document.getElementById('adminStatus').innerText = 'Acesso negado. Somente administradores podem acessar esta página.';
                }
            }).catch((error) => {
                console.error('Erro ao verificar as claims do usuário:', error);
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    // Função para adicionar usuários
    document.getElementById('addUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        var userEmail = document.getElementById('userEmail').value;
        var userName = document.getElementById('userName').value;
        var userRole = document.getElementById('userRole').value;
        var defaultPassword = '123456';

        // Salvar o estado de autenticação atual
        var currentUser = auth.currentUser;

        // Adicionar usuário ao Firebase Authentication
        auth.createUserWithEmailAndPassword(userEmail, defaultPassword)
        .then(function(userCredential) {
            var user = userCredential.user;
            
            // Adicionar usuário ao Firestore
            return db.collection('users').doc(user.uid).set({
                email: userEmail,
                nome: userName,
                role: userRole,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(function() {
            document.getElementById('userMessage').innerText = 'Usuário adicionado com sucesso!';

            // Reautenticar o administrador
            return auth.updateCurrentUser(currentUser);
        })
        .then(function() {
            // Atualiza a página para permitir a adição de mais usuários
            setTimeout(function() {
                location.reload();
            }, 2000);
        })
        .catch(function(error) {
            document.getElementById('userMessage').innerText = 'Erro ao adicionar usuário: ' + error.message;
        });
    });
});

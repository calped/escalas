document.addEventListener('DOMContentLoaded', function() {
    // Certifique-se de que o Firebase foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var auth = firebase.auth();
    var db = firebase.firestore();
    var currentUserEmail;

    // Verificar se o usuário logado é o administrador
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUserEmail = user.email; // Guardar o e-mail do usuário logado
            // Verifica se o usuário tem a claim de administrador
            user.getIdTokenResult().then((idTokenResult) => {
                if (idTokenResult.claims.admin) {
                    document.getElementById('adminStatus').innerText = 'Administrador logado';
                    loadUsers();
                } else {
                    document.getElementById('adminStatus').innerText = 'Acesso negado. Somente administradores podem acessar esta página.';
                }
            }).catch((error) => {
                console.error('Erro ao verificar claims do usuário:', error);
                document.getElementById('adminStatus').innerText = 'Erro ao verificar privilégios do usuário.';
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    // Função para carregar e exibir os usuários em ordem alfabética
    function loadUsers() {
        db.collection('users').orderBy('nome').get().then(function(querySnapshot) {
            var userList = document.getElementById('userList');
            userList.innerHTML = ''; // Limpa a lista de usuários

            querySnapshot.forEach(function(doc) {
                var user = doc.data();
                var listItem = document.createElement('li');
                listItem.innerText = user.nome + ' (' + user.email + ')';
                
                var deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Excluir';
                deleteBtn.setAttribute('data-uid', doc.id);
                deleteBtn.setAttribute('data-email', user.email);
                deleteBtn.onclick = function() {
                    if (user.email === currentUserEmail) {
                        alert("Você não pode apagar sua própria conta!");
                    } else {
                        deleteUser(doc.id);
                    }
                };

                listItem.appendChild(deleteBtn);
                userList.appendChild(listItem);
            });
        }).catch(function(error) {
            console.error('Erro ao carregar usuários:', error);
            document.getElementById('userMessage').innerText = 'Erro ao carregar usuários: ' + error.message;
        });
    }

    // Função para apagar o usuário do Authentication e Firestore
    function deleteUser(uid) {
        // Tenta deletar do Firebase Authentication usando Firebase Functions, ignorando o erro se ocorrer
        var deleteUserFromAuth = firebase.functions().httpsCallable('deleteUser')({ uid: uid }).catch(function(error) {
            console.error('Erro ao apagar usuário do Authentication:', error);
            // Continua mesmo que ocorra um erro
        });

        // Deleta do Firestore
        var deleteUserFromFirestore = db.collection('users').doc(uid).delete();

        // Executa ambas as ações e recarrega a página após a tentativa de exclusão
        Promise.all([deleteUserFromAuth, deleteUserFromFirestore])
            .then(function() {
                alert('Usuário apagado com sucesso!');
                location.reload(); // Recarrega a página para atualizar a lista de usuários
            })
            .catch(function(error) {
                console.error('Erro ao apagar usuário:', error);
                document.getElementById('userMessage').innerText = 'Erro ao apagar usuário: ' + error.message;
                location.reload(); // Recarrega a página mesmo se houver erro
            });
    }
});

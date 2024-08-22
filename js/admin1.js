document.addEventListener('DOMContentLoaded', function() {
    // Certifique-se de que o Firebase foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var auth = firebase.auth();
    var db = firebase.firestore();

    // Verificar se o usuário logado é o administrador
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Verificar as claims personalizadas
            user.getIdTokenResult().then((idTokenResult) => {
                console.log('Claims do usuário:', idTokenResult.claims);
                if (idTokenResult.claims.admin) {
                    document.getElementById('adminStatus').innerText = 'Administrador logado';

                    // Mostrar seções administrativas
                    var userSection = document.getElementById('userSection');
                    var plantaoSection = document.getElementById('plantaoSection');

                    if (userSection) userSection.style.display = 'block';
                    if (plantaoSection) plantaoSection.style.display = 'block';

                    loadMedicos();  // Carregar médicos
                } else {
                    document.getElementById('adminStatus').innerText = 'Acesso negado. Somente o administrador pode acessar esta página.';
                }
            }).catch((error) => {
                console.error('Erro ao verificar claims: ', error);
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    // Função para carregar médicos
    function loadMedicos() {
        var medicoSelect = document.getElementById('medico');
        if (medicoSelect) {
            db.collection('users').where('role', '==', 'user').get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    var option = document.createElement('option');
                    option.value = doc.id;
                    option.text = doc.data().nome;
                    medicoSelect.add(option);
                });
            });
        }
    }

    // Função para adicionar plantões (agora 'plantoes')
    document.getElementById('addPlantaoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        var plantaoData = document.getElementById('plantaoData').value;
        var local = document.getElementById('local').value;
        var horario = document.getElementById('horario').value;
        var medicoId = document.getElementById('medico').value;
        var plantaoStatus = document.getElementById('plantaoStatus').value;

        // Verificação de conflitos de plantão
        db.collection('plantoes')
            .where('data', '==', plantaoData)
            .where('local', '==', local)
            .where('horario', '==', horario)
            .get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty || horario === "8h às 12h") {
                    db.collection('plantoes').add({
                        data: plantaoData,
                        local: local,
                        horario: horario,
                        medicoId: medicoId,
                        status: plantaoStatus
                    })
                    .then(function() {
                        document.getElementById('plantaoMessage').innerText = 'Plantão adicionado com sucesso!';
                    })
                    .catch(function(error) {
                        document.getElementById('plantaoMessage').innerText = 'Erro ao adicionar plantão: ' + error.message;
                    });
                } else {
                    document.getElementById('plantaoMessage').innerText = 'Conflito: Já existe um plantão neste local e horário.';
                }
            });
    });

    // Função para adicionar usuários
    document.getElementById('addUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        var userEmail = document.getElementById('userEmail').value;
        var userName = document.getElementById('userName').value;
        var userRole = document.getElementById('userRole').value;

        db.collection('users').add({
            email: userEmail,
            nome: userName,
            role: userRole,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
            document.getElementById('userMessage').innerText = 'Usuário adicionado com sucesso!';
        })
        .catch(function(error) {
            document.getElementById('userMessage').innerText = 'Erro ao adicionar usuário: ' + error.message;
        });
    });
});

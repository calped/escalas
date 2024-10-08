document.addEventListener('DOMContentLoaded', function() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    var auth = firebase.auth();
    var db = firebase.firestore();

    auth.onAuthStateChanged(function(user) {
        if (user) {
            user.getIdTokenResult().then((idTokenResult) => {
                if (idTokenResult.claims.admin) {
                    document.getElementById('adminStatus').innerText = 'Administrador logado';
                    loadPlantoes();  // Carregar plantões
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

    function loadPlantoes(filters = {}) {
        var plantaoTableBody = document.getElementById('plantaoTableBody');
        plantaoTableBody.innerHTML = '';  // Limpar a tabela

        var query = db.collection('plantoes');

        if (filters.data) {
            query = query.where('data', '==', filters.data);
        }
        if (filters.local) {
            query = query.where('local', '==', filters.local);
        }
        if (filters.horario) {
            query = query.where('horario', '==', filters.horario);
        }

        query.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                var plantao = doc.data();
                var row = document.createElement('tr');

                db.collection('users').doc(plantao.medicoId).get().then(function(medicoDoc) {
                    var medicoNome = medicoDoc.exists ? medicoDoc.data().nome : 'N/A';
                    var formattedDate = formatDate(plantao.data);

                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${plantao.local}</td>
                        <td>${plantao.horario}</td>
                        <td>${medicoNome}</td>
                        <td>${plantao.status}</td>
                        <td><button data-id="${doc.id}" class="apagar-btn">Apagar</button></td>
                    `;

                    plantaoTableBody.appendChild(row);

                    // Adicionar evento para o botão de apagar
                    row.querySelector('.apagar-btn').addEventListener('click', function() {
                        var plantaoId = this.getAttribute('data-id');
                        deletePlantao(plantaoId);
                    });
                }).catch(function(error) {
                    console.error('Erro ao carregar o nome do médico:', error);
                });
            });
        }).catch(function(error) {
            console.error('Erro ao carregar plantões:', error);
        });
    }

    function formatDate(dateStr) {
        var dateParts = dateStr.split('-'); // Supondo que a data esteja no formato aaaa-mm-dd
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }

    function deletePlantao(plantaoId) {
        db.collection('plantoes').doc(plantaoId).delete()
        .then(function() {
            document.getElementById('message').innerText = 'Plantão apagado com sucesso!';
            loadPlantoes();  // Recarregar plantões
        })
        .catch(function(error) {
            console.error('Erro ao apagar plantão:', error);
            document.getElementById('message').innerText = 'Erro ao apagar plantão: ' + error.message;
        });
    }

    document.getElementById('applyFilter').addEventListener('click', function() {
        var filters = {
            data: document.getElementById('filterData').value,
            local: document.getElementById('filterLocal').value,
            horario: document.getElementById('filterHorario').value
        };
        loadPlantoes(filters);
    });

    document.getElementById('clearFilter').addEventListener('click', function() {
        document.getElementById('filterData').value = '';
        document.getElementById('filterLocal').value = '';
        document.getElementById('filterHorario').value = '';
        loadPlantoes();  // Recarregar todos os plantões sem filtros
    });
});

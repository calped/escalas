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
        var totalHoras = 0;  // Para acumular as horas de plantão do mês

        if (filters.mes) {
            const [ano, mes] = filters.mes.split("-");
            const startOfMonth = new Date(ano, mes - 1, 1);
            const endOfMonth = new Date(ano, mes, 0);
            query = query.where('data', '>=', startOfMonth.toISOString().split('T')[0])
                         .where('data', '<=', endOfMonth.toISOString().split('T')[0]);
        }

        query.get().then(function(querySnapshot) {
            let promises = []; // Array para armazenar todas as promessas de obtenção de médicos

            querySnapshot.forEach(function(doc) {
                var plantao = doc.data();

                // Consultar o nome do médico e adicionar a promessa ao array
                var medicoPromise = db.collection('users').doc(plantao.medicoId).get().then(function(medicoDoc) {
                    if (medicoDoc.exists) {
                        var medicoNome = medicoDoc.data().nome;

                        // Filtra pelo nome do médico se o filtro de nome estiver presente
                        if (!filters.nome || filters.nome.toLowerCase() === medicoNome.toLowerCase()) {
                            var horas = calculateHoras(plantao.horario);
                            totalHoras += horas;

                            var formattedDate = formatDate(plantao.data);

                            var row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${formattedDate}</td>
                                <td>${plantao.local}</td>
                                <td>${plantao.horario}</td>
                                <td>${medicoNome}</td>
                                <td>${horas} horas</td>
                            `;
                            plantaoTableBody.appendChild(row);
                        }
                    } else {
                        console.error('Erro: médico não encontrado no Firestore.');
                    }
                });

                promises.push(medicoPromise); // Adiciona a promessa ao array
            });

            // Espera até que todas as promessas sejam resolvidas
            Promise.all(promises).then(() => {
                // Exibe o total de horas no final da tabela
                var totalRow = document.createElement('tr');
                totalRow.innerHTML = `
                    <td colspan="4"><strong>Total de Horas no Mês</strong></td>
                    <td><strong>${totalHoras} horas</strong></td>
                `;
                plantaoTableBody.appendChild(totalRow);
            });

        }).catch(function(error) {
            console.error('Erro ao carregar plantões:', error);
        });
    }

    function formatDate(dateStr) {
        var dateParts = dateStr.split('-');
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }

    function calculateHoras(horario) {
        const horarios = {
            '7h às 13h': 6,
            '13h às 19h': 6,
            '19h às 7h': 12,
            '8h às 12h': 4
        };
        return horarios[horario] || 0;
    }

    document.getElementById('applyFilter').addEventListener('click', function() {
        var filters = {
            mes: document.getElementById('filterMes').value,
            nome: document.getElementById('filterNome').value
        };
        loadPlantoes(filters);
    });

    document.getElementById('clearFilter').addEventListener('click', function() {
        document.getElementById('filterMes').value = '';
        document.getElementById('filterNome').value = '';
        loadPlantoes();  // Recarregar todos os plantões sem filtros
    });
});

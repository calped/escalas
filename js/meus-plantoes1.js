document.addEventListener('DOMContentLoaded', function () {
    // Inicializar Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app();
    }

    var auth = firebase.auth();
    var db = firebase.firestore();
    var currentDate = new Date();
    var firestoreUserId = null;

    auth.onAuthStateChanged(function (user) {
        if (user) {
            document.getElementById('adminStatus').innerText = 'Usuário logado: ' + user.email;
            // Buscar ID do usuário no Firestore
            db.collection('users').where('email', '==', user.email).get().then(function (querySnapshot) {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach(function (doc) {
                        firestoreUserId = doc.id;
                        generateCalendar(firestoreUserId, currentDate.getMonth(), currentDate.getFullYear());
                    });
                } else {
                    console.error('Usuário não encontrado no Firestore.');
                }
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    function generateCalendar(userId, month, year) {
        console.log('Gerando calendário para o mês:', month, 'e ano:', year);
        var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        var calendarHeader = document.getElementById('monthYear');
        calendarHeader.innerText = `${monthNames[month]} ${year}`;

        var calendar = document.getElementById('calendar');
        calendar.innerHTML = ''; // Limpa o calendário

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adicionar células vazias para os dias anteriores ao início do mês
        for (let i = 0; i < firstDay; i++) {
            let emptyCell = document.createElement('div');
            emptyCell.classList.add('empty');
            calendar.appendChild(emptyCell);
        }

        // Adicionar os dias do mês e verificar plantões
        for (let day = 1; day <= daysInMonth; day++) {
            let dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.innerText = day;

            let dateStr = new Date(year, month, day).toISOString().split('T')[0];
            console.log('Verificando plantão para o dia:', dateStr);

            // Verificar se há plantões nesse dia
            db.collection('plantoes')
                .where('data', '==', dateStr)
                .get()
                .then((snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.forEach((doc) => {
                            var plantao = doc.data();

                            // Prioriza marcar em amarelo se o usuário atual está escalado
                            if (plantao.medicoId === userId) {
                                dayCell.classList.add('user-plantao'); // Marca o dia com amarelo
                            } else if (plantao.status === 'disponível') {
                                dayCell.classList.add('plantao-disponivel'); // Marca o dia com verde
                            }
                        });
                    }
                })
                .catch((error) => {
                    console.error('Erro ao verificar plantões:', error);
                });

            dayCell.addEventListener('click', function () {
                loadPlantaoDetails(day, month, year, userId);
            });

            calendar.appendChild(dayCell);
        }
    }

    function loadPlantaoDetails(day, month, year, userId) {
        var selectedDate = new Date(year, month, day);
        document.getElementById('selectedDate').innerText = selectedDate.toLocaleDateString();

        var plantaoList = document.getElementById('plantaoList');
        plantaoList.innerHTML = '';

        var dateStr = selectedDate.toISOString().split('T')[0];
        console.log('Carregando detalhes do plantão para a data:', dateStr);

        db.collection('plantoes')
            .where('data', '==', dateStr)
            .get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    plantaoList.innerHTML = '<li>Nenhum plantão encontrado.</li>';
                } else {
                    snapshot.forEach((doc) => {
                        var plantao = doc.data();
                        console.log('Plantão encontrado: ', plantao);

                        db.collection('users').doc(plantao.medicoId).get().then((medicoDoc) => {
                            if (medicoDoc.exists) {
                                var medicoNome = medicoDoc.data().nome;
                                var listItem = document.createElement('li');
                                listItem.innerText = `Local: ${plantao.local}, Horário: ${plantao.horario}, Médico: ${medicoNome}, Status: ${plantao.status}`;
                                
                                // Adiciona botão de anunciar ou cancelar anúncio, dependendo do status
                                if (plantao.medicoId === userId) {
                                    if (plantao.status === 'confirmado') {
                                        var anunciarBtn = document.createElement('button');
                                        anunciarBtn.innerText = 'Anunciar Plantão';
                                        anunciarBtn.onclick = function () {
                                            anunciarPlantao(doc.id);
                                        };
                                        listItem.appendChild(anunciarBtn);
                                    } else if (plantao.status === 'disponível') {
                                        var cancelarBtn = document.createElement('button');
                                        cancelarBtn.innerText = 'Cancelar Anúncio';
                                        cancelarBtn.onclick = function () {
                                            cancelarAnuncio(doc.id);
                                        };
                                        listItem.appendChild(cancelarBtn);
                                    }
                                }

                                // Adiciona botão de assumir se o plantão estiver disponível e não for do usuário logado
                                if (plantao.status === 'disponível' && plantao.medicoId !== userId) {
                                    var assumirBtn = document.createElement('button');
                                    assumirBtn.innerText = 'Assumir Plantão';
                                    assumirBtn.onclick = function () {
                                        assumirPlantao(doc.id, userId);
                                    };
                                    listItem.appendChild(assumirBtn);
                                }

                                plantaoList.appendChild(listItem);
                            }
                        }).catch((error) => {
                            console.error('Erro ao obter o nome do médico:', error);
                        });
                    });
                }
                document.getElementById('plantaoDetails').style.display = 'block';
            })
            .catch((error) => {
                console.error('Erro ao carregar os plantões:', error);
            });
    }

    function anunciarPlantao(plantaoId) {
        db.collection('plantoes').doc(plantaoId).update({
            status: 'disponível'
        })
            .then(function () {
                console.log('Plantão anunciado com sucesso.');
                location.reload(); // Recarregar a página após anunciar o plantão
            })
            .catch(function (error) {
                console.error('Erro ao anunciar o plantão:', error);
            });
    }

    function cancelarAnuncio(plantaoId) {
        db.collection('plantoes').doc(plantaoId).update({
            status: 'confirmado'
        })
            .then(function () {
                console.log('Anúncio cancelado com sucesso.');
                location.reload(); // Recarregar a página após cancelar o anúncio
            })
            .catch(function (error) {
                console.error('Erro ao cancelar o anúncio:', error);
            });
    }

    function assumirPlantao(plantaoId, userId) {
        db.collection('plantoes').doc(plantaoId).update({
            medicoId: userId,
            status: 'confirmado'
        })
            .then(function () {
                console.log('Plantão assumido com sucesso.');
                location.reload(); // Recarregar a página após assumir o plantão
            })
            .catch(function (error) {
                console.error('Erro ao assumir o plantão:', error);
            });
    }

    // Navegação entre meses
    document.getElementById('prevMonth').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(firestoreUserId, currentDate.getMonth(), currentDate.getFullYear());
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(firestoreUserId, currentDate.getMonth(), currentDate.getFullYear());
    });

    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
});

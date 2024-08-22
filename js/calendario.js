document.addEventListener('DOMContentLoaded', function() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app();
    }

    var auth = firebase.auth();
    var db = firebase.firestore();
    var currentDate = new Date();
    
    auth.onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('adminStatus').innerText = 'Usuário logado: ' + user.email;
            generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
        } else {
            document.getElementById('adminStatus').innerText = 'Acesso negado. Por favor, faça login.';
            window.location.href = 'index.html'; // Redireciona para a página de login
        }
    });

    function generateCalendar(month, year) {
        var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        var daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
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

        // Adicionar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            let dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.innerText = day;

            dayCell.addEventListener('click', function() {
                loadPlantaoDetails(day, month, year);
            });

            calendar.appendChild(dayCell);
        }
    }

    function loadPlantaoDetails(day, month, year) {
        var selectedDate = new Date(year, month, day);
        document.getElementById('selectedDate').innerText = selectedDate.toLocaleDateString();

        var plantaoList = document.getElementById('plantaoList');
        plantaoList.innerHTML = '';

        var dateStr = selectedDate.toISOString().split('T')[0];

        db.collection('plantoes')
            .where('data', '==', dateStr)
            .get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    plantaoList.innerHTML = '<li>Nenhum plantão encontrado.</li>';
                } else {
                    let plantoes = [];

                    snapshot.forEach((doc) => {
                        var plantao = doc.data();

                        // Obter o nome do médico pelo ID
                        db.collection('users').doc(plantao.medicoId).get().then((medicoDoc) => {
                            if (medicoDoc.exists) {
                                var medicoNome = medicoDoc.data().nome;
                                plantoes.push({
                                    local: plantao.local,
                                    horario: plantao.horario,
                                    medicoNome: medicoNome,
                                    status: plantao.status
                                });
                            } else {
                                console.error('Médico não encontrado');
                            }
                        }).catch((error) => {
                            console.error('Erro ao obter o nome do médico: ', error);
                        });
                    });

                    // Ordena os plantoes por local e horário
                    plantoes.sort((a, b) => {
                        if (a.local < b.local) return -1;
                        if (a.local > b.local) return 1;
                        let horarioA = convertHorarioToNumber(a.horario);
                        let horarioB = convertHorarioToNumber(b.horario);
                        return horarioA - horarioB;
                    });

                    plantaoList.innerHTML = ''; // Limpa a lista antes de adicionar os itens ordenados

                    plantoes.forEach((plantao) => {
                        var listItem = document.createElement('li');
                        listItem.innerText = `Local: ${plantao.local}, Horário: ${plantao.horario}, Médico: ${plantao.medicoNome}, Status: ${plantao.status}`;
                        plantaoList.appendChild(listItem);
                    });
                }
                document.getElementById('plantaoDetails').style.display = 'block';
            })
            .catch((error) => {
                console.error('Erro ao carregar os plantões: ', error);
            });
    }

    function convertHorarioToNumber(horario) {
        switch (horario) {
            case "7h às 13h": return 1;
            case "13h às 19h": return 2;
            case "19h às 7h": return 3;
            case "8h às 12h": return 4;
            default: return 0;
        }
    }

    // Navegação entre meses
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    });

    document.getElementById('nextMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    });

    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
});

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
            if (user.email === 'calculospediatricos@gmail.com') {
                document.getElementById('adminStatus').innerText = 'Administrador logado';

                // Verifique se os elementos existem antes de manipulá-los
                var userSection = document.getElementById('userSection');
                var plantaoSection = document.getElementById('plantaoSection');
                var calendarSection = document.getElementById('calendarSection');

                if (userSection) userSection.style.display = 'block';
                if (plantaoSection) plantaoSection.style.display = 'block';
                if (calendarSection) calendarSection.style.display = 'block';

                loadMedicos();
                loadCalendar();
            } else {
                document.getElementById('adminStatus').innerText = 'Acesso negado. Somente o administrador pode acessar esta página.';
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    // Função para carregar médicos - código inalterado
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

    // Função para adicionar plantões - código inalterado
    document.getElementById('addPlantaoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        var plantaoData = document.getElementById('plantaoData').value;
        var local = document.getElementById('local').value;
        var horario = document.getElementById('horario').value;
        var medicoId = document.getElementById('medico').value;
        var plantaoStatus = document.getElementById('plantaoStatus').value;

        // Verificação de conflitos de plantão
        db.collection('plantões')
            .where('data', '==', plantaoData)
            .where('local', '==', local)
            .where('horario', '==', horario)
            .get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty || horario === "8h às 12h") {
                    db.collection('plantões').add({
                        data: plantaoData,
                        local: local,
                        horario: horario,
                        medicoId: medicoId,
                        status: plantaoStatus
                    })
                    .then(function() {
                        document.getElementById('plantaoMessage').innerText = 'Plantão adicionado com sucesso!';
                        loadCalendar();
                    })
                    .catch(function(error) {
                        document.getElementById('plantaoMessage').innerText = 'Erro ao adicionar plantão: ' + error.message;
                    });
                } else {
                    document.getElementById('plantaoMessage').innerText = 'Conflito: Já existe um plantão neste local e horário.';
                }
            });
    });

    // Função para carregar o calendário - código inalterado
    function loadCalendar(month, year) {
        var today = new Date();
        if (!month) month = today.getMonth();
        if (!year) year = today.getFullYear();

        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);
        var daysInMonth = lastDay.getDate();
        var currentDay = today.getDate();
        var calendarContainer = document.getElementById('calendarContainer');
        if (!calendarContainer) return; // Certifique-se de que o elemento existe

        calendarContainer.innerHTML = '';

        var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        var dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        
        // Exibir nome do mês e ano
        var calendarHeader = document.createElement('h3');
        calendarHeader.innerText = monthNames[month] + ' ' + year;
        calendarHeader.dataset.month = month;
        calendarHeader.dataset.year = year;
        calendarContainer.appendChild(calendarHeader);

        // Exibir dias da semana
        var dayRow = document.createElement('div');
        dayRow.classList.add('day-row');
        for (var d = 0; d < 7; d++) {
            var dayName = document.createElement('div');
            dayName.classList.add('day-name');
            dayName.innerText = dayNames[d];
            dayRow.appendChild(dayName);
        }
        calendarContainer.appendChild(dayRow);

        // Preencher dias do mês
        var dayCell;
        for (var i = 1; i <= daysInMonth; i++) {
            dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            if (i === currentDay && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }
            dayCell.innerText = i;
            dayCell.addEventListener('click', function(event) {
                var selectedDay = event.target.innerText;
                loadPlantoesForDay(selectedDay, month, year);
            });
            calendarContainer.appendChild(dayCell);
        }
    }

    // Função para carregar plantões por dia - código inalterado
    function loadPlantoesForDay(day, month, year) {
        var selectedDate = new Date(year, month, day).toISOString().split('T')[0];
        var plantaoDetails = document.getElementById('plantaoDetails');
        if (!plantaoDetails) return; // Certifique-se de que o elemento existe

        plantaoDetails.innerHTML = '';

        db.collection('plantões')
            .where('data', '==', selectedDate)
            .orderBy('local')
            .orderBy('horario')
            .get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty) {
                    plantaoDetails.innerHTML = '<p>Nenhum plantão agendado para este dia.</p>';
                } else {
                    querySnapshot.forEach(function(doc) {
                        var plantao = doc.data();
                        db.collection('users').doc(plantao.medicoId).get().then(function(userDoc) {
                            var medico = userDoc.data().nome;
                            var plantaoInfo = document.createElement('p');
                            plantaoInfo.innerText = `Local: ${plantao.local}, Horário: ${plantao.horario}, Médico: ${medico}`;
                            plantaoDetails.appendChild(plantaoInfo);
                        });
                    });
                }
            })
            .catch(function(error) {
                console.error('Erro ao carregar plantões: ', error);
            });
    }

    // Navegação entre meses
    var prevMonthBtn = document.getElementById('prevMonth');
    var nextMonthBtn = document.getElementById('nextMonth');

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            var currentMonth = parseInt(document.querySelector('h3').dataset.month);
            var currentYear = parseInt(document.querySelector('h3').dataset.year);
            loadCalendar(currentMonth - 1, currentYear);
        });

        nextMonthBtn.addEventListener('click', function() {
            var currentMonth = parseInt(document.querySelector('h3').dataset.month);
            var currentYear = parseInt(document.querySelector('h3').dataset.year);
            loadCalendar(currentMonth + 1, currentYear);
        });
    }
});

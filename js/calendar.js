document.addEventListener('DOMContentLoaded', function() {
    var auth = firebase.auth();
    var firestore = firebase.firestore();
    var user = auth.currentUser;

    if (user) {
        // Usuário está logado
        var uid = user.uid;

        // Referência ao Firestore para obter os plantões do usuário
        var shiftsRef = firestore.collection('plantões').where('uid', '==', uid);

        shiftsRef.get().then(function(querySnapshot) {
            var shifts = [];
            querySnapshot.forEach(function(doc) {
                var data = doc.data();
                shifts.push(data); // Aqui você coleta os plantões
            });
            renderCalendar(shifts);
        }).catch(function(error) {
            console.error('Erro ao obter os plantões:', error);
        });
    } else {
        // Se o usuário não estiver logado, redireciona para a página de login
        window.location.href = 'index.html';
    }

    function renderCalendar(shifts) {
        var calendarElement = document.getElementById('calendar');
        var today = new Date();
        var currentMonth = today.getMonth();
        var currentYear = today.getFullYear();

        var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        var firstDay = new Date(currentYear, currentMonth, 1).getDay();

        var calendarHTML = '<table><tr>';

        // Cabeçalhos dos dias da semana
        var daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        daysOfWeek.forEach(function(day) {
            calendarHTML += '<th>' + day + '</th>';
        });

        calendarHTML += '</tr><tr>';

        // Espaços em branco para dias antes do primeiro dia do mês
        for (var i = 0; i < firstDay; i++) {
            calendarHTML += '<td></td>';
        }

        // Dias do mês
        for (var day = 1; day <= daysInMonth; day++) {
            if ((firstDay + day - 1) % 7 === 0 && day !== 1) {
                calendarHTML += '</tr><tr>'; // Começa uma nova linha a cada semana
            }

            var dayShift = shifts.find(shift => {
                var shiftDate = new Date(shift.data); // Supondo que a data dos plantões está no campo 'data'
                return shiftDate.getDate() === day && shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
            });

            if (dayShift) {
                calendarHTML += '<td class="shift-day">' + day + '</td>'; // Dia com plantão
            } else {
                calendarHTML += '<td>' + day + '</td>'; // Dia normal
            }
        }

        calendarHTML += '</tr></table>';

        calendarElement.innerHTML = calendarHTML;
    }
});

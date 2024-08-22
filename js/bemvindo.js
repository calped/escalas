
    var auth = firebase.auth();

    // Exibir o nome do usuário logado
    auth.onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('userName').innerText = user.email;
        } else {
            window.location.href = 'index.html';
        }
    });
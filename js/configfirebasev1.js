document.addEventListener('DOMContentLoaded', function() {
  // Configuração do Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyBy74eytikDLgK2IcwjQyLB-F3jATkdjIg",
    authDomain: "med-escalas.firebaseapp.com",
    projectId: "med-escalas",
    storageBucket: "med-escalas.appspot.com",
    messagingSenderId: "1079355352781",
    appId: "1:1079355352781:web:aa3ca9af72ea95ef9dab84"
  };

  // Inicializar o Firebase
  firebase.initializeApp(firebaseConfig);

  // Referência ao serviço de autenticação
  var auth = firebase.auth();

  // Função para lidar com o login
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    console.log('Tentando logar com o email:', email); // Verifique o email aqui

    auth.signInWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        // Usuário logado com sucesso
        var user = userCredential.user;
        console.log('Usuário logado:', user);

        document.getElementById('loginMessage').innerText = 'Login realizado com sucesso!';

        // Redirecionar para a página de boas-vindas
        console.log('Redirecionando para a página de boas-vindas...');
        window.location.href = 'bemvindo.html'; // Altere para a página de boas-vindas
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error('Erro ao logar:', errorCode, errorMessage);
        document.getElementById('loginMessage').innerText = 'Erro ao logar: ' + errorMessage;
      });
  });
});

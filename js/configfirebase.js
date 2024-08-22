// configfirebase.js

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Certifique-se de que a variável auth seja definida e acessível globalmente
var auth = firebase.auth();


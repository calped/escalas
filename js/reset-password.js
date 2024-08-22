
document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetMessage = document.getElementById('resetMessage');

    resetPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;

        auth.sendPasswordResetEmail(email)
            .then(() => {
                resetMessage.style.color = 'green';
                resetMessage.textContent = 'Email de redefinição de senha enviado!';
            })
            .catch((error) => {
                resetMessage.style.color = 'red';
                switch (error.code) {
                    case 'auth/invalid-email':
                        resetMessage.textContent = 'Email inválido.';
                        break;
                    case 'auth/user-not-found':
                        resetMessage.textContent = 'Usuário não encontrado.';
                        break;
                    default:
                        resetMessage.textContent = 'Erro ao enviar email de redefinição de senha.';
                        break;
                }
            });
    });
});

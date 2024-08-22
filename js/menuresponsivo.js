// Executa a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o botão de alternância do menu e o menu
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.main-nav ul');

    // Verifica se ambos os elementos existem na página
    if (menuToggle && menu) {
        // Adiciona um ouvinte de eventos de clique ao botão de alternância
        menuToggle.addEventListener('click', function() {
            // Verifica o estado atual do atributo 'aria-expanded'
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            // Alterna o valor do atributo 'aria-expanded'
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            // Alterna a classe 'show' no menu
            menu.classList.toggle('show');
        });
    }
});

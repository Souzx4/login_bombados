// =======================================================
// VERIFICAÇÃO DE SESSÃO ATIVA
// =======================================================

// 1. verifica se a credencial existe na memoria curta do navegador
const credencial = sessionStorage.getItem('usuarioLogado');

// se a credencial não existir, chuta o usuario para a tela de login
if (!credencial) {
    // replace faz a pessoa não conseguir usar a seta de voltar
    window.location.replace('login.html');
}

// 2. INtercepta todos os botoes de sair do sistema
document.addEventListener('DOMContentLoaded', () => {
    const botoesSair = document.querySelectorAll('.btn-sair');

    botoesSair.forEach(botao => {
        botao.addEventListener('click', (evento) => {
            evento.preventDefault(); // impede do butao de só mudar de pagina

            sessionStorage.removeItem('usuarioLogado');
            sessionStorage.clear();

            window.location.replace('login.hrml');
        });
    });
});

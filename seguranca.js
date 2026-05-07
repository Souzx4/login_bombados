// ==========================================
// BLINDAGEM DO SISTEMA (CONTROLE DE ACESSO)
// ==========================================

// 1. pega o crachá do usuario na memoria do navegaador
let operadorSec = sessionStorage.getItem('usuarioLogado');

// se não tiver ninguem logado, chuta para a tela login
if (!operadorSec && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}

// 2. descobre quem é o operador logado
let isLauanda = false;
if (operadorSec) {
    let textoSalvo = operadorSec.toLowerCase().trim();
    if (textoSalvo.includes('lauanda') || textoSalvo.includes('"id":2')) {
        isLauanda = true;
    }
}

// 3. paginas que a Lauanda pode acessar
const paginasPermitidasLauanda = [
    'caixa.html',
    'estoque.html',
    'fiados.html',
    'despesas.html',
    'login.html',
    ''
];

// 4. bloqueio de URL para a Lauanda
let paginaAtual = window.location.pathname.split('/').pop();

if (isLauanda && paginaAtual) {
    if (!paginasPermitidasLauanda.includes(paginaAtual)) {
        alert('Acesso negado: Você não tem permissão para acessar esta página.');
        window.location.href = 'estoque.html';
    }
}

// 5. esconder os menus proibidos
document.addEventListener("DOMContentLoaded", function () {
    if (isLauanda) {
        // Procura os links do menu e esconde um por um
        let menuPainel = document.querySelector('a[href="painel.html"]');
        let menuVendas = document.querySelector('a[href="vendas.html"]');
        let menuUsuarios = document.querySelector('a[href="usuarios.html"]');
        let menuRh = document.querySelector('a[href="rh.html"]');

        if (menuPainel) menuPainel.style.display = 'none';
        if (menuVendas) menuVendas.style.display = 'none';
        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuRh) menuRh.style.display = 'none';
    }
});
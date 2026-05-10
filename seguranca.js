// ==========================================
// BLINDAGEM DO SISTEMA (CONTROLE DE ACESSO)
// ==========================================

// 1. pega o crachá do usuario na memoria do navegaador
let operadorSec = sessionStorage.getItem('usuarioLogado');

// se não tiver ninguem logado, chuta para a tela login
if (!operadorSec && !window.location.pathname.includes('login')) {
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
    'caixa',
    'estoque',
    'fiados',
    'despesas',
    'login',
    ''
];

// 4. bloqueio de URL para a Lauanda
let paginaAtual = window.location.pathname.split('/').pop();

//Arranca o .html da palavra, unificando PC e Nuvem!
paginaAtual = paginaAtual.replace('.html', '');

if (isLauanda && paginaAtual) {
    if (!paginasPermitidasLauanda.includes(paginaAtual)) {
        alert('Acesso negado: Você não tem permissão para acessar esta página.');
        // Se ela tentar invadir outra tela, a punição é voltar pro Caixa!
        window.location.href = 'caixa.html';
    }
}

// 5. esconder os menus proibidos
document.addEventListener("DOMContentLoaded", function () {
    if (isLauanda) {
        // Usamos o *="palavra" para esconder o menu independentemente de ter .html no href ou não
        let menuPainel = document.querySelector('a[href*="painel"]');
        let menuVendas = document.querySelector('a[href*="vendas"]');
        let menuUsuarios = document.querySelector('a[href*="usuarios"]');
        let menuRh = document.querySelector('a[href*="rh"]');

        if (menuPainel) menuPainel.style.display = 'none';
        if (menuVendas) menuVendas.style.display = 'none';
        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuRh) menuRh.style.display = 'none';
    }
});
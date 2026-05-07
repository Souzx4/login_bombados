const API_URL = 'https://sistema-bombados-backend.onrender.com';

// 1. identificar quem está usando a tela
let operadorString = sessionStorage.getItem('usuarioLogado');
let idUsuarioLogado = 1;
let nomeUsuarioLogado = "Desconhecido";

if (operadorString) {
    try {
        let dadosUsuario = sessionStorage.getItem('usuarioLogado');
        let idUsuarioLogado = 1;
        let nomeUsuarioLogado = "Desconhecido";

        if (operadorString) {
            try {
                let dadosUsuario = JSON.parse(operadorString);
                idUsuarioLogado = dadosUsuario.id;
                nomeUsuarioLogado = dadosUsuario.nome;
            } catch (e) {
                nomeUsuarioLogado = operadorString;
            }
        }
        document.getElementById('nome-operador').innerText = nomeUsuarioLogado;

        // já preenche a data de hoje no campo
        document.getElementById('data-despesa').valueAsDate = new Date();

        // ==========================================
        // REGISTRAR NOVA DESPESA
        // ==========================================
        document.getElementById('btn-resgistrar-despesa').addEventListener('click', async () => {
            const descricao = document.getElementById('desc-despesa').value.trim();
            const valor = parseFloat(document.getElementById('valor-despesa').value);
            const dataDespesa = document.getElementById('data-despesa').value;

            if (!descricao || isNaN(valor) || valor <= 0 || !dataDespesa) {
                alert('Por favor, preencha todos os campos corretamente.');
                return;
            }

            const novaDespesa = {
                descricao: descricao,
                valor: valor,
                dataDespesa: dataDespesa,
                usuarioId: idUsuarioLogado
            };

            try {
                const resposta = await fetch(`${API_URL}/api/despesas`, {
                }
        });
    }
}
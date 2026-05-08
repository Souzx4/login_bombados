const API_URL = 'https://sistema-bombados-backend.onrender.com';

// 1. Identificar quem está usando a tela
let operadorString = sessionStorage.getItem('usuarioLogado');
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

// Já preenche a data de hoje no campinho automaticamente
document.getElementById('data-despesa').valueAsDate = new Date();

// ==========================================
// REGISTRAR NOVA DESPESA
// ==========================================
document.getElementById('btn-registrar-despesa').addEventListener('click', async () => {
    const descricao = document.getElementById('desc-despesa').value.trim();
    const valor = parseFloat(document.getElementById('valor-despesa').value);
    const dataDespesa = document.getElementById('data-despesa').value;

    if (!descricao || isNaN(valor) || valor <= 0 || !dataDespesa) {
        alert("Preencha todos os campos corretamente antes de registrar!");
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaDespesa)
        });

        if (resposta.ok) {
            alert("✅ Saída registrada com sucesso!");
            document.getElementById('desc-despesa').value = '';
            document.getElementById('valor-despesa').value = '';
            carregarDespesas(); // Atualiza a tabela na hora
        } else {
            alert("Erro ao registrar despesa no servidor.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro de conexão com o servidor.");
    }
});

// ==========================================
// CARREGAR A LISTA DE DESPESAS (HISTÓRICO)
// ==========================================
async function carregarDespesas() {
    const tbody = document.getElementById('tabela-despesas');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Carregando despesas...</td></tr>';

    try {
        const resposta = await fetch(`${API_URL}/api/despesas`);
        if (resposta.ok) {
            const despesas = await resposta.json();
            tbody.innerHTML = '';

            if (despesas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Nenhuma despesa registrada ainda.</td></tr>';
                return;
            }

            despesas.forEach(d => {
                // Formatar data (De AAAA-MM-DD para DD/MM/AAAA)
                let dataFormatada = d.dataDespesa.split('-').reverse().join('/');

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #222;">
                        <td style="padding: 10px;">#${d.id}</td>
                        <td style="padding: 10px;">${dataFormatada}</td>
                        <td style="padding: 10px; color: white;">${d.descricao}</td>
                        <td style="padding: 10px; color: #888;">👤 ${d.nomeUsuario}</td>
                        <td class="valor-despesa" style="padding: 10px;">R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `;
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar despesas:", erro);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#e91e63;">Erro ao carregar os dados.</td></tr>';
    }
}

// ==========================================
// MENUS LATERAIS (Mobile)
// ==========================================

const btnAbrirMenu = document.getElementById('abrir-menu');
const btnFecharMenu = document.getElementById('fechar-menu');
const menuLateral = document.getElementById('menu-lateral');
if (btnAbrirMenu) btnAbrirMenu.addEventListener('click', () => menuLateral.style.left = '0');
if (btnFecharMenu) btnFecharMenu.addEventListener('click', () => menuLateral.style.left = '-250px');

carregarDespesas();
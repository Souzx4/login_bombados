const API_URL = 'https://sistema-bombados-backend.onrender.com';

// =================================================
// Função para buscar vendas com ou sem filtro
// =================================================
async function buscarVendas() {

    const dataInicio = document.getElementById('filtro-inicio').value;
    const dataFim = document.getElementById('filtro-fim').value;

    let url = `${API_URL}/api/vendas/todas`;

    // se o usuario preencheu as duas datas, mude a rota para o do filtro
    if (dataInicio && dataFim) {
        url = `${API_URL}/api/vendas/filtro?inicio=${dataInicio}&fim=${dataFim}`;
    }

    try {
        const resposta = await fetch(url);
        if (resposta.ok) {
            const vendas = await resposta.json();
            renderizarTabela(vendas);
            calcularComissoes(vendas); // calcula o dinheiro de cada um
        } else {
            console.error('Erro ao buscar as vendas');
        }
    } catch (erro) {
        console.error('Falha de conexão com o servidor', erro);
    }
}
// =================================================
// RENDERIZAR A TABELA
// =================================================
function renderizarTabela(vendas) {
    const tbody = document.getElementById('tabela-vendas-body');
    tbody.innerHTML = '';

    vendas.forEach(venda => {
        const linha = document.createElement('tr');
        linha.style.borderBottom = '1px solid #333';

        // 1. O PADRÃO É FIADO 
        let formaPagamento = "Fiado 📝";
        let corTag = "#e91e63"; // Rosa

        // 2. VERIFICA AS GAVETAS COM CUIDADO (A letra maiúscula é vital!)
        if (venda.valorCartao > 0) {
            formaPagamento = "Cartão 💳";
            corTag = "#2196F3"; // Azul
        } else if (venda.valorPix > 0) {
            formaPagamento = "Pix 💠";
            corTag = "#00BCD4"; // Ciano
        } else if (venda.valorDinheiro > 0) { // <-- OLHA A GAVETA DO DINHEIRO AQUI!
            formaPagamento = "Dinheiro 💵";
            corTag = "#4CAF50"; // Verde
        }

        // Formata a data e hora
        const dataFormatada = new Date(venda.dataHora).toLocaleString('pt-BR');

        // Garante que se o nome for vazio, mostre "Admin"
        const nomeVendedor = venda.nomeVendedor ? venda.nomeVendedor : "Admin (antigo)";

        linha.innerHTML = `
            <td style="padding: 15px 10px; color: #ff9900; font-weight: bold;">#${venda.id}</td>
            <td style="padding: 15px 10px;">${dataFormatada}</td>
            <td style="padding: 15px 10px;">${venda.cliente}</td>
            <td style="padding: 15px 10px; font-weight: bold;">👤 ${nomeVendedor}</td>
            <td style="padding: 15px 10px;">
                <span style="color: ${corTag}; font-weight: bold;">${formaPagamento}</span>
            </td>
            <td style="padding: 15px 10px; font-weight: bold;">R$ ${venda.valorTotal.toFixed(2).replace('.', ',')}</td>
        `;
        tbody.appendChild(linha);
    });
}

// =================================================
// CALCULAR COMISSÕES E TOTAIS
// =================================================
function calcularComissoes(vendas) {
    const painel = document.getElementById('painel-comissoes');
    painel.innerHTML = ''; // limpa os cards antigos

    let faturamentoTotal = 0;
    const totaisPorVendedor = {}; // vai guardar { "Lauanda": 500.00, "Junior": 1200.00 }

    vendas.forEach(venda => {
        faturamentoTotal += venda.valorTotal;

        const nome = venda.nomeVendedor ? venda.nomeVendedor : "Admin (antigo)";
        if (!totaisPorVendedor[nome]) {
            totaisPorVendedor[nome] = 0;
        }
        totaisPorVendedor[nome] += venda.valorTotal;
    });

    // 1. cria um card de faturamento total
    painel.innerHTML += `
        <div style="flex: 1; min-width: 200px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid #ff9900;">
            <h3 style="color: #aaa; margin-bottom: 10px; font-size: 14px;">Total no Período</h3>
            <h2 style="color: white; font-size: 24px;">R$ ${faturamentoTotal.toFixed(2).replace('.', ',')}</h2>
        </div>
    `;

    // 2. cria um card dinamico para cada vendedor encontrado na linha
    for (const [vendedor, total] of Object.entries(totaisPorVendedor)) {
        painel.innerHTML += `
            <div style="flex: 1; min-width: 200px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid #4CAF50;">
                <h3 style="color: #aaa; margin-bottom: 10px; font-size: 14px;">Vendido por: ${vendedor}</h3>
                <h2 style="color: white; font-size: 24px;">R$ ${total.toFixed(2).replace('.', ',')}</h2>
            </div>
        `;
    }
}

// =================================================
// AÇÕES DOS BOTÕES DE FILTRO
// =================================================
document.getElementById('btn-filtrar').addEventListener('click', buscarVendas);

document.getElementById('btn-limpar').addEventListener('click', () => {
    document.getElementById('filtro-inicio').value = '';
    document.getElementById('filtro-fim').value = '';
    buscarVendas();
});

buscarVendas();
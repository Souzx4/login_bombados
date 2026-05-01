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
            <td style="padding: 15px 10px; font-weight: bold;">R$ ${venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

    // variaveis para somar o grande total
    let totalGeral = 0;
    let somaGeralPix = 0;
    let somaGeralCartao = 0;
    let somaGeralDinheiro = 0;

    // metre 
    const totaisPorVendedor = {}; // vai guardar { "Lauanda": 500.00, "Junior": 1200.00 }

    vendas.forEach(venda => {
        totalGeral += venda.valorTotal;
        somaGeralPix += venda.valorPix || 0;
        somaGeralCartao += venda.valorCartao || 0;
        somaGeralDinheiro += venda.valorDinheiro || 0;

        const nome = venda.nomeVendedor ? venda.nomeVendedor : "Admin (antigo)";

        if (!totaisPorVendedor[nome]) {
            totaisPorVendedor[nome] = { total: 0, pix: 0, cartao: 0, dinheiro: 0 };
        }

        // 3. Guarda os valores nas gavetas certas do vendedor
        totaisPorVendedor[nome].total += venda.valorTotal;
        totaisPorVendedor[nome].pix += venda.valorPix || 0;
        totaisPorVendedor[nome].cartao += venda.valorCartao || 0;
        totaisPorVendedor[nome].dinheiro += venda.valorDinheiro || 0;

    });

    // 1. cria um card de faturamento total
    painel.innerHTML += `
        <div style="flex: 1; min-width: 280px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid #ff9900; box-shadow: 0px 4px 10px rgba(0,0,0,0.5);">
            <h3 style="color: #aaa; margin-bottom: 5px; font-size: 14px; text-transform: uppercase;">Total no Período</h3>
            <h2 style="color: #ff9900; font-size: 28px; font-weight: 900; margin-bottom: 15px;">R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            
            <div style="display: flex; flex-direction: column; gap: 5px; font-size: 13px; background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid #333;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #4CAF50;">💵 Dinheiro:</span> 
                    <strong>R$ ${somaGeralDinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #2196F3;">💳 Cartão:</span> 
                    <strong>R$ ${somaGeralCartao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #00BCD4;">💠 Pix:</span> 
                    <strong>R$ ${somaGeralPix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
            </div>
        </div>
    `;

    // 2. cria um card dinamico para cada vendedor encontrado na linha
    for (const [vendedor, dados] of Object.entries(totaisPorVendedor)) {
        painel.innerHTML += `
            <div style="flex: 1; min-width: 250px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid #4CAF50;">
                <h3 style="color: #aaa; margin-bottom: 5px; font-size: 14px;">Vendido por: <strong>${vendedor}</strong></h3>
                <h2 style="color: white; font-size: 24px; margin-bottom: 15px;">R$ ${dados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                
                <div style="display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #ccc;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #444; padding-bottom: 2px;">
                        <span>Dinheiro:</span> 
                        <span style="color: #4CAF50;">R$ ${dados.dinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #444; padding-bottom: 2px;">
                        <span>Cartão:</span> 
                        <span style="color: #2196F3;">R$ ${dados.cartao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Pix:</span> 
                        <span style="color: #00BCD4;">R$ ${dados.pix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
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

// =================================================
// RESPONSIVIDADE: ABRIR E FECHAR MENU MOBILE
// =================================================
const btnAbrirMenu = document.getElementById('abrir-menu');
const btnFecharMenu = document.getElementById('fechar-menu');
const menuLateral = document.getElementById('menu-lateral');

if (btnAbrirMenu && btnFecharMenu && menuLateral) {
    btnAbrirMenu.addEventListener('click', () => {
        menuLateral.classList.add('menu-aberto');
    });
    btnFecharMenu.addEventListener('click', () => {
        menuLateral.classList.remove('menu-aberto');
    });
}
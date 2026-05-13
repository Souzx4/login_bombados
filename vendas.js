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

        // 1. MATEMÁTICA DAS GAVETAS
        let valDinheiro = venda.valorDinheiro || 0;
        let valCartao = venda.valorCartao || 0;
        let valPix = venda.valorPix || 0;

        let totalPago = valDinheiro + valCartao + valPix;
        let diferenca = venda.valorTotal - totalPago;

        let metodosUsados = 0;
        if (valDinheiro > 0) metodosUsados++;
        if (valCartao > 0) metodosUsados++;
        if (valPix > 0) metodosUsados++;

        let formaPagamento = "";
        let corTag = "";

        // 2. O JUIZ: DECIDE QUAL É A ETIQUETA CORRETA
        if (diferenca > 0.01) {
            // Ficou devendo (É Fiado!)
            if (totalPago === 0) {
                formaPagamento = "Fiado 📝";
                corTag = "#e91e63"; // Rosa
            } else {
                formaPagamento = "Misto (C/ Fiado) 📝";
                corTag = "#ff9800"; // Laranja
            }
        } else {
            // Pagou tudo certinho!
            if (metodosUsados > 1) {
                formaPagamento = "Misto 🔀";
                corTag = "#9c27b0"; // Roxo (Cor nova para destacar!)
            } else if (valCartao > 0) {
                formaPagamento = "Cartão 💳";
                corTag = "#2196F3"; // Azul
            } else if (valPix > 0) {
                formaPagamento = "Pix 💠";
                corTag = "#00BCD4"; // Ciano
            } else if (valDinheiro > 0) {
                formaPagamento = "Dinheiro 💵";
                corTag = "#4CAF50"; // Verde
            } else {
                formaPagamento = "Desconhecido";
                corTag = "#aaa"; // Cinza
            }
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
            <td style="padding: 15px 10px;">
                <button onclick="abrirDetalhesVenda(${venda.id})" style="background-color: #2196F3; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Detalhes</button>
            </td>
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
    let lucroGeral = 0;
    let somaGeralPix = 0;
    let somaGeralCartao = 0;
    let somaGeralDinheiro = 0;

    // metre 
    const totaisPorVendedor = {}; // vai guardar { "Lauanda": 500.00, "Junior": 1200.00 }

    vendas.forEach(venda => {
        totalGeral += venda.valorTotal;
        lucroGeral += venda.lucro || 0;
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

    // ==========================================
    // Lógica para cor do Lucro (Verde ou Vermelho)
    // ==========================================
    let corLucro = lucroGeral >= 0 ? "#4CAF50" : "#f44336"; // Verde se positivo, Vermelho forte se negativo
    let iconeLucro = lucroGeral >= 0 ? "📈" : "📉"; // Sobe se positivo, desce se negativo

    // 1. cria um card de faturamento total e o NOVO CARD DE LUCRO LÍQUIDO
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

        <div style="flex: 1; min-width: 280px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid ${corLucro}; box-shadow: 0px 4px 10px rgba(0,0,0,0.5);">
            <h3 style="color: #aaa; margin-top: 40px; font-size: 14px; display: block; text-align: center; text-transform: uppercase; "border-bottom: 1px solid #444 padding-bottom: 15px;">Lucro Líquido no Período</h3>
            <h2 style="color: ${corLucro}; font-size: 28px; font-weight: 900; display: block; text-align: center; margin-top: 15px; margin-bottom: 15px;">${iconeLucro} R$ ${lucroGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2> 
        </div>
    `;

    // 2. cria um card dinamico para cada vendedor encontrado na linha
    for (const [vendedor, dados] of Object.entries(totaisPorVendedor)) {
        painel.innerHTML += `
            <div style="flex: 1; min-width: 250px; background: #222; padding: 20px; border-radius: 8px; border-left: 5px solid #00BCD4;">
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

// =================================================
// VER DETALHES DOS PRODUTOS DA VENDA (MODAL)
// =================================================
async function abrirDetalhesVenda(idVenda) {
    const modal = document.getElementById('modal-detalhes');
    const tbody = document.getElementById('tabela-detalhes-body');
    const tituloId = document.getElementById('detalhe-id-venda');

    //limpa a tabela e mostra o modal carregando
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">⏳ Buscando produtos...</td></tr>';
    tituloId.innerHTML = `#${idVenda}`;
    modal.style.display = 'block';

    try {
        // vai no java buscar os itens especificos desta venda
        const resposta = await fetch(`${API_URL}/api/vendas/${idVenda}/itens`);

        if (resposta.ok) {
            const itens = await resposta.json();
            tbody.innerHTML = '';

            if (itens.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ff4444;">Nenhum produto detalhado encontrado (Venda Antiga).</td></tr>';
                return;
            }

            //desenha o produto na tela
            itens.forEach(item => {
                const categoriaFormatada = item.categoriaProduto ? item.categoriaProduto : '<span style="color: #666;">Sem Categoria</span>';

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px; font-weight: bold;">${item.nomeProduto}</td>
                        <td style="padding: 10px; color: #00BCD4;">${categoriaFormatada}</td>
                        <td style="padding: 10px; text-align: center;">${item.quantidade}x</td>
                        <td style="padding: 10px;">R$ ${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 10px; color: #4CAF50; font-weight: bold;">R$ ${item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                `;
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar detalhes da venda: ", erro);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Erro ao carregar detalhes.</td></tr>';
    }
}

function fecharModalDetalhes() {
    document.getElementById('modal-detalhes').style.display = 'none';
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        fecharModalDetalhes();
    }
});
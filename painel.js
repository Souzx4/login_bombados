const API_URL = 'https://sistema-bombados-backend.onrender.com';

// =================================================
//  ALERTA DE PRODUTOS VENCENDO
// =================================================

// 1. Busca o número pro painel inicial
async function carregarAlertaValidade() {
    try {
        const resposta = await fetch(`${API_URL}/api/estoque/vencendo/total`);
        if (resposta.ok) {
            const quantidadeVencendo = await resposta.text();
            document.getElementById('valor-vencendo').innerText = quantidadeVencendo;
        }
    } catch (erro) {
        console.error("Erro ao buscar alerta de validade: ", erro);
        document.getElementById('valor-vencendo').innerText = "!";
    }
}

// 2. Abre a janela Modal com a lista dos produtos
async function abrirModalVencimento() {
    try {
        const resposta = await fetch(`${API_URL}/api/estoque/vencendo/lista`);
        if (resposta.ok) {
            const produtos = await resposta.json();
            const tbody = document.getElementById('tabela-relatorio-vencimento');
            tbody.innerHTML = '';

            produtos.forEach(p => {
                // Matemática básica pra calcular dias
                let dataVencimento = new Date(p.dataValidade);
                let dataHoje = new Date();
                let diferencaTempo = dataVencimento.getTime() - dataHoje.getTime();
                let diasParaVencer = Math.ceil(diferencaTempo / (1000 * 3600 * 24));

                let statusCor = "";
                let textoDias = "";
                let sugestao = "";

                if (diasParaVencer < 0) {
                    statusCor = "#f44336"; // Vermelho forte
                    textoDias = `VENCIDO HÁ ${Math.abs(diasParaVencer)} DIAS!`;
                    sugestao = "Descartar Produto 🗑️";
                } else if (diasParaVencer <= 30) {
                    statusCor = "#ff5722"; // Laranja escuro
                    textoDias = `Vence em ${diasParaVencer} dias`;
                    sugestao = "Promoção Urgente 🔥";
                } else {
                    statusCor = "#ffeb3b"; // Amarelo
                    textoDias = `Vence em ${diasParaVencer} dias`;
                    sugestao = "Fazer Kit / Combo 📦";
                }

                // Converte de Ano-Mes-Dia para Dia/Mes/Ano pro Junior ler
                let dataSeparada = p.dataValidade.split("-");
                let dataBr = `${dataSeparada[2]}/${dataSeparada[1]}/${dataSeparada[0]}`;

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px;">
                            <strong>${p.nome}</strong><br>
                            <small style="color: #aaa;">Válido até: ${dataBr}</small>
                        </td>
                        <td style="padding: 10px; text-align: center; color: ${statusCor}; font-weight: bold;">
                            ${textoDias}
                        </td>
                        <td style="padding: 10px; text-align: right; color: #fff;">
                            ${sugestao}
                        </td>
                    </tr>
                `;
            });

            // Mostra o modal na tela
            document.getElementById('modal-vencimento').style.display = 'flex';
        }
    } catch (erro) {
        console.error("Erro ao buscar relatório de vencimento", erro);
    }
}

// 3. Função para fechar o Modal
function fecharModalVencimento() {
    document.getElementById('modal-vencimento').style.display = 'none';
}

// Função que vai buscar o dinheiro no Java
async function carregarFaturamento() {
    try {
        // 1. Liga pro Java e pede os dois valores ao mesmo tempo!
        const respHoje = await fetch(`${API_URL}/api/faturamento`);
        const respOntem = await fetch(`${API_URL}/api/faturamento/ontem`);

        if (respHoje.ok && respOntem.ok) {

            //2. Pega as respostas e já converte para número (se vier vazio, vira 0)
            const valorHoje = parseFloat(await respHoje.text()) || 0;
            const valorOntem = parseFloat(await respOntem.text()) || 0;

            // 3. O JavaScript formata para o padrão do Brasil
            const valorFormatado = valorHoje.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            document.getElementById('faturamento-total').innerText = valorFormatado;

            // 3. A LÓGICA DO KPI (A Porcentagem)
            let kpiSpan = document.getElementById('kpi-faturamento');
            let porcentagem = 0;

            //4. matematica basica ((Hoje - ontem) / ontem) * 100
            if (valorOntem > 0) {
                porcentagem = ((valorHoje - valorOntem) / valorOntem) * 100;
            } else if (valorOntem === 0 && valorHoje > 0) {
                porcentagem = 100;
            }

            // 5. Pinta de verde, vermelho ou cinza
            if (porcentagem > 0) {
                kpiSpan.innerHTML = `🟢 <span style="color: #4CAF50; font-weight: bold;">+${porcentagem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span> em relação a ontem`;
            } else if (porcentagem < 0) {
                kpiSpan.innerHTML = `🔴 <span style="color: #f44336; font-weight: bold;">${porcentagem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span> em relação a ontem`;
            } else {
                kpiSpan.innerHTML = `⚪ <span style="color: #999; font-weight: bold;">0%</span> em relação a ontem`;
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar o faturamento: ', erro);
        document.getElementById('faturamento-total').innerText = 'Erro!';
    }
}


// =================================================
// Função que vai buscar a quantidade de estoque baixo
// =================================================

async function carregarEstoqueBaixo() {
    try {
        const resposta = await fetch(`${API_URL}/api/estoque/baixo`);

        if (resposta.ok) {
            const quantidade = await resposta.text();
            // injeta o nuemro vermelho na tela
            document.getElementById('valor-estoque-baixo').innerText = quantidade;
        }
    } catch (erro) {
        console.error("erro ao buscar o alerta de estoque: ", erro);
        document.getElementById('valor-estoque-baixo').innerText = "!";
    }
}


// =================================================
// Função que vai buscar as últimas 5 vendas
// =================================================

async function carregarUltimasVendas() {
    try {
        const resposta = await fetch(`${API_URL}/api/vendas/recentes`);

        if (resposta.ok) {
            const vendas = await resposta.json();
            const tbody = document.getElementById('tabela-ultimas-vendas');
            tbody.innerHTML = ''; // limpa a tabela antes de preencher

            // para cada venda encontrada desenhe uma linha
            vendas.forEach(venda => {

                // descobre a forma de pagamento investigando o dinheiro recebido
                let formaPgto = "💵 Dinheiro";
                if (venda.valorPix > 0) formaPgto = "📱 PIX";
                if (venda.valorCartao > 0) formaPgto = "💳 Cartão";

                // formataão rapida da data

                let dataSeparada = venda.dataHora.split(" ");
                let dataBr = dataSeparada[0].split("-").reverse().join("/");
                let hora = dataSeparada[1];

                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #ddd';

                linha.innerHTML = `
                            <td style="padding: 10px; color: #ff9900;">#00${venda.id}</td>
                            <td style="padding: 10px;">${dataBr} às ${hora}</td>
                            <td style="padding: 10px;">${formaPgto}</td>
                            <td style="padding: 10px;"><strong>R$ ${venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        `;
                tbody.appendChild(linha);

            });
        }
    } catch (erro) {
        console.error("Erro ao carregar as últimas vendas: ", erro);
    }
}

// =================================================
// Função que vai buscar o total de produtos cadastrados
// =================================================
async function carregarTotalProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/api/estoque/total`);

        if (resposta.ok) {
            const total = await resposta.text();
            // injeta o numero real no cartao
            document.getElementById('total-produtos').innerText = total;
        }
    } catch (erro) {
        console.error("Erro ao buscar o total de produtos: ", erro);
        document.getElementById('total-produtos').innerText = "!";
    }
}


// =================================================
// MODAL DE ESTOQUE BAIXO NO DASHBOARD
// =================================================
async function abrirModalEstoqueBaixo() {
    try {
        const resposta = await fetch(`${API_URL}/api/estoque/relatorio-baixo`);
        if (resposta.ok) {
            const produtos = await resposta.json();
            const tbody = document.getElementById('tabela-relatorio-baixo');
            tbody.innerHTML = '';

            produtos.forEach(p => {
                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px; font-weight: bold;">${p.nome}</td>
                        <td style="padding: 10px; text-align: center;">${p.estoqueMinimo} un.</td>
                        <td style="padding: 10px; text-align: center; color: #e91e63; font-weight: bold; font-size: 16px;">${p.qtd_estoque} un.</td>
                    </tr>
                `;
            });

            // mostra o modal na tela
            document.getElementById('modal-estoque-baixo').style.display = 'flex';
        }
    } catch (erro) {
        console.error("Erro ao buscar relatorio", erro);
    }
}

function fecharModalEstoqueBaixo() {
    document.getElementById('modal-estoque-baixo').style.display = 'none';
}

// =================================================
// VERIFICAR STATUS DO CAIXA DA LAUANDA
// =================================================
function verificarStatusCaixa() {
    const statusCaixa = document.getElementById('status-caixa');
    const operadorCaixa = document.getElementById('operador-caixa');

    // O Painel lê a chave com o nome
    let statusCaixaFrontal = localStorage.getItem('caixa_status');

    // lendo quem é o operador
    let nomeOperadorFrontal = localStorage.getItem('caixa_operador') || 'Desconhecido';

    if (statusCaixaFrontal === 'ABERTO') {
        // A Lauanda abriu a tela do Caixa!
        if (statusCaixa) {
            statusCaixa.innerText = "Aberto";
            statusCaixa.style.color = "#4CAF50"; // Verde!
        }
        if (operadorCaixa) operadorCaixa.innerText = "Operador: " + nomeOperadorFrontal;

    } else {
        // A tela do caixa não foi aberta ou ela encerrou o turno
        if (statusCaixa) {
            statusCaixa.innerText = "Fechado";
            statusCaixa.style.color = "#e91e63"; // Vermelho!
        }
        if (operadorCaixa) operadorCaixa.innerText = "Caixa Inativo";
    }
}

// =================================================
// RESPONSIVIDADE: ABRIR E FECHAR MENU MOBILE
// =================================================
const btnAbrirMenu = document.getElementById('abrir-menu');
const btnFecharMenu = document.getElementById('fechar-menu');
const menuLateral = document.getElementById('menu-lateral');

if (btnAbrirMenu && btnFecharMenu && menuLateral) {
    // Quando clicar no ☰, adiciona a classe que traz o menu pra tela
    btnAbrirMenu.addEventListener('click', () => {
        menuLateral.classList.add('menu-aberto');
    });

    // Quando clicar no ✖, remove a classe e o menu volta a se esconder
    btnFecharMenu.addEventListener('click', () => {
        menuLateral.classList.remove('menu-aberto');
    });
}


// manda os codigos rodaren assim que o chefe abrir a tela
verificarStatusCaixa();
carregarFaturamento();
carregarEstoqueBaixo();
carregarUltimasVendas();
carregarTotalProdutos();
carregarAlertaValidade();
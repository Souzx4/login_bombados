// Função que vai buscar o dinheiro no Java
async function carregarFaturamento() {
    try {
        // 1. O painel "liga" para a nossa nova rota na porta 8080
        const resposta = await fetch('http://localhost:8080/api/faturamento');

        if (resposta.ok) {
            // 2. Pega a resposta do Java (ex: "279.80")
            const valorTexto = await resposta.text();
            const valorNumerico = parseFloat(valorTexto);

            // 3. O JavaScript formata para o padrão do Brasil
            const valorFormatado = valorNumerico.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL'
            });

            // 4. Exibe o valor formatado no elemento HTML
            document.getElementById('faturamento-total').innerText = valorFormatado;
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
        const resposta = await fetch('http://localhost:8080/api/estoque/baixo');

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
        const resposta = await fetch('http://localhost:8080/api/vendas/recentes');

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
                            <td style="padding: 10px;"><strong>R$ ${venda.valorTotal.toFixed(2).replace('.', ',')}</strong></td>
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
        const resposta = await fetch('http://localhost:8080/api/estoque/total');

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

// manda os codigos rodaren assim que o chefe abrir a tela
carregarFaturamento();
carregarEstoqueBaixo();
carregarUltimasVendas();
carregarTotalProdutos();
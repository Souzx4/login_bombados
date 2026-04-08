// =================================================
// Função para buscar e desenhar o Histórico de Vendas
// =================================================
async function carregarHistoricoVendas() {
    try {
        const resposta = await fetch('http://localhost:8080/api/vendas/todas');

        if (resposta.ok){
            const vendas = await resposta.json();
            const tbody = document.getElementById('tabela-vendas-body');
            tbody.innerHTML = ''; // limpa a tabela

            vendas.forEach(venda => {
                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #333'; // Adiciona borda inferior a cada linha

                // descobrindo como o cliente pagou
                let formaPagamento = '';
                if (venda.valorDinheiro > 0) formaPagamento = `<span style="color: #4CAF50;">💵 Dinheiro</span>`;
                else if (venda.valorPix > 0) formaPagamento = `<span style="color: #00BCD4;">💠 Pix</span>`;
                else if (venda.valorCartao > 0) formaPagamento = `<span style="color: #FFC107;">💳 Cartão</span>`;
                else formaPagamento = `<span>⚠️ Outro</span>`;

                // arrumando a data
                let dataFormatada = venda.dataHora;
                if (venda.dataHora){
                    const partes = venda.dataHora.split(" ");
                    if (partes.length === 2){
                        const data = partes[0].split("-");
                        const hora = partes[1].substring(0, 5); // Pega só HH:mm
                        dataFormatada = `${data[2]}/${data[1]}/${data[0]} as ${hora}`;
                    }
                }
                // Desenhando a linha na tabela
                linha.innerHTML = `
                    <td style="padding: 15px 10px; color: #ff9900; font-weight: bold;">#${venda.id}</td>
                    <td style="padding: 15px 10px;">${dataFormatada}</td>
                    <td style="padding: 15px 10px;"><strong>${venda.cliente || "Consumidor Final"}</strong></td>
                    <td style="padding: 15px 10px; font-weight: bold;">R$ ${venda.valorTotal.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 15px 10px;">${formaPagamento}</td>
                `;

                tbody.appendChild(linha);
            });
        }
    } catch (erro){
        console.error('Erro ao carregar histórico de vendas:', erro);
        document.getElementById('tabela-vendas-body').innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro ao carregar os dados.</td></tr>`;
    }
}

// inicia a função assim que carrega a pagina
carregarHistoricoVendas();
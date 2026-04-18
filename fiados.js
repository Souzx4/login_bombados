const API_URL = 'https://sistema-bombados-backend.onrender.com';

// =================================================
// 1. BUSCAR FIADOS NO JAVA
// =================================================
async function carregarFiados() {
    try {
        // pede a lista de quem está devendo
        const resposta = await fetch(`${API_URL}/api/fiados`);

        if (resposta.ok) {
            const fiados = await resposta.json();
            renderizarTabelaFiados(fiados); // Manda a lista para a função que desenha a tela
        } else {
            console.error('Erro ao buscar fiados no servidor');
        }
    } catch (erro) {
        console.erro('Erro de conexão ao tentar buscar fiados', erro);
    }
}

// =================================================
// 2. DESENHAR A TABELA NA TELA
// =================================================
function renderizarTabelaFiados(fiados) {
    const tbody = document.getElementById('tabela-fiados-body');
    tbody.innerHTML = '';

    // se a lista estiver vazia, mostra uma mensagem de comemoração
    if (fiados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #4CAF50; font-size: 18px; font-weight: bold;">
                    Nenhum fiado pendente! Todo mundo pagou as contas! 🎉💵
                </td>
            </tr>`;
        return;
    }

    // se tiver gente devendo
    fiados.forEach(venda => {
        const linha = document.createElement('tr');
        linha.style.borderBottom = '1px solid #333';

        // aruma a data e hora padrao br
        const dataFormatada = new Date(venda.dataHora).toLocaleString('pt-BR');

        // se o cliente estiver vazio no banco, coloca um alerta
        const nomeCliente = venda.cliente && venda.cliente !== "Desconhecido" ? venda.cliente : "⚠️ Cliente Não Identificado";

        linha.innerHTML = `
            <td style="padding: 15px 10px; color: #e91e63; font-weight: bold;">#${venda.id}</td>
            <td style="padding: 15px 10px;">${dataFormatada}</td>
            <td style="padding: 15px 10px; font-weight: bold; color: #ff9900;">👤 ${nomeCliente}</td>
            <td style="padding: 15px 10px; font-weight: bold; font-size: 16px; color: white;">
                R$ ${venda.valorTotal.toFixed(2).replace('.', ',')}
            </td>
            <td style="padding: 15px 10px;">
                <select id="pagamento-${venda.id}" style="padding: 8px; border-radius: 4px; background: #222; color: white; border: 1px solid #444; outline: none;">
                    <option value="Dinheiro">💵 Dinheiro</option>
                    <option value="Pix">💠 Pix</option>
                    <option value="Cartao">💳 Cartão</option>
                </select>
            </td>
            <td style="padding: 15px 10px;">
                <button onclick="quitarDivida(${venda.id})" style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.3s;">
                    ✅ Quitar Dívida
                </button>
            </td>
        `;
        tbody.appendChild(linha);
    });
}

// =================================================
// 3. BOTÃO DE QUITAR A DÍVIDA (A MÁGICA)
// =================================================
async function quitarDivida(idVenda) {
    // descobre o que foi selecionado como forma de pagamento
    const formaEscolhida = document.getElementById(`pagamento-${idVenda}`).value;

    // pergunta de segurança para não clicar sem querer
    if (confirm(`Tem certeza que deseja quitar a #${idVenda} recebendo em ${formaEscolhida}`)) {

        // empacota a forma de pagamento para mandar pro java
        const dados = new URLSearchParams();
        dados.append('formaPagamento', formaEscolhida);

        try {
            // bate na porta do java dizendo que a divida foi paga
            const resposta = await fetch(`${API_URL}/api/fiados/${idVenda}/pagar`, {
                method: 'PUT',
                body: dados
            });

            if (resposta.ok) {
                alert("✅ Dívida quitada com sucesso! O dinheiro já caiu no Caixa e a venda foi pro Histórico!");
                carregarFiados();
            } else {
                alert("erro ao tentar quitar a divida no servidor.");
            }
        } catch (erro) {
            console.error("Erro de conexão ao quitar divida", erro);
            alert("Erro de conexão. O java está rodando?");
        }
    }
}

carregarFiados();
// =================================================
// Função para buscar todos os produtos e desenhar a tabela
// =================================================
async function carregarTodosProdutos() {
    try {
        const resposta = await fetch('http://localhost:8080/api/estoque/produtos');

        if (resposta.ok) {
            const produtos = await resposta.json();
            const tbody = document.getElementById('tabela-estoque-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // passa por cada produto que veio do banco e desenha a linha
            produtos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #333'; // Adiciona borda inferior

                // usabdo o toFixed(2) para deixar o dinheiro certinho
                linha.innerHTML = `
                    <td style="padding: 12px 10px; color: #ff9900; font-weight: bold;">00${produto.id}</td>
                    <td style="padding: 12px 10px;">${produto.codigoBarras}</td>
                    <td style="padding: 12px 10px;"><strong>${produto.nome}</strong> <br><small style="color: #aaa;">${produto.sabor} | ${produto.tamanhoPeso}</small></td>
                    <td style="padding: 12px 10px;">${produto.categoria}</td>
                    <td style="padding: 12px 10px;">R$ ${produto.precoCusto.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 12px 10px;">R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 12px 10px; text-align: center;">
                        <button title="Editar" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                        <button title="Excluir" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️</button>
                    </td>
                `;

                // adiciona a linha pronta da tabela html]
                tbody.appendChild(linha);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar os produtos: " + erro);
    }
}

// inicia a função assim que a tela abre
carregarTodosProdutos();
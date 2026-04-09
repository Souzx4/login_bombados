// =================================================
// VARIÁVEIS GLOBAIS (A Memória da Tela)
// =================================================
let produtoEditandoId = null; // Se for null, estamos CRIANDO. Se tiver número, estamos EDITANDO!
let listaDeProdutos = []; // Guarda os produtos na memória para facilitar a edição rápida

// =================================================
// Função para buscar todos os produtos e desenhar a tabela
// =================================================
async function carregarTodosProdutos() {
    try {
        const resposta = await fetch('http://localhost:8080/api/estoque/produtos');

        if (resposta.ok) {
            listaDeProdutos = await resposta.json(); // Guarda na memória global
            const tbody = document.getElementById('tabela-estoque-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // passa por cada produto que veio do banco e desenha a linha
            listaDeProdutos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #333'; // Adiciona borda inferior


                // "onclick" nos botões passando o ID do produto!
                linha.innerHTML = `
                    <td style="padding: 12px 10px; color: #ff9900; font-weight: bold;">00${produto.id}</td>
                    <td style="padding: 12px 10px;">${produto.codigoBarras}</td>
                    <td style="padding: 12px 10px;"><strong>${produto.nome}</strong> <br><small style="color: #aaa;">${produto.sabor} | ${produto.tamanhoPeso}</small></td>
                    <td style="padding: 12px 10px;">${produto.categoria}</td>
                    <td style="padding: 12px 10px;">R$ ${produto.precoCusto.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 12px 10px;">R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 12px 10px; text-align: center;">
                        <button onclick="prepararEdicao(${produto.id})" title="Editar" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                        <button onclick="excluirProduto(${produto.id}, '${produto.nome}')" title="Excluir" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️</button>
                    </td>
                `;

                // adiciona a linha pronta da tabela html
                tbody.appendChild(linha);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar os produtos: " + erro);
    }
}

// inicia a função assim que a tela abre
carregarTodosProdutos();

// =================================================
// LÓGICA DO MODAL DE CADASTRAR PRODUTO
// =================================================
const modalProduto = document.getElementById('modal-produto');
const btnAbrirModal = document.getElementById('btn-novo-produto');
const btnFecharModal = document.getElementById('fechar-modal-produto');
const formNovoProduto = document.getElementById('form-novo-produto');
const tituloModal = document.querySelector('#modal-produto h3');

// abre a janela
btnAbrirModal.addEventListener('click', () => {
    produtoEditandoId = null; // Avisa o sistema que é um cadastro NOVO
    formNovoProduto.reset(); // Limpa os campos
    if(tituloModal) tituloModal.innerText = 'Cadastrar Novo Produto'; // Muda o título
    modalProduto.style.display = 'block';
});

// fecha a janela
btnFecharModal.addEventListener('click', () => {
    modalProduto.style.display = 'none';
});

// quando clicar em salvar o produto
formNovoProduto.addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita o envio tradicional do formulário 

    // Empacota os dados digitados na tela (COM OS NOMES IGUAIS AO HTML)
    const novoProduto = {
        nome: document.getElementById('cad-nome').value,
        codigoBarras: document.getElementById('cad-codigo').value,
        categoria: document.getElementById('cad-categoria').value,
        sabor: document.getElementById('cad-sabor').value,
        tamanhoPeso: document.getElementById('cad-tamanho').value,
        precoCusto: parseFloat(document.getElementById('cad-custo').value),
        precoVenda: parseFloat(document.getElementById('cad-venda').value),
        estoqueMinimo: parseInt(document.getElementById('cad-estoque-minimo').value)
    };

    try {
        // Envia o pacote pro java (via POST)
        const resposta = await fetch('http://localhost:8080/api/produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoProduto)
        });

        if (resposta.ok) {
            alert('Produto cadastrado com sucesso!');
            modalProduto.style.display = 'none'; // fecha o modal
            formNovoProduto.reset(); // limpa os campos do formulário
            carregarTodosProdutos(); // recarrega a tabela para mostrar o novo produto  
        } else {
            alert('Erro ao cadastrar produto. Verifique os dados e tente novamente.');
        }
    } catch (erro) {
        console.error("Erro na conexão: " + erro);
        alert('Erro de conexão com o servidor. Tente novamente mais tarde.');
    }
});
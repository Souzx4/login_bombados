const API_URL = 'https://sistema-bombados-backend.onrender.com';

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
        const resposta = await fetch(`${API_URL}/api/estoque/produtos`);

        if (resposta.ok) {
            listaDeProdutos = await resposta.json(); // Guarda na memória global
            const tbody = document.getElementById('tabela-estoque-body');
            tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

            // passa por cada produto que veio do banco e desenha a linha
            listaDeProdutos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #333'; // Adiciona borda inferior

                // 🚨 LÓGICA DE ALERTA: Se o estoque for menor ou igual ao mínimo, fica vermelho!
                let corEstoque = produto.qtd_estoque <= produto.estoqueMinimo ? "#e91e63" : "#4CAF50";

                // "onclick" nos botões passando o ID do produto!
                linha.innerHTML = `
                    <td style="padding: 12px 10px; color: #ff9900; font-weight: bold;">00${produto.id}</td>
                    <td style="padding: 12px 10px;">${produto.codigoBarras}</td>
                    <td style="padding: 12px 10px;"><strong>${produto.nome}</strong> <br><small style="color: #aaa;">${produto.sabor} | ${produto.tamanhoPeso}</small></td>
                    <td style="padding: 12px 10px;">${produto.categoria}</td>
                    
                    <td style="padding: 12px 10px; font-weight: bold; color: ${corEstoque};">
                        ${produto.qtd_estoque} un.
                    </td>

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
    if (tituloModal) tituloModal.innerText = 'Cadastrar Novo Produto'; // Muda o título
    modalProduto.style.display = 'block';
});

// fecha a janela
btnFecharModal.addEventListener('click', () => {
    modalProduto.style.display = 'none';
});


// =================================================
// FUNÇÃO: PREPARAR A JANELA PARA EDIÇÃO
// =================================================
function prepararEdicao(id) {
    // acha o produto na nossa lista usando o id
    const produto = listaDeProdutos.find(p => p.id === id);

    if (produto) {
        produtoEditandoId = produto.id;
        if (tituloModal) tituloModal.innerText = `Editar Produto: ${produto.nome}`;

        // Preenche as caixinhas da tela com os dados do banco
        document.getElementById('cad-nome').value = produto.nome;
        document.getElementById('cad-codigo').value = produto.codigoBarras;
        document.getElementById('cad-categoria').value = produto.categoria;
        document.getElementById('cad-sabor').value = produto.sabor;
        document.getElementById('cad-tamanho').value = produto.tamanhoPeso;
        document.getElementById('cad-custo').value = produto.precoCusto;
        document.getElementById('cad-venda').value = produto.precoVenda;
        document.getElementById('cad-estoque-minimo').value = produto.estoqueMinimo;
        document.getElementById('cad-quantidade').value = produto.qtd_estoque;
        document.getElementById('cad-validade').value = produto.dataValidade || '';

        // abre a janela
        modalProduto.style.display = 'block';
    }
}

// =================================================
// FUNÇÃO: EXCLUIR PRODUTO
// =================================================

async function excluirProduto(id, nomeProduto) {
    // pergunta de segurança para não apagar sem querer
    if (confirm(`⚠️ Tem certeza que deseja excluir DEFINITIVAMENTE o produto:\n${nomeProduto}?`)) {
        try {
            const resposta = await fetch(`${API_URL}/api/produtos/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert('Produto excluido com sucesso!');
                carregarTodosProdutos();
            } else {
                alert('Erro ao excluir o produto, tente novamente.');
            }
        } catch (erro) {
            alert('Erro de conexão com o servidor.');
        }
    }
}

// =================================================
// SALVAR O PRODUTO (Decide se vai CRIAR ou ATUALIZAR)
// =================================================
formNovoProduto.addEventListener('submit', async function (event) {
    event.preventDefault(); // evita o envio tradicional do formulario

    // pega a data e verifica se eles não esqueceram
    const dataDigitada = document.getElementById('cad-validade').value;
    if (!dataDigitada) {
        alert("⚠️ Atenção! A Data de Validade é obrigatória para salvar o produto!");
        return;
    }

    // empacota os dados digitados na tela
    const dadosProduto = {
        nome: document.getElementById('cad-nome').value,
        codigoBarras: document.getElementById('cad-codigo').value,
        categoria: document.getElementById('cad-categoria').value,
        sabor: document.getElementById('cad-sabor').value,
        tamanhoPeso: document.getElementById('cad-tamanho').value,
        precoCusto: document.getElementById('cad-custo').value,
        precoVenda: document.getElementById('cad-venda').value,
        estoqueMinimo: document.getElementById('cad-estoque-minimo').value,
        qtd_estoque: document.getElementById('cad-quantidade').value,
        dataValidade: dataDigitada
    };

    try {
        let url = `${API_URL}/api/produtos`;
        let metodoHTTP = 'POST'; // cadastrar (novo)

        // se o produtoEditandoId não for null, significa que é uma edição!
        if (produtoEditandoId !== null) {
            url = `${API_URL}/api/produtos/${produtoEditandoId}`;
            metodoHTTP = 'PUT'; // atualiza o editar
        }

        // envia o pacote para o java
        const resposta = await fetch(url, {
            method: metodoHTTP,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosProduto)
        });

        if (resposta.ok) {
            // mostra o alerta certo dependendo do que ele fez
            alert(produtoEditandoId === null ? 'Produto cadastrado com sucesso!' : 'Produto atualizado com sucesso!');

            modalProduto.style.display = 'none'; // fecha o modal
            formNovoProduto.reset(); // limpa os campos do formulario
            carregarTodosProdutos(); // recarrega a tabela para mostar o resultado
        } else {
            alert('Erro ao salvar produto, verifique os dados e tente novamente.');
        }
    } catch (erro) {
        console.error("Erro na conexão: " + erro);
        alert('Erro de conexão com o servidor, tente novamente mais tarde.');
    }
});


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

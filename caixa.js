// Pega o campo onde a pessoa digita o ID (ou bipa o leitor)
const inputCodigo = document.getElementById('codigoBarras');
const tbodyItens = document.getElementById('tabela-itens-body');
const displayTotal = document.getElementById('valor-total');

// Variáveis para controlar a venda
let totalCompra = 0.0;
let contadorItens = 0;
let carrinho = []; // A nossa lista vazia no começo
let formaPagamentoAtual = 'Dinheiro'; // valor padrão, pode ser alterado pelos botões de pagamento

// ==========================================
// 1. ESCUTAR O LEITOR DE CÓDIGO DE BARRAS
// ==========================================
inputCodigo.addEventListener('keypress', async function (event) {

    // Verifica se a tecla apertada foi o "Enter" ou bipou
    if (event.key === 'Enter') {
        event.preventDefault(); // impede a tela de recarregar

        const idDigitado = inputCodigo.value.trim();

        if (idDigitado === "") return; // se o campo estiver vazio, não faz nada

        try {
            // Vai na porta 8080 perguntar pro Java quem é esse produto
            const resposta = await fetch('http://localhost:8080/api/produtos/' + idDigitado);

            if (resposta.ok) {
                // Recebe o JSON e transforma em um objeto que o JavaScript entende
                const produto = await resposta.json();

                contadorItens++; // aumenta o numero de itens na lista
                const quantidadeBipada = 1; // por padrao, cada bip é uma unidade
                const subtotal = produto.precoVenda * quantidadeBipada; // calcula o subtotal desse item

                // =========================================================
                // Adiciona o produto na nossa lista de compras na hora do bip!
                carrinho.push({
                    idProduto: produto.id,
                    quantidade: quantidadeBipada,
                    subtotal: subtotal
                });
                // =========================================================

                // soma no valor total da compra
                totalCompra += subtotal;

                // Cria uma linha nova <tr> para a tabela HTML
                const novaLinha = document.createElement('tr');

                // Desenha as colunas <td> com os dados que vieram do banco de dados
                novaLinha.innerHTML = `
                    <td>00${contadorItens}</td>
                    <td>${produto.nome}</td>
                    <td>${quantidadeBipada}</td>
                    <td>R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                `;

                // Injeta a linha criada dentro da tabela na tela
                tbodyItens.appendChild(novaLinha);

                // atualiza o valor na tela
                displayTotal.innerText = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;

                // limpa o campo do codigo para o proximo bip
                inputCodigo.value = '';

            } else {
                alert('Produto não encontrado! Verifique o código digitado ou bipa novamente.');
                inputCodigo.value = ''; // limpa o campo para ela tentar de novo
            }

        } catch (erro) {
            console.error(erro);
            alert('Erro ao conectar com o servidor. Verifique se o backend está rodando e tente novamente.');
        }
    }
});


// ==========================================
// 2. FINALIZAR COMPRA
// ==========================================
const btnFinalizar = document.querySelector('.btn-finalizar');

btnFinalizar.addEventListener('click', async function () {

    // 1. verifica se tem algo no carrinho
    if (totalCompra === 0) {
        alert('O carrinho está vazio! coloque um produto antes de finalizar.')
        return;
    }

    // 2. empacotando os dados da venda 
    const dadosVenda = new URLSearchParams();
    dadosVenda.append('total', totalCompra);
    dadosVenda.append('formaPagamento', formaPagamentoAtual);

    // Transforma o nosso carrinho em um texto e manda pro Java!
    dadosVenda.append('itens', JSON.stringify(carrinho));

    try {
        // 3. manda para a rota do java
        const resposta = await fetch('http://localhost:8080/api/vendas', {
            method: 'POST',
            body: dadosVenda
        });

        if (resposta.ok) {
            // Se deu ok, só avisa e recarrega!
            alert('Compra finalizada com sucesso!');
            window.location.reload();
        } else {
            alert('Erro ao finalizar a compra no Servidor.');
        }
    } catch (erro) {
        alert('Erro de conexão com o servidor (O Java parou de rodar?).');
    }
});

// ==========================================
// 3. ESCOLHER FORMA DE PAGAMENTO
// ==========================================

// Função para mudar o tipo de pagamento e avisar a Lauanda na tela
function selecionarPagamento(tipo, nomeExibicao) {
    formaPagamentoAtual = tipo;
    btnFinalizar.innerText = `Finalizar ${nomeExibicao}`;
    // Um efeitinho visual rápido para ela saber que clicou:
    console.log("Pagamento alterado para " + tipo);
}

// Escuta os cliques do mouse nos botões
document.getElementById('btn-dinheiro').addEventListener('click', () => selecionarPagamento('Dinheiro', 'DINHEIRO'));
document.getElementById('btn-cartao').addEventListener('click', () => selecionarPagamento('Cartao', 'CARTÃO'));
document.getElementById('btn-pix').addEventListener('click', () => selecionarPagamento('Pix', 'PIX'));
document.getElementById('btn-fiado').addEventListener('click', () => selecionarPagamento('Fiado', 'FIADO'));

// escuta as teclas f3, f4, f5 e f6 do teclado (agilidade maxima)
document.addEventListener('keydown', function (event) {
    if (event.key === 'F3') {
        event.preventDefault();
        selecionarPagamento('Dinheiro', 'DINHEIRO');
    } else if (event.key === 'F4') {
        event.preventDefault();
        selecionarPagamento('Cartao', 'CARTAO');
    } else if (event.key === 'F5') {
        event.preventDefault();
        selecionarPagamento('Pix', 'PIX');
    } else if (event.key === 'F6') {
        event.preventDefault();
        selecionarPagamento('Fiado', 'FIADO');
    }
});

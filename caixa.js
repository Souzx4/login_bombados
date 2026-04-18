const API_URL = 'https://sistema-bombados-backend.onrender.com';

// ==========================================
// IDENTIFICAÇÃO DO OPERADOR (LOCALSTORAGE)
// ==========================================
let operadorString = localStorage.getItem('usuarioLogado');
// Avisa o sistema que a tela do caixa foi aberta e está operando!
localStorage.setItem('caixa_lauanda_status', 'ABERTO');
let nomeOperador = 'Lauanda'; // Nome Padrão se der erro
let idOperador = 2; // ID da Lauanda

if (operadorString) {
    try {
        // Tenta ver se é um JSON perfeito
        let dadosUsuario = JSON.parse(operadorString);
        if (dadosUsuario.nome) nomeOperador = dadosUsuario.nome;
        if (dadosUsuario.id) idOperador = dadosUsuario.id;
    } catch (erro) {
        // Caiu aqui porque a tela de Login salvou apenas um texto (ex: email ou nome solto)
        let textoSalvo = operadorString.toLowerCase().trim();

        // O TRADUTOR DE CRACHÁS:
        if (textoSalvo.includes('lauanda')) {
            nomeOperador = 'Lauanda';
            idOperador = 2;
        } else if (textoSalvo.includes('junior')) {
            nomeOperador = 'Junior';
            idOperador = 1;
        } else if (textoSalvo.includes('gilmar') || textoSalvo === 'gilmarsousa717@gmail.com') {
            nomeOperador = 'Gilmar (Admin)';
            idOperador = 3; // O seu ID que tá lá no banco de dados!
        } else {
            // Se for alguém totalmente desconhecido, mostra o que tá na memória e joga pro ID 1
            nomeOperador = operadorString;
            idOperador = 1;
        }
    }
}
// Atualiza na tela do caixa!
document.getElementById('nome-operador').innerText = nomeOperador;

// Pega o campo onde a pessoa digita o ID (ou bipa o leitor)
const inputCodigo = document.getElementById('codigoBarras');
const tbodyItens = document.getElementById('tabela-itens-body');
const displayTotal = document.getElementById('valor-total');

// Variáveis para controlar a venda
let totalCompra = 0.0;
let contadorItens = 0;
let carrinho = [];
let formaPagamentoAtual = 'Dinheiro';

// ==========================================
// 1. ESCUTAR O LEITOR DE CÓDIGO DE BARRAS
// ==========================================
inputCodigo.addEventListener('keypress', async function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const idDigitadoBruto = inputCodigo.value.trim();
        const idDigitado = idDigitadoBruto.replace(/[^0-9]/g, '');

        if (idDigitado === "") return;

        try {

            let urlServidor = '';

            // se tiver 4 numeros ou mais e js sabe que é codigo de barra
            if (idDigitado.length >= 4) {
                urlServidor = `${API_URL}/api/produtos/barras/` + idDigitado;
            } else {
                //se for um numero ex 5 ele busca pelo id normal
                urlServidor = `${API_URL}/api/produtos/` + idDigitado;
            }


            const resposta = await fetch(urlServidor);

            if (resposta.ok) {
                const produto = await resposta.json();

                let qtdJaNoCarrinho = 0;

                carrinho.forEach(item => {
                    if (item.idProduto === produto.id) {
                        qtdJaNoCarrinho += item.quantidade;
                    }
                });

                // trava de segurança
                if (produto.qtd_estoque <= 0 || (qtdJaNoCarrinho + 1) > produto.qtd_estoque) {
                    alert(`⚠️ Estoque Insuficiente!\nVocê está tentando adicionar "${produto.nome}", mas só existem ${produto.qtd_estoque} un. disponíveis no estoque!`);
                    inputCodigo.value = '';
                    return;
                }

                contadorItens++;
                const quantidadeBipada = 1;
                const subtotal = produto.precoVenda * quantidadeBipada;

                carrinho.push({
                    idProduto: produto.id,
                    quantidade: quantidadeBipada,
                    subtotal: subtotal
                });

                totalCompra += subtotal;

                const novaLinha = document.createElement('tr');
                novaLinha.innerHTML = `
                    <td>00${contadorItens}</td>
                    <td>${produto.nome}</td>
                    <td>${quantidadeBipada}</td>
                    <td>R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                `;

                tbodyItens.appendChild(novaLinha);
                displayTotal.innerText = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;
                inputCodigo.value = '';

            } else {
                alert('Produto não encontrado! Verifique o código digitado ou bipa novamente.');
                inputCodigo.value = '';
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

    if (totalCompra === 0) {
        alert('O carrinho está vazio! coloque um produto antes de finalizar.')
        return;
    }

    const nomeCliente = document.getElementById('nome-cliente').value.trim();

    // Empacotando os dados da venda 
    const dadosVenda = new URLSearchParams();
    dadosVenda.append('total', totalCompra);
    dadosVenda.append('formaPagamento', formaPagamentoAtual);
    dadosVenda.append('cliente', nomeCliente);

    // 🐛 CORREÇÃO 1: Mandando o ID exato de quem fez a venda!
    dadosVenda.append('usuarioId', idOperador);

    // 🐛 CORREÇÃO 2: Distribuindo o dinheiro. Se for "Fiado", tudo fica ZERO!
    let valorPix = 0;
    let valorCartao = 0;
    let valorDinheiro = 0;

    if (formaPagamentoAtual === 'Pix') valorPix = totalCompra;
    else if (formaPagamentoAtual === 'Cartao') valorCartao = totalCompra;
    else if (formaPagamentoAtual === 'Dinheiro') valorDinheiro = totalCompra;

    // Mandamos as gavetas separadas pro Java não se confundir
    dadosVenda.append('valorPix', valorPix);
    dadosVenda.append('valorCartao', valorCartao);
    dadosVenda.append('valorDinheiro', valorDinheiro);

    dadosVenda.append('itens', JSON.stringify(carrinho));

    try {
        const resposta = await fetch(`${API_URL}/api/vendas`, {
            method: 'POST',
            body: dadosVenda
        });

        if (resposta.ok) {
            alert('Compra finalizada com sucesso!');
            document.getElementById('nome-cliente').value = '';
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
function selecionarPagamento(tipo, nomeExibicao) {
    formaPagamentoAtual = tipo;
    btnFinalizar.innerText = `Finalizar no ${nomeExibicao}`;
    console.log("Pagamento alterado para " + tipo);
}

document.getElementById('btn-dinheiro').addEventListener('click', () => selecionarPagamento('Dinheiro', 'DINHEIRO'));
document.getElementById('btn-cartao').addEventListener('click', () => selecionarPagamento('Cartao', 'CARTÃO'));
document.getElementById('btn-pix').addEventListener('click', () => selecionarPagamento('Pix', 'PIX'));
document.getElementById('btn-fiado').addEventListener('click', () => selecionarPagamento('Fiado', 'FIADO'));

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

// ==========================================
// 4. JANELA DE PESQUISA DE PRODUTOS (F2)
// ==========================================
const modalPesquisa = document.getElementById('modal-pesquisa');
const inputPesquisaNome = document.getElementById('input-pesquisa-nome');
const btnFecharModal = document.getElementById('fechar-modal');

document.addEventListener('keydown', function (event) {
    if (event.key === 'F2') {
        event.preventDefault();
        modalPesquisa.style.display = 'block';
        inputPesquisaNome.focus();
    }
    if (event.key === 'Escape') {
        if (modalPesquisa.style.display === 'block') {
            modalPesquisa.style.display = 'none';
            inputPesquisaNome.value = '';
            inputCodigo.focus();
        } else {
            cancelarCompra();
        }
    }
});

btnFecharModal.addEventListener('click', function () {
    modalPesquisa.style.display = 'none';
    inputPesquisaNome.value = '';
    inputCodigo.focus();
});

const tbodyPesquisa = document.getElementById('resultado-pesquisa-body');

inputPesquisaNome.addEventListener('input', async function () {
    const termo = inputPesquisaNome.value.trim();

    if (termo.length === 0) {
        tbodyPesquisa.innerHTML = '';
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/api/produtos/pesquisa/nome?nome=${termo}`);

        if (resposta.ok) {
            const produtos = await resposta.json();
            tbodyPesquisa.innerHTML = '';

            produtos.forEach(produto => {
                const linha = document.createElement('tr');

                let textoEstoque = "";
                let corEstoque = "";
                let podeVender = true;

                if (produto.qtd_estoque > 0) {
                    textoEstoque = `✅ ${produto.qtd_estoque} un.`;
                    corEstoque = "#4caf50"
                } else {
                    textoEstoque = `❌ Esgotado`;
                    corEstoque = "#e91e63";
                    podeVender = false;
                }

                linha.onclick = function () {
                    if (podeVender) {
                        adicionarProdutoNoCaixa(produto);
                    } else {
                        alert(`⚠️ Este produto está esgotado e não pode ser vendido!`);
                    }
                };

                // muda a setinha caso esteja bloqueado
                linha.style.cursor = podeVender ? 'pointer' : 'not-allowed';

                linha.innerHTML = `
                    <td style="padding: 10px;">00${produto.id}</td>
                    <td style="padding: 10px;"><strong>${produto.nome}</strong></td>
                    <td style="padding: 10px; color: ${corEstoque}; font-weight: bold;">${textoEstoque}</td>
                    <td style="padding: 10px;">R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
                `;
                tbodyPesquisa.appendChild(linha);
            });
        }
    } catch (erro) {
        console.error("Erro na pesquisa: ", erro);
    }
});

function adicionarProdutoNoCaixa(produto) {
    modalPesquisa.style.display = 'none';
    inputPesquisaNome.value = '';
    tbodyPesquisa.innerHTML = '';

    contadorItens++;
    const quantidadeBipada = 1;
    const subtotal = produto.precoVenda * quantidadeBipada;

    carrinho.push({
        idProduto: produto.id,
        quantidade: quantidadeBipada,
        subtotal: subtotal
    });

    totalCompra += subtotal;

    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>00${contadorItens}</td>
        <td>${produto.nome}</td>
        <td>${quantidadeBipada}</td>
        <td>R$ ${produto.precoVenda.toFixed(2).replace('.', ',')}</td>
        <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
    `;
    tbodyItens.appendChild(novaLinha);
    displayTotal.innerText = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;

    inputCodigo.focus();
}

// ==========================================
// 5. FUNÇÃO PARA CANCELAR A COMPRA
// ==========================================
function cancelarCompra() {
    if (totalCompra === 0) return;

    if (confirm('⚠️ Tem certeza que deseja cancelar esta compra e limpar a tela?')) {
        carrinho = [];
        totalCompra = 0.0;
        contadorItens = 0;
        tbodyItens.innerHTML = '';
        displayTotal.innerText = 'R$ 0,00';

        const campoCliente = document.getElementById('nome-cliente');
        if (campoCliente) {
            campoCliente.value = '';
        }

        selecionarPagamento('Dinheiro', 'DINHEIRO');
        inputCodigo.focus();
    }
}

document.getElementById('botao-cancelar').addEventListener('click', cancelarCompra);
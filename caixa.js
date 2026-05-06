const API_URL = 'https://sistema-bombados-backend.onrender.com';

// ==========================================
// IDENTIFICAÇÃO DO OPERADOR (LOCALSTORAGE)
// ==========================================
let operadorString = sessionStorage.getItem('usuarioLogado');
localStorage.setItem('caixa_status', 'ABERTO');
let nomeOperador = 'Desconhecido';
let idOperador = 1;

if (operadorString) {
    try {
        let dadosUsuario = JSON.parse(operadorString);
        if (dadosUsuario.nome) nomeOperador = dadosUsuario.nome;
        if (dadosUsuario.id) idOperador = dadosUsuario.id;
    } catch (erro) {
        let textoSalvo = operadorString.toLowerCase().trim();
        if (textoSalvo.includes('lauanda')) {
            nomeOperador = 'Lauanda';
            idOperador = 2;
        } else if (textoSalvo.includes('junior')) {
            nomeOperador = 'Junior';
            idOperador = 1;
        } else if (textoSalvo.includes('gilmar') || textoSalvo === 'gilmarsousa717@gmail.com') {
            nomeOperador = 'Gilmar (Admin)';
            idOperador = 3;
        } else {
            nomeOperador = operadorString;
            idOperador = 1;
        }
    }
}
document.getElementById('nome-operador').innerText = nomeOperador;
localStorage.setItem('caixa_operador', nomeOperador);

// ==========================================
// ELEMENTOS DA TELA
// ==========================================
const inputCodigo = document.getElementById('codigoBarras');
const tbodyItens = document.getElementById('tabela-itens-body');
const displaySubtotal = document.getElementById('valor-subtotal');
const displayTotal = document.getElementById('valor-total');
const statusTroco = document.getElementById('status-troco');

const inputDesconto = document.getElementById('input-desconto');
const inputDinheiro = document.getElementById('input-dinheiro');
const inputCartao = document.getElementById('input-cartao');
const inputPix = document.getElementById('input-pix');
const inputFiado = document.getElementById('input-fiado');

let totalCompra = 0.0;
let contadorItens = 0;
let carrinho = [];

// ==========================================
// MATEMÁTICA EM TEMPO REAL (MISTO E DESCONTO)
// ==========================================
function atualizarValoresDaTela() {
    let desconto = parseFloat(inputDesconto.value) || 0;

    // O total que o cliente realmente vai pagar
    let totalComDesconto = totalCompra - desconto;
    if (totalComDesconto < 0) totalComDesconto = 0;

    // Atualiza os letreiros grandes
    displaySubtotal.innerText = `R$ ${totalCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    displayTotal.innerText = `R$ ${totalComDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Pega o que o operador digitou nas gavetas
    let valDinheiro = parseFloat(inputDinheiro.value) || 0;
    let valCartao = parseFloat(inputCartao.value) || 0;
    let valPix = parseFloat(inputPix.value) || 0;
    let valFiado = parseFloat(inputFiado.value) || 0;

    let totalPago = valDinheiro + valCartao + valPix + valFiado;
    let diferenca = totalPago - totalComDesconto;

    if (totalCompra === 0) {
        statusTroco.innerText = "Caixa Livre";
        statusTroco.style.color = "#aaa";
    } else if (diferenca < 0) {
        statusTroco.innerText = `Falta: R$ ${Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        statusTroco.style.color = "#ff4444"; // Vermelho
    } else if (diferenca > 0) {
        statusTroco.innerText = `Troco: R$ ${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        statusTroco.style.color = "#4CAF50"; // Verde
    } else {
        statusTroco.innerText = "Conta Exata!";
        statusTroco.style.color = "#2196F3"; // Azul
    }
}

// Coloca "espiões" em todas as caixinhas. Se digitar, recalcula na hora!
[inputDesconto, inputDinheiro, inputCartao, inputPix, inputFiado].forEach(input => {
    input.addEventListener('input', atualizarValoresDaTela);
});

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
            let urlServidor = idDigitado.length >= 4
                ? `${API_URL}/api/produtos/barras/${idDigitado}`
                : `${API_URL}/api/produtos/${idDigitado}`;

            const resposta = await fetch(urlServidor);

            if (resposta.ok) {
                const produto = await resposta.json();
                let qtdJaNoCarrinho = carrinho.filter(i => i.idProduto === produto.id).reduce((acc, i) => acc + i.quantidade, 0);

                if (produto.qtd_estoque <= 0 || (qtdJaNoCarrinho + 1) > produto.qtd_estoque) {
                    alert(`⚠️ Estoque Insuficiente!\nVocê está tentando adicionar "${produto.nome}", mas só existem ${produto.qtd_estoque} un. disponíveis no estoque!`);
                    inputCodigo.value = '';
                    return;
                }

                contadorItens++;
                const subtotal = produto.precoVenda * 1;

                carrinho.push({
                    idProduto: produto.id,
                    quantidade: 1,
                    subtotal: subtotal,
                    categoriaProduto: produto.categoria
                });

                totalCompra += subtotal;

                const novaLinha = document.createElement('tr');
                novaLinha.innerHTML = `
                    <td>00${contadorItens}</td>
                    <td>${produto.nome}</td>
                    <td>1</td>
                    <td>R$ ${produto.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                `;

                tbodyItens.appendChild(novaLinha);
                atualizarValoresDaTela(); // <--- CHAMA O RECALCULO
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
const btnFinalizar = document.getElementById('btn-finalizar');

btnFinalizar.addEventListener('click', async function () {
    if (totalCompra === 0) {
        alert('O carrinho está vazio! coloque um produto antes de finalizar.');
        return;
    }

    let desconto = parseFloat(inputDesconto.value) || 0;
    let totalComDesconto = totalCompra - desconto;

    let valDinheiro = parseFloat(inputDinheiro.value) || 0;
    let valCartao = parseFloat(inputCartao.value) || 0;
    let valPix = parseFloat(inputPix.value) || 0;
    let valFiado = parseFloat(inputFiado.value) || 0;

    let totalPago = valDinheiro + valCartao + valPix + valFiado;

    // TRAVA: O operador não pode finalizar se estiver faltando dinheiro!
    if (totalPago < totalComDesconto) {
        alert('⚠️ ATENÇÃO: Está faltando dinheiro para fechar a conta!');
        return;
    }

    // Se o cliente deu dinheiro a mais (troco), não podemos salvar esse troco como faturamento!
    let troco = totalPago - totalComDesconto;
    if (troco > 0 && valDinheiro >= troco) {
        valDinheiro -= troco; // Tira o troco do dinheiro que vai pro banco
    }

    // Descobrir o nome da forma de pagamento (Para o Histórico)
    let formaFinal = "Misto";
    if (valDinheiro > 0 && valCartao === 0 && valPix === 0 && valFiado === 0) formaFinal = "Dinheiro";
    else if (valCartao > 0 && valDinheiro === 0 && valPix === 0 && valFiado === 0) formaFinal = "Cartao";
    else if (valPix > 0 && valDinheiro === 0 && valCartao === 0 && valFiado === 0) formaFinal = "Pix";
    else if (valFiado > 0 && valDinheiro === 0 && valCartao === 0 && valPix === 0) formaFinal = "Fiado";

    const nomeCliente = document.getElementById('nome-cliente').value.trim();

    const dadosVenda = new URLSearchParams();
    dadosVenda.append('total', totalComDesconto);
    dadosVenda.append('formaPagamento', formaFinal);
    dadosVenda.append('cliente', nomeCliente);
    dadosVenda.append('usuarioId', idOperador);

    // Mandando as gavetas prontas e calculadas pro Java!
    dadosVenda.append('valorPix', valPix);
    dadosVenda.append('valorCartao', valCartao);
    dadosVenda.append('valorDinheiro', valDinheiro);
    dadosVenda.append('itens', JSON.stringify(carrinho));

    try {
        const resposta = await fetch(`${API_URL}/api/vendas`, {
            method: 'POST',
            body: dadosVenda
        });

        if (resposta.ok) {
            alert('✅ Compra finalizada com sucesso!');
            window.location.reload();
        } else {
            alert('Erro ao finalizar a compra no Servidor.');
        }
    } catch (erro) {
        alert('Erro de conexão com o servidor (O Java parou de rodar?).');
    }
});

// ==========================================
// 3. ATALHOS DO TECLADO (F2 a F6)
// ==========================================
document.addEventListener('keydown', function (event) {
    if (event.key === 'F3') {
        event.preventDefault(); inputDinheiro.focus(); inputDinheiro.select();
    } else if (event.key === 'F4') {
        event.preventDefault(); inputCartao.focus(); inputCartao.select();
    } else if (event.key === 'F5') {
        event.preventDefault(); inputPix.focus(); inputPix.select();
    } else if (event.key === 'F6') {
        event.preventDefault(); inputFiado.focus(); inputFiado.select();
    }
});

// ==========================================
// 4. JANELA DE PESQUISA DE PRODUTOS (F2)
// ==========================================
const modalPesquisa = document.getElementById('modal-pesquisa');
const inputPesquisaNome = document.getElementById('input-pesquisa-nome');
const btnFecharModal = document.getElementById('fechar-modal');
const tbodyPesquisa = document.getElementById('resultado-pesquisa-body');

const btnPesquisaMobile = document.getElementById('btn-pesquisa-mobile');
if (btnPesquisaMobile) {
    btnPesquisaMobile.addEventListener('click', function () {
        modalPesquisa.style.display = 'block';
        inputPesquisaNome.focus();
    });
}

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

inputPesquisaNome.addEventListener('input', async function () {
    const termo = inputPesquisaNome.value.trim();
    if (termo.length === 0) { tbodyPesquisa.innerHTML = ''; return; }

    try {
        const resposta = await fetch(`${API_URL}/api/produtos/pesquisa/nome?nome=${termo}`);
        if (resposta.ok) {
            const produtos = await resposta.json();
            tbodyPesquisa.innerHTML = '';
            produtos.forEach(produto => {
                const linha = document.createElement('tr');
                let podeVender = produto.qtd_estoque > 0;
                let textoEstoque = podeVender ? `✅ ${produto.qtd_estoque} un.` : `❌ Esgotado`;
                let corEstoque = podeVender ? "#4caf50" : "#e91e63";

                linha.style.cursor = podeVender ? 'pointer' : 'not-allowed';
                linha.onclick = function () {
                    if (podeVender) adicionarProdutoNoCaixa(produto);
                    else alert(`⚠️ Este produto está esgotado e não pode ser vendido!`);
                };

                linha.innerHTML = `
                    <td style="padding: 10px;">00${produto.id}</td>
                    <td style="padding: 10px;"><strong>${produto.nome}</strong></td>
                    <td style="padding: 10px; color: ${corEstoque}; font-weight: bold;">${textoEstoque}</td>
                    <td style="padding: 10px;">R$ ${produto.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                `;
                tbodyPesquisa.appendChild(linha);
            });
        }
    } catch (erro) { console.error("Erro na pesquisa: ", erro); }
});

function adicionarProdutoNoCaixa(produto) {
    let qtdJaNoCarrinho = carrinho.filter(i => i.idProduto === produto.id).reduce((acc, i) => acc + i.quantidade, 0);
    if (produto.qtd_estoque <= 0 || (qtdJaNoCarrinho + 1) > produto.qtd_estoque) {
        alert(`⚠️ Estoque Insuficiente!\nVocê está tentando adicionar "${produto.nome}", mas só existem ${produto.qtd_estoque} un. disponíveis no estoque!`);
        return;
    }

    modalPesquisa.style.display = 'none';
    inputPesquisaNome.value = '';
    tbodyPesquisa.innerHTML = '';

    contadorItens++;
    const subtotal = produto.precoVenda * 1;

    carrinho.push({ idProduto: produto.id, quantidade: 1, subtotal: subtotal, categoriaProduto: produto.categoria });
    totalCompra += subtotal;

    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>00${contadorItens}</td>
        <td>${produto.nome}</td>
        <td>1</td>
        <td>R$ ${produto.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
    `;
    tbodyItens.appendChild(novaLinha);
    atualizarValoresDaTela(); // <--- CHAMA O RECALCULO
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
        inputDesconto.value = '';
        inputDinheiro.value = '';
        inputCartao.value = '';
        inputPix.value = '';
        inputFiado.value = '';
        document.getElementById('nome-cliente').value = '';
        atualizarValoresDaTela();
        inputCodigo.focus();
    }
}

document.getElementById('botao-cancelar').addEventListener('click', cancelarCompra);
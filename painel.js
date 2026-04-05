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

// Manda o código rodar assim que o chefe abrir a tela!
carregarFaturamento();
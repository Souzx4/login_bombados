const API_URL = 'https://sistema-bombados-backend.onrender.com';

async function calcularFechamento() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;

    // Trava de segurança para o Junior não esquecer as datas
    if (!dataInicio || !dataFim) {
        alert("Por favor, selecione as datas de Início e Fim!");
        return;
    }

    try {
        // Bate na porta do Java pedindo a folha de pagamento
        const resposta = await fetch(`${API_URL}/api/rh/comissoes?inicio=${dataInicio}&fim=${dataFim}`);

        if (resposta.ok) {
            const folha = await resposta.json();
            const tbody = document.getElementById('tabela-rh-body');
            tbody.innerHTML = '';

            // Se ninguém vendeu nada
            if (folha.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #e91e63;">Nenhuma venda registrada neste período.</td></tr>`;
                return;
            }

            // Desenha o contracheque de cada vendedor
            folha.forEach(linha => {
                // Lógica de cores do troféu (Ouro, Prata, Bronze ou Vermelho)
                let corMeta = linha.metaAtingida === 3 ? "#FFD700" : (linha.metaAtingida === 2 ? "#C0C0C0" : (linha.metaAtingida === 1 ? "#CD7F32" : "#e91e63"));

                let textoMeta = linha.metaAtingida > 0 ? `${linha.metaAtingida}%` : "0% (Não bateu a meta mínima)";

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 16px;">👤 ${linha.vendedor}</td>
                        <td style="padding: 15px 10px;">R$ ${linha.totalVendido.toFixed(2).replace('.', ',')}</td>
                        <td style="padding: 15px 10px; font-weight: bold; color: ${corMeta};">${textoMeta}</td>
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; color: #4CAF50;">R$ ${linha.comissaoFinal.toFixed(2).replace('.', ',')}</td>
                    </tr>
                `;
            });
        }
    } catch (erro) {
        alert("Erro ao conectar no Servidor. O Java parou?");
    }
}
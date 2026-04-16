async function calcularfechamento() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;

    try {
        const resposta = await fetch(`http://localhost:8080/api/rh/comissoes?inicio=${dataInicio}&fim=${dataFim}`);
        if(resposta.ok){
            const folha = await resposta.json();
            const tbody = document.getElementById('tabela-rh-body');
            tbody.innerHTML = '';

            if(folha.length === 0){
                tbody.innerHTML = `<tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #e91e63;">Nenhuma venda registrada neste período.</td></tr>`;
                return;
            }

            folha.forEach(linha => {
                let corMeta = linha.metaAtingida === 3 ? "#ffd700" : (linha.metaAtingida === 2 ? "#c0c0c0" : (linha.metaAtingida === 1 ? "#cd7f32" : "#e91e63"));
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
    } catch (erro){
        alert("Erro ao conectar no servidor,");
    }
}
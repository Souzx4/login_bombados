// 1. Crie esta variável logo no topo, assim o endereço fica guardado!
const API_URL = 'https://sistema-bombados-backend.onrender.com';

document.getElementById('login-form').addEventListener('submit', async function (event) {

    // impede que a pagina seja recarregada e colocada o ponto de interrogação
    event.preventDefault();

    // pega os valores que as pessoas digitaram nos campos
    const usuarioDigitado = document.getElementById('usuario').value;
    const senhaDigitada = document.getElementById('senha').value;

    // empacota tudo para enviar para o servidor
    const dados = new URLSearchParams();
    dados.append('usuario', usuarioDigitado);
    dados.append('senha', senhaDigitada);

    try {
        const resposta = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            body: dados
        });

        // analisa a resposta do java
        if (resposta.ok) {

            const dadosUsuario = await resposta.json();
            const nivelFormatado = dadosUsuario.nivel.trim().toUpperCase();

            sessionStorage.setItem('usuarioLogado', JSON.stringify({
                id: dadosUsuario.id,
                nome: dadosUsuario.nome,
                nivel: nivelFormatado
            }));

            // redireciona para a página certa dependendo do nível do usuário
            if (nivelFormatado === 'ADMIN') {
                window.location.href = 'painel.html';
            } else {
                window.location.href = 'estoque.html';
            }
        } else {
            alert("Acesso negado! Usuário ou senha incorretos.")
        }
    } catch (erro) {
        alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
    }
});
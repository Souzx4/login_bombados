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

            const nivelDoUsuario = await resposta.text();

            localStorage.setItem('usuarioLogado', usuarioDigitado);

            // redireciona para a página certa dependendo do nível do usuário
            if (nivelDoUsuario.trim().toUpperCase() === 'ADMIN') {
                alert("Bem-vindo, Admin! Redirecionando para a página de administração...");
                window.location.href = 'painel.html';
            } else {
                alert("Bem-vindo, Abrindo o caixa...");
                window.location.href = 'caixa.html';
            }
        } else {
            alert("Acesso negado! Usuário ou senha incorretos.")
        }
    } catch (erro) {
        alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
    }
});
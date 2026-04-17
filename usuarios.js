// =================================================
// VARIÁVEIS GLOBAIS
// =================================================
let listaDeUsuarios = [];
let usuarioEditandoId = null; // Memória para saber se estamos Criando ou Editando

// =================================================
// Função para buscar e desenhar a tabela de usuários
// =================================================
async function carregarTodosUsuarios() {
    try {
        const resposta = await fetch('http://localhost:8080/api/usuarios');

        if (resposta.ok) {
            listaDeUsuarios = await resposta.json();
            const tbody = document.getElementById('tabela-usuarios-body');
            tbody.innerHTML = ''; // Limpa a tabela

            listaDeUsuarios.forEach(usuario => {
                const linha = document.createElement('tr');
                linha.style.borderBottom = '1px solid #333';

                let corNivel = usuario.nivelAcesso === 'ADMIN' ? '#ff9900' : '#4CAF50';
                let corTexto = usuario.nivelAcesso === 'ADMIN' ? '#000' : '#fff';
                let statusAtual = usuario.statusConta || usuario.status_conta;
                let isAtivo = statusAtual === 'ATIVO';

                // Se estiver inativo, deixa a linha com transparência (50%)
                linha.style.opacity = isAtivo ? '1' : '0.5';

                let labelInativo = isAtivo ? '' : '<span style="color: #f44336; font-size: 12px; margin-left: 10px;">(BLOQUEADO)</span>';

                if (isAtivo) {
                    botoesHtml = `
                        <button onclick="prepararEdicao(${usuario.id})" title="Editar Usuário" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                        <button onclick="excluirUsuario(${usuario.id}, '${usuario.nome}')" title="Bloquear Acesso" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️</button>
                    `;
                } else {
                    botoesHtml = `
                        <button onclick="reativarUsuario(${usuario.id}, '${usuario.nome}')" title="Reativar Acesso" style="background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">♻️ Reativar</button>
                    `;
                }

                linha.innerHTML = `
                    <td style="padding: 15px 10px; color: #ff9900; font-weight: bold;">00${usuario.id}</td>
                    <td style="padding: 15px 10px;"><strong>${usuario.nome}</strong> ${labelInativo}</td>
                    <td style="padding: 15px 10px;">${usuario.login}</td>
                    <td style="padding: 15px 10px;">
                        <span style="background: ${corNivel}; color: ${corTexto}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                            ${usuario.nivelAcesso || usuario.nivel_acesso}
                        </span>
                    </td>
                    <td style="padding: 15px 10px; text-align: center;">
                        ${botoesHtml}
                    </td>
                `;
                tbody.appendChild(linha);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar usuários: ", erro);
    }
}

carregarTodosUsuarios();

// =================================================
// LÓGICA DO MODAL (Janela de Novo Usuário)
// =================================================
const modalUsuario = document.getElementById('modal-usuario');
const btnNovoUsuario = document.getElementById('btn-novo-usuario');
const btnFecharModal = document.getElementById('fechar-modal-usuario');
const formUsuario = document.getElementById('form-novo-usuario');
const tituloModal = document.querySelector('#modal-usuario h3'); // Pega o título

// Abrir para NOVO usuário
btnNovoUsuario.addEventListener('click', () => {
    usuarioEditandoId = null; // Avisa o sistema que é NOVO
    formUsuario.reset();
    if (tituloModal) tituloModal.innerText = 'Cadastrar Novo Usuário';

    // A senha é obrigatória ao criar
    document.getElementById('cad-usuario-senha').required = true;
    document.getElementById('cad-usuario-senha').disabled = false;
    document.getElementById('cad-usuario-senha').placeholder = "Digite a senha...";

    modalUsuario.style.display = 'block';
});

// Fechar a janela
btnFecharModal.addEventListener('click', () => {
    modalUsuario.style.display = 'none';
});

// =================================================
// PREPARAR EDIÇÃO (O botão do Lápis Azul)
// =================================================
function prepararEdicao(id) {
    const usuario = listaDeUsuarios.find(u => u.id === id);

    if (usuario) {
        usuarioEditandoId = usuario.id; // Grava quem estamos editando
        if (tituloModal) tituloModal.innerText = `Editar Usuário: ${usuario.nome}`;

        // Preenche os campos
        document.getElementById('cad-usuario-nome').value = usuario.nome;
        document.getElementById('cad-usuario-login').value = usuario.login;
        document.getElementById('cad-usuario-nivel').value = usuario.nivelAcesso;

        // Desativa o campo de senha na edição (para proteger)
        const campoSenha = document.getElementById('cad-usuario-senha');
        campoSenha.required = false;
        campoSenha.value = "";
        campoSenha.disabled = true;
        campoSenha.placeholder = "(Senha oculta por segurança)";

        modalUsuario.style.display = 'block';
    }
}

// =================================================
// SALVAR O USUÁRIO (CRIAR ou ATUALIZAR)
// =================================================
formUsuario.addEventListener('submit', async function (event) {
    event.preventDefault();

    const dadosUsuario = {
        id: 0,
        nome: document.getElementById('cad-usuario-nome').value,
        login: document.getElementById('cad-usuario-login').value,
        senha: document.getElementById('cad-usuario-senha').value,
        nivelAcesso: document.getElementById('cad-usuario-nivel').value,
        statusConta: "ATIVA"
    };

    try {
        let url = 'http://localhost:8080/api/usuarios';
        let metodoHTTP = 'POST';

        // Se tiver ID, estamos EDITANDO!
        if (usuarioEditandoId !== null) {
            url = `http://localhost:8080/api/usuarios/${usuarioEditandoId}`;
            metodoHTTP = 'PUT';
        }

        const resposta = await fetch(url, {
            method: metodoHTTP,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosUsuario)
        });

        if (resposta.ok) {
            alert(usuarioEditandoId === null ? 'Usuário cadastrado com sucesso!' : 'Usuário atualizado com sucesso!');
            modalUsuario.style.display = 'none';
            carregarTodosUsuarios();
        } else {
            alert('Erro ao salvar. Verifique se o login digitado já existe.');
        }
    } catch (erro) {
        alert('Erro de conexão com o servidor.');
    }
});

// =================================================
// EXCLUIR USUÁRIO (A Lixeira Vermelha)
// =================================================
async function excluirUsuario(id, nome) {
    if (confirm(`⚠️ Tem certeza que deseja bloquear o acesso de: ${nome}?`)) {
        try {
            const resposta = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert('Acesso revogado com sucesso!');
                carregarTodosUsuarios();
            } else {
                alert('Erro ao tentar bloquear o usuário.');
            }
        } catch (erro) {
            alert('Erro de conexão com o servidor do RH.');
        }
    }
}

// =================================================
// REATIVAR USUÁRIO (O Botão Verde ♻️)
// =================================================
async function reativarUsuario(id, nome) {
    if (confirm(`♻️ Deseja reativar o acesso de: ${nome}?`)) {
        try {
            const resposta = await fetch(`http://localhost:8080/api/usuarios/${id}/reativar`, {
                method: 'PUT'
            });

            if (resposta.ok) {
                alert('Acesso reativado com sucesso! O usuário já pode logar.');
                carregarTodosUsuarios(); // Atualiza a tabela na mesma hora
            } else {
                alert('Erro ao tentar reativar o usuário no banco de dados.');
            }
        } catch (erro) {
            alert('Erro de conexão com o servidor Java.');
        }
    }
}
document.addEventListener('DOMContentLoaded', carregarDadosUsuario);

function carregarDadosUsuario() {
  const userLogado = JSON.parse(localStorage.getItem('userLogado'));

  if (userLogado) {
    document.getElementById('nome-usuario').innerText = userLogado.nome;
    document.getElementById('user-usuario').innerText = userLogado.user;
    document.getElementById('email-usuario').innerText = userLogado.email;
    document.getElementById('senha-usuario').innerText = userLogado.senha;
    document.getElementById('foto-perfil').src = userLogado.pic;
  } else {
    alert('Você precisa estar logado para acessar essa página.');
    window.location.href = '/assets/html/signin.html';
  }
}

function previewFoto() {
  const file = document.getElementById('selecionar-foto').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const fotoPerfil = document.getElementById('foto-perfil');
      fotoPerfil.src = e.target.result;
      fotoPerfil.dataset.newPic = e.target.result; // Armazena a nova foto para salvar posteriormente
      document.getElementById('salvarAlteracoes').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function editarDados() {
  const userLogado = JSON.parse(localStorage.getItem('userLogado'));

  // Preencher os inputs de edição com os dados atuais do usuário
  document.getElementById('editNome').value = userLogado.nome;
  document.getElementById('editUsuario').value = userLogado.user;
  document.getElementById('editEmail').value = userLogado.email;

  // Esconder os inputs de edição da foto e o botão de salvar foto
  document.getElementById('inputsEdicao').style.display = 'block';
  document.getElementById('salvarAlteracoes').style.display = 'inline-block';
}

function salvarAlteracoes() {
  const novoNome = document.getElementById('editNome').value || null;
  const novoUsuario = document.getElementById('editUsuario').value || null;
  const novoEmail = document.getElementById('editEmail').value || null;
  const novaSenha = document.getElementById('editSenha').value || null;

  const userLogado = JSON.parse(localStorage.getItem('userLogado'));
  const listaUser = JSON.parse(localStorage.getItem('listaUser')) || [];

  // Atualizar os dados no userLogado se houver novos valores
  if (novoNome) userLogado.nome = novoNome;
  if (novoUsuario) userLogado.user = novoUsuario;
  if (novoEmail) userLogado.email = novoEmail;
  if (novaSenha) userLogado.senha = novaSenha;

  // Atualizar a foto de perfil apenas se uma nova foto foi selecionada e já pré-visualizada
  if (document.getElementById('foto-perfil').dataset.newPic) {
    userLogado.pic = document.getElementById('foto-perfil').dataset.newPic; // Salvar a nova foto no objeto userLogado
  }

  // Atualizar os dados no localStorage
  localStorage.setItem('userLogado', JSON.stringify(userLogado));

  // Atualizar também na lista de usuários
  const index = listaUser.findIndex(item => item.userCad === userLogado.user);
  if (index !== -1) {
    if (novoNome) listaUser[index].nomeCad = novoNome;
    if (novoUsuario) listaUser[index].userCad = novoUsuario;
    if (novoEmail) listaUser[index].emailCad = novoEmail;
    if (novaSenha) listaUser[index].senhaCad = novaSenha;
    if (userLogado.pic) listaUser[index].pic = userLogado.pic; // Salvar a nova foto na lista de usuários

    // Atualize a lista no localStorage
    localStorage.setItem('listaUser', JSON.stringify(listaUser));
  }

  // Atualizar o HTML com os novos dados
  document.getElementById('nome-usuario').innerText = userLogado.nome;
  document.getElementById('user-usuario').innerText = userLogado.user;
  document.getElementById('email-usuario').innerText = userLogado.email;
  if (novaSenha) {
    document.getElementById('senha-usuario').innerText = userLogado.senha;
  }
  document.getElementById('foto-perfil').src = userLogado.pic || 'caminho/para/foto-de-perfil.jpg';

  // Esconder os inputs de edição dos dados e o botão de salvar alterações
  document.getElementById('inputsEdicao').style.display = 'none';
  document.getElementById('salvarAlteracoes').style.display = 'none';

  // Exemplo de feedback para o usuário
  alert('Alterações salvas com sucesso!');
}

function deslogar() {
  localStorage.removeItem('userLogado');
  localStorage.removeItem('token');

  window.location.href = '/assets/html/home.html';
}

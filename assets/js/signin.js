let btn = document.querySelector('.fa-eye');

btn.addEventListener('click', () => {
  let inputSenha = document.querySelector('#senha');

  if (inputSenha.getAttribute('type') == 'password') {
    inputSenha.setAttribute('type', 'text');
  } else {
    inputSenha.setAttribute('type', 'password');
  }
});

function entrar() {
  let usuario = document.querySelector('#usuario');
  let userLabel = document.querySelector('#userLabel');

  let senha = document.querySelector('#senha');
  let senhaLabel = document.querySelector('#senhaLabel');

  let email = document.querySelector('#email'); 
  let msgError = document.querySelector('#msgError');
  let listaUser = [];

  let userValid = {
    nome: '',
    user: '',
    senha: '',
    email: '',
    pic: ''
  };

  listaUser = JSON.parse(localStorage.getItem('listaUser'));

  listaUser.forEach((item) => {
    if (usuario.value == item.userCad && senha.value == item.senhaCad) {
      userValid = {
        nome: item.nomeCad,
        user: item.userCad,
        senha: item.senhaCad,
        email: item.emailCad,
        pic: item.pic
      };
    }
  });

  if (usuario.value == userValid.user && senha.value == userValid.senha) {
    window.location.href = '../html/meu-perfil.html';

    let mathRandom = Math.random().toString(16).substr(2);
    let token = mathRandom + mathRandom;

    localStorage.setItem('token', token);
    localStorage.setItem('userLogado', JSON.stringify(userValid));
  } else {
    userLabel.setAttribute('style', 'color: green');
    usuario.setAttribute('style', 'border-color: green');
    senhaLabel.setAttribute('style', 'color: green');
    senha.setAttribute('style', 'border-color: green');
    msgError.setAttribute('style', 'display: block');
    msgError.innerHTML = 'Usuário e/ou senha incorreto(s)';
    usuario.focus();
  }
}

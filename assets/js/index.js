document.addEventListener('DOMContentLoaded', function() {
  var token = localStorage.getItem("token");
  var perfilUsuarioButton = document.getElementById("perfil-active");
  var perfilUsuarioLink = perfilUsuarioButton.parentElement;

  if (token == null) {
    perfilUsuarioButton.textContent = "Login";
    perfilUsuarioLink.href = "../html/signin.html";
  }
})
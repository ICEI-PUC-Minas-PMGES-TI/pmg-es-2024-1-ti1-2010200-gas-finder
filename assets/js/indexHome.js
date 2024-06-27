document.addEventListener('DOMContentLoaded', function () {
    var token = localStorage.getItem("token");
    var perfilUsuarioButton = document.getElementById("perfil-active");
    var perfilUsuarioLink = perfilUsuarioButton.parentElement;

    if (token == null) {
        perfilUsuarioButton.textContent = "Login";
        perfilUsuarioLink.href = "/pmg-es-2024-1-ti1-2010200-gas-finder/html/signin.html";
    }
})
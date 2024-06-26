let btnAddComment = document.querySelector('#addComment');
let commentInput = document.querySelector('#comment');
let commentSection = document.querySelector('#comments');
let stars = document.querySelectorAll('.star');
let selectedRating = 0;

// Função para atualizar a exibição das estrelas selecionadas
function updateStarSelection(rating) {
    stars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = star.getAttribute('data-value');
        updateStarSelection(selectedRating);
    });
});

btnAddComment.addEventListener('click', () => {
    let commentText = commentInput.value.trim();

    if (commentText === '') {
        alert('Por favor, insira um comentário.');
        return;
    }

    if (selectedRating === 0) {
        alert('Por favor, avalie com estrelas.');
        return;
    }

    let userLogado = JSON.parse(localStorage.getItem('userLogado'));
    if (!userLogado) {
        alert('Você precisa estar logado para comentar.');
        return;
    }

    let currentPostCnpj = localStorage.getItem('currentPostCnpj');
    if (!currentPostCnpj) {
        alert('Erro ao recuperar o CNPJ do posto.');
        return;
    }

    // Recupera os comentários do posto específico ou inicializa um array vazio
    let commentsList = JSON.parse(localStorage.getItem(`commentsList_${currentPostCnpj}`) || '[]');

    commentsList.push({
        nome: userLogado.nome,
        user: userLogado.user,
        comment: commentText,
        rating: selectedRating,
        timestamp: new Date().toLocaleString(),
        pic: userLogado.pic
    });

    localStorage.setItem(`commentsList_${currentPostCnpj}`, JSON.stringify(commentsList));

    displayComments(currentPostCnpj);
    commentInput.value = '';
    updateStarSelection(0);
    selectedRating = 0;
});

function displayComments(cnpj) {
    let commentsList = JSON.parse(localStorage.getItem(`commentsList_${cnpj}`) || '[]');
    commentSection.innerHTML = '';

    // Exibir apenas as 3 últimas avaliações
    let start = Math.max(commentsList.length - 3, 0); // Índice inicial para exibir as últimas 3 avaliações

    if (commentsList.length === 0) {
        const noCommentsMessage = document.createElement('p');
        noCommentsMessage.textContent = 'Nenhuma avaliação disponível para este posto!';
        noCommentsMessage.id = 'no-comments';
        commentSection.appendChild(noCommentsMessage);
    }

    // Iterar sobre os últimos 3 comentários, se houver
    for (let index = start; index < commentsList.length; index++) {
        let comment = commentsList[index];

        let commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        let userSpan = document.createElement('span');
        userSpan.classList.add('comment-user');

        let userAvatar = document.createElement('img');
        userAvatar.src = comment.pic;
        userAvatar.alt = comment.nome;
        userAvatar.style.width = '24px'; // Ajuste o tamanho da imagem conforme necessário
        userAvatar.style.borderRadius = '50%'; // Adicionar border-radius de 50%

        let userName = document.createElement('span');
        userName.textContent = comment.nome;

        userSpan.appendChild(userAvatar);
        userSpan.appendChild(userName);

        let timestampSpan = document.createElement('span');
        timestampSpan.classList.add('comment-timestamp');
        timestampSpan.textContent = ` ${comment.timestamp}`;

        let ratingSpan = document.createElement('span');
        ratingSpan.classList.add('comment-rating');
        ratingSpan.innerHTML = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);

        let commentText = document.createElement('p');
        commentText.classList.add('comment-text');
        commentText.textContent = comment.comment;

        let userLogado = JSON.parse(localStorage.getItem('userLogado'));
        if (userLogado && userLogado.user === comment.user) {
            let deleteButton = document.createElement('span');
            deleteButton.classList.add('delete-comment');
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener('click', () => {
                commentsList.splice(index, 1);
                localStorage.setItem(`commentsList_${cnpj}`, JSON.stringify(commentsList));
                displayComments(cnpj);
            });
            commentDiv.appendChild(deleteButton);
        }

        commentDiv.appendChild(userSpan);
        commentDiv.appendChild(timestampSpan);
        commentDiv.appendChild(ratingSpan);
        commentDiv.appendChild(commentText);

        commentSection.appendChild(commentDiv);
    }

    // Verificar se há mais do que 3 avaliações para mostrar o botão
    if (commentsList.length > 3) {
        // Mostrar o botão
        document.getElementById('redirectToReviews').style.display = 'block';
    } else {
        // Esconder o botão
        document.getElementById('redirectToReviews').style.display = 'none';
    }

}

function redirectToReviewsPage() {
    let currentPostCnpj = localStorage.getItem('currentPostCnpj');
    if (currentPostCnpj) {
        window.location.href = `avaliacoes.html?cnpj=${currentPostCnpj}`;
    } else {
        console.error('CNPJ do posto não encontrado.');
        alert('Não foi possível encontrar as avaliações deste posto.');
    }
}



// Função para obter o valor de um parâmetro da URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Função para redirecionar para a página do mapa com as coordenadas
function redirectToMapPage() {
    fetch('../js/tabela.json')
        .then(response => response.json())
        .then(data => {
            const index = getQueryParam('index');
            const posto = data[index];
            if (posto) {
                const address = `${posto["Cidade"]}, ${posto["Rua/avenida"]}, ${posto["Número"]} - ${posto["Bairro"]}, ${posto["CEP"]}`;

                // Utiliza o serviço de geocodificação da Google Maps API para obter as coordenadas
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: address }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const location = results[0].geometry.location;
                        const latitude = location.lat();
                        const longitude = location.lng();

                        // Redireciona para a página do mapa com as coordenadas obtidas
                        window.location.href = `rota2.html?latitude=${latitude}&longitude=${longitude}`;
                    } else {
                        console.error('Erro ao obter coordenadas do posto:', status);
                        alert('Erro ao obter coordenadas do posto.');
                    }
                });
            } else {
                console.error('Posto não encontrado.');
                alert('Posto não encontrado.');
            }
        })
        .catch(error => console.error('Erro ao carregar o arquivo JSON:', error));
}


// Carregar o JSON do arquivo e exibir os detalhes do posto
fetch('../js/tabela.json')
    .then(response => response.json())
    .then(data => {
        const index = getQueryParam('index');
        const posto = data[index];
        if (posto) {
            const cabecalho = document.getElementById('posto-cabecalho');
            const postoCabecalhoHTML = `
                <img id="postoimg" src="../img/posto.png" alt="">
                <p id="nome-posto"><strong>${posto['Nome do posto']}</strong></p>
            `;
			
            cabecalho.innerHTML = postoCabecalhoHTML;

            const container = document.getElementById('posto-detalhes-container');
            const postoDetalhesHTML = `
                <div class="posto-detalhes">
                    <h3>Mais Informações</h3>
                    <p><strong>Cidade:</strong> ${posto.Cidade}</p>
                    <p><strong>Endereço:</strong> ${posto['Rua/avenida']}, ${posto.Número}, ${posto.Bairro}</p>
                    <p><strong>CEP:</strong> ${posto.CEP}</p>
                    <p><strong>CNPJ:</strong> ${posto.CNPJ}</p>
                    <p><strong>Tipo de combustível:</strong> ${posto['Tipo de combustível']}</p>
                    <p><strong>Data da atualização:</strong> ${posto['Data da atualização']}</p>
                    <p><strong>Preço:</strong> ${posto.Preço}</p>
                    <p><strong>Unidade de medida:</strong> ${posto['Unidade de medida']}</p>
                    <p><strong>Bandeira:</strong> ${posto.Bandeira}</p>
                </div>
            `;
            container.innerHTML = postoDetalhesHTML;

            // Define o CNPJ como o ID do posto para carregar os comentários corretos
            localStorage.setItem('currentPostCnpj', posto.CNPJ);

            // Exibe os comentários do posto específico
            displayComments(posto.CNPJ);
        } else {
            console.error('Posto não encontrado.');
        }
    })
    .catch(error => console.error('Erro ao carregar o arquivo JSON:', error));
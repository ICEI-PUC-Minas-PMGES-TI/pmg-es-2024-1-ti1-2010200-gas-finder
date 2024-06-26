const itemsPerPage = 10;
let currentPage = 0;
let totalPages = 0;
let postosData = [];
let postosFiltrados = [];

// Função para obter a localização do usuário
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                error => {
                    console.error('Erro ao obter localização do usuário:', error);
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocalização não suportada pelo navegador.'));
        }
    });
}

// Função para obter a localização do posto de combustível
function getStationLocation(station) {
    return new Promise((resolve, reject) => {
        const address = `${station["Cidade"]}, ${station["Rua/avenida"]}, ${station["Número"]} - ${station["Bairro"]}, ${station["CEP"]}`;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const stationLocation = {
                    latitude: location.lat(),
                    longitude: location.lng()
                };
                resolve(stationLocation);
            } else {
                console.error('Erro ao obter localização do posto:', status);
                reject(new Error('Não foi possível obter a localização do posto.'));
            }
        });
    });
}

// Função para calcular a distância entre a localização do usuário e a localização do posto
function calcularDistancia(usuario, posto) {
    const userLatLng = new google.maps.LatLng(usuario.latitude, usuario.longitude);
    const stationLatLng = new google.maps.LatLng(posto.latitude, posto.longitude);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, stationLatLng) / 1000;
    return distance;
}

// Função para atualizar a lista de postos com a distância calculada
function atualizarDistancias(usuario, postos) {
    return Promise.all(postos.map(posto => {
        return getStationLocation(posto)
            .then(stationLocation => {
                const distancia = calcularDistancia(usuario, stationLocation);
                return { ...posto, distancia };
            })
            .catch(error => {
                console.error('Erro ao obter localização do posto:', error);
                return { ...posto, distancia: Infinity };
            });
    }));
}


// Função para criar o HTML dos postos, agora incluindo a distância
function criarHTMLPostos(postos, page) {
    const container = document.getElementById('postos-container');
    container.innerHTML = ''; 

    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, postos.length);
    const currentPostos = postos.slice(startIndex, endIndex);

    currentPostos.forEach((posto, index) => {
        const postoHTML = `
            <div class="posto-card">
                <img id="postoimg" src="../img/posto.png" alt="">
                <h5 id="nome-posto"><strong>${posto['Nome do posto']}</strong></h5>
                <p><strong>Preço:</strong> ${posto.Preço}</p>
                <p><strong>Tipo de combustível:</strong> ${posto['Tipo de combustível']}</p>
                <p><strong>Bandeira:</strong> ${posto.Bandeira}</p>
                <p><strong>Distância:</strong> ${posto.distancia.toFixed(2)} km</p>
                <button id="btn-info" onclick="redirectToDetails(${startIndex + index})">Mais Informações</button>
            </div> 
        `;
        container.innerHTML += postoHTML;
    });

    // Atualiza a exibição da página atual e total de páginas
    document.getElementById('page-info').textContent = `Página ${currentPage + 1} de ${totalPages}`;

    // Desabilitar botões se necessário
    document.getElementById('previous-page').disabled = currentPage === 0;
    document.getElementById('next-page').disabled = currentPage === totalPages - 1;
}


// Função para redirecionar para a página de detalhes com os parâmetros necessários
function redirectToDetails(index) {
    window.location.href = `detalhesposto.html?index=${index}`;
}

// Função para carregar dados do JSON e inicializar a página
function carregarDados() {
    fetch('../js/tabela.json')
        .then(response => response.json())
        .then(data => {
            postosData = data;
            getUserLocation() 
                .then(userLocation => {
                    // Atualizar a localização de cada posto e calcular distâncias
                    const promises = postosData.map(posto => {
                        return getStationLocation(posto)
                            .then(stationLocation => {
                                const distancia = calcularDistancia(userLocation, stationLocation);
                                return { ...posto, distancia };
                            })
                            .catch(error => {
                                console.error('Erro ao obter localização do posto:', error);
                                return { ...posto, distancia: Infinity };
                            });
                    });

                    Promise.all(promises)
                        .then(postosAtualizados => {
                            postosFiltrados = postosAtualizados;
                            aplicarFiltro();
                        })
                        .catch(error => console.error('Erro ao atualizar localizações e distâncias:', error));
                })
                .catch(error => console.error('Erro ao obter localização do usuário:', error));
        })
        .catch(error => console.error('Erro ao carregar o arquivo JSON:', error));
}

// Função para aplicar os filtros de combustível, bandeira e a combinação de preço e distância, e redefinir a página para 1
function aplicarFiltro() {
    const filtroCombustivel = document.getElementById('filtro-combustivel').value;
    const filtroBandeira = document.getElementById('filtro-bandeira').value;
    const filtroPrecoDistancia = document.getElementById('filtro-preco-distancia').value;

    let postosFiltrados = [...postosData];

    if (filtroCombustivel !== 'TODOS') {
        postosFiltrados = postosFiltrados.filter(posto => posto['Tipo de combustível'] === filtroCombustivel);
    }
    if (filtroBandeira !== 'TODOS') {
        postosFiltrados = postosFiltrados.filter(posto => posto.Bandeira === filtroBandeira);
    }

    postosFiltrados = postosFiltrados.filter(posto => !isNaN(parseFloat(posto.Preço)));

    // Atualizar distâncias e aplicar filtro de preço ou distância
    getUserLocation()
        .then(userLocation => {
            return atualizarDistancias(userLocation, postosFiltrados);
        })
        .then(postosAtualizados => {
            postosFiltrados = postosAtualizados;

            if (filtroPrecoDistancia === 'MENOR_PRECO') {
                postosFiltrados.sort((a, b) => parseFloat(a.Preço) - parseFloat(b.Preço));
            } else if (filtroPrecoDistancia === 'MAIOR_PRECO') {
                postosFiltrados.sort((a, b) => parseFloat(b.Preço) - parseFloat(a.Preço));
            } else if (filtroPrecoDistancia === 'MENOR_DISTANCIA') {
                postosFiltrados.sort((a, b) => a.distancia - b.distancia);
            } else if (filtroPrecoDistancia === 'MAIOR_DISTANCIA') {
                postosFiltrados.sort((a, b) => b.distancia - a.distancia);
            }

            // Atualizar total de páginas e recriar HTML dos postos
            totalPages = Math.ceil(postosFiltrados.length / itemsPerPage);
            currentPage = 0; // Reseta para a primeira página
            criarHTMLPostos(postosFiltrados, currentPage);
        })
        .catch(error => console.error('Erro ao aplicar filtros e atualizar distâncias:', error));
}


// Inicialização da página e inclusão dos elementos de navegação e info de página
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    document.getElementById('filtro-combustivel').addEventListener('change', aplicarFiltro);
    document.getElementById('filtro-bandeira').addEventListener('change', aplicarFiltro);
    document.getElementById('filtro-preco-distancia').addEventListener('change', aplicarFiltro);

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            criarHTMLPostos(postosFiltrados, currentPage);
        }
    });

    document.getElementById('previous-page').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            criarHTMLPostos(postosFiltrados, currentPage);
        }
    });
});
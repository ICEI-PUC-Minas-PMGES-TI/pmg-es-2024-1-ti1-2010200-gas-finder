async function carregarDados() {
    try {
        const resposta = await fetch('tabela.json');
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar dados: ${resposta.statusText}`);
        }
        
        const dados = await resposta.json();
        return dados;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return [];
    }
}

let dadosCache = null;

async function obterDados() {
    if (!dadosCache) {
        dadosCache = await carregarDados();
    }
    return dadosCache;
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(location);
                },
                (error) => {
                    console.error('Erro ao obter localização do usuário:', error);
                    reject(error);
                    alert('Não foi possível obter sua localização. Por favor, verifique as configurações de permissão de localização.');
                }
            );
        } else {
            console.error('Geolocalização não suportada');
            reject(new Error('Geolocalização não suportada'));
        }
    });
}

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
                reject(new Error('Não foi possível obter a localização do posto'));
            }
        });
    });
}
function calculateDistance(userLocation, stationLocation) {
    const userLatLng = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
    const stationLatLng = new google.maps.LatLng(stationLocation.latitude, stationLocation.longitude);
  
    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, stationLatLng) / 1000;
    return distance;
}

// Função assíncrona para obter a lista de postos próximos
async function obterPostosProximos() {
    try {
        // Obtém dados dos postos e a localização do usuário simultaneamente
        const [dados, userLocation] = await Promise.all([obterDados(), getUserLocation()]);

        // Calcula a distância de cada posto em relação ao usuário
        const stationsWithDistance = await Promise.all(dados.map(async (station) => {
            try {
                const stationLocation = await getStationLocation(station);
                const distance = calculateDistance(userLocation, stationLocation);
                // Retorna o posto com a distância calculada
                return { ...station, distance };
            } catch (error) {
                // Erro ao obter a localização do posto, exibe uma mensagem de erro e retorna null
                console.error('Erro ao obter localização do posto:', error);
                return null;
            }
        }));

        // Filtra postos válidos
        const postosFiltrados = stationsWithDistance.filter(station => station !== null);
        return postosFiltrados;
    } catch (error) {
        // Em caso de erro, exibe uma mensagem no console e retorna um array vazio
        console.error('Erro ao obter postos próximos:', error);
        return [];
    }
}

// Função assíncrona para listar postos com base em critérios de ordenação e filtragem
async function listarPostos(ordem) {
    const postos = await obterPostosProximos();
    const bandeira = document.getElementById('bandeira').value.toLowerCase();
    const tipoCombustivel = document.getElementById('tipoCombustivel').value.toLowerCase();
    const listaPostos = document.getElementById('postos-lista');
    listaPostos.innerHTML = '';

    // Filtragem dos postos com base nos critérios fornecidos pelo usuário
    const postosFiltrados = postos.filter(posto => {
        return (!bandeira || posto.Bandeira.toLowerCase() === bandeira) &&
               (!tipoCombustivel || posto["Tipo de combustível"].toLowerCase() === tipoCombustivel);
    });

    // Ordenação dos postos com base na ordem especificada
    if (ordem === 'menor-dist') {
        postosFiltrados.sort((a, b) => a.distance - b.distance);
    } else if (ordem === 'maior-dist') {
        postosFiltrados.sort((a, b) => b.distance - a.distance);
    } else if (ordem === 'menor-preço') {
        postosFiltrados.sort((a, b) => parseFloat(a["Preço"]) - parseFloat(b["Preço"]));
    } else if (ordem === 'maior-preço') {
        postosFiltrados.sort((a, b) => parseFloat(b["Preço"]) - parseFloat(a["Preço"]));
    } else if (ordem === 'none') {
        // Não faz nada, mantém a ordem original do JSON
    }

    if (postosFiltrados.length === 0) {
        // Exibir mensagem de nenhum resultado encontrado
        listaPostos.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return; // Sair da função, já que não há resultados para exibir
    }

    // Adiciona cada posto filtrado na lista do HTML
    postosFiltrados.forEach(posto => {
        const postoDiv = document.createElement('div');
        postoDiv.classList.add('posto');
        postoDiv.innerHTML = `
            <strong>${posto["Nome do posto"]}</strong><br>
            Cidade: ${posto["Cidade"]}<br>
            Endereço: ${posto["Rua/avenida"]}, ${posto["Número"]} - ${posto["Bairro"]}, ${posto["CEP"]}<br>
            Tipo de combustível: ${posto["Tipo de combustível"]}<br>
            Preço: ${posto["Preço"]} ${posto["Unidade de medida"]}<br>
            Bandeira: ${posto.Bandeira}<br>
            Distância: ${posto.distance.toFixed(2)} km
        `;
        listaPostos.appendChild(postoDiv);
    });
}

// Chama listarPostos ao carregar a página para exibir os postos de acordo com a ordem original do JSON
document.addEventListener('DOMContentLoaded', () => {
    listarPostos('none');
});

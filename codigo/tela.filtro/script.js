async function carregarDados() {
    const resposta = await fetch('tabela.json');
    const dados = await resposta.json();
    return dados;
}
async function filtrarDados() {
    const dados = await carregarDados();

    const precoMaximo = parseFloat(document.getElementById('precoMaximo').value);
    const bandeira = document.getElementById('bandeira').value.toLowerCase();
    const tipoCombustivel = document.getElementById('tipoCombustivel').value.toLowerCase();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '';

    const dadosFiltrados = dados.filter(item => {
        const preco = parseFloat(item.Preço.replace(',', '.'));
        return (isNaN(precoMaximo) || preco <= precoMaximo) &&
               (!bandeira || item.Bandeira.toLowerCase() === bandeira) &&
               (!tipoCombustivel || item["Tipo de combustível"].toLowerCase() === tipoCombustivel);
    });

    if (dadosFiltrados.length === 0) {
        resultadoDiv.innerHTML = '<p>Nenhum resultado encontrado.</p>';
    } else {
        dadosFiltrados.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                Cidade: ${item.Cidade}<br>
                Nome do posto: ${item["Nome do posto"]}<br>
                CNPJ: ${item.CNPJ}<br>
                Endereço: ${item["Rua/avenida"]}, ${item.Número} - ${item.Bairro}, ${item.CEP}<br>
                Tipo de combustível: ${item["Tipo de combustível"]}<br>
                Data da atualização: ${item["Data da atualização"]}<br>
                Preço: R$${item.Preço}<br>
                Unidade de medida: ${item["Unidade de medida"]}<br>
                Bandeira: ${item.Bandeira}
            `;
            resultadoDiv.appendChild(itemDiv);
        });
    }
}

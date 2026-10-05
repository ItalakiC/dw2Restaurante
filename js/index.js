const carrossel = document.getElementById('carrosselPratos');
const slides = document.getElementById('slides');
const indicadores = document.getElementById('indicadores');
const vazioCardapio = document.getElementById('vazioCardapio');

let cardsPorSlide = 0;

// 3 cards por slide em telas grandes e 1 no celular 
function calcularCardsPorSlide() {
    return window.innerWidth >= 768 ? 3 : 1;
}

// o card mostra somente imagem, nome e valor
function criarCard(p) {
    return `
      <div class="col-${12 / cardsPorSlide}">
        <div class="card prato h-100" role="button" onclick="escolherPrato(${p.id})">
          ${imagemHtml(p, 'card-img-top')}
          <div class="card-body text-center">
            <h6 class="card-title mb-1">${p.nome}</h6>
            <p class="text-primary fw-semibold mb-0">${moeda(p.preco)}</p>
          </div>
        </div>
      </div>`;
}

// divide os pratos em grupos, cada grupo vira um slide com seu indicador
function criarCarrossel() {
    cardsPorSlide = calcularCardsPorSlide();
    const pratos = cardapio.listar();

    carrossel.classList.toggle('d-none', pratos.length === 0);
    vazioCardapio.classList.toggle('d-none', pratos.length > 0);
    slides.innerHTML = '';
    indicadores.innerHTML = '';

    for (let i = 0, n = 0; i < pratos.length; i += cardsPorSlide, n++) {
        const grupo = pratos.slice(i, i + cardsPorSlide);
        slides.insertAdjacentHTML('beforeend', `
          <div class="carousel-item ${n === 0 ? 'active' : ''}">
            <div class="row g-3 justify-content-center">${grupo.map(criarCard).join('')}</div>
          </div>`);
        indicadores.insertAdjacentHTML('beforeend', `
          <button type="button" data-bs-target="#carrosselPratos" data-bs-slide-to="${n}"
                  class="${n === 0 ? 'active' : ''}" aria-label="Página ${n + 1}"></button>`);
    }
}

// clicar no card coloca o prato no carrinho
function escolherPrato(id) {
    const prato = cardapio.buscar(id);
    carrinho.adicionar(prato);
    atualizarContador();

    document.getElementById('textoToast').textContent = `${prato.nome} adicionado ao carrinho`;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('toastCarrinho')).show();
}

// se a tela mudar de tamanho e mudar a quantidade de cards, refaz o carrossel
window.addEventListener('resize', function () {
    if (calcularCardsPorSlide() !== cardsPorSlide) criarCarrossel();
});

criarCarrossel();

const listaCarrinho = document.getElementById('listaCarrinho');
const vazioCarrinho = document.getElementById('vazioCarrinho');
const formPedido = document.getElementById('formPedido');
const erroPedido = document.getElementById('erroPedido');
const inputNomeCliente = document.getElementById('nomeCliente');
const inputTelefone = document.getElementById('telefone');
const inputEndereco = document.getElementById('endereco');
const campoEndereco = document.getElementById('campoEndereco');

function tipoEntrega() {
    return document.querySelector('input[name="tipoEntrega"]:checked').value;
}

function criarCarrinho() {
    listaCarrinho.innerHTML = '';
    vazioCarrinho.classList.toggle('d-none', carrinho.itens.length > 0);

    carrinho.itens.forEach(item => {
        const p = item.produto;
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${imagemHtml(p, 'miniatura rounded')}</td>
          <td>${p.nome}<br><small class="text-muted">${moeda(p.preco)} cada</small></td>
          <td>
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${p.id}, -1)" ${item.quantidade === 1 ? 'disabled' : ''}>−</button>
            <span class="mx-2 fw-semibold">${item.quantidade}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${p.id}, 1)">+</button>
          </td>
          <td>${moeda(item.subtotal)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="removerItem(${p.id})">Remover</button>
          </td>`;
        listaCarrinho.appendChild(linha);
    });

    atualizarTotais();
}

// recalcula subtotal, taxa e valor total sempre que algo muda
function atualizarTotais() {
    const tipo = tipoEntrega();
    document.getElementById('subtotal').textContent = moeda(carrinho.subtotal);
    document.getElementById('taxaEntrega').textContent = moeda(carrinho.taxa(tipo));
    document.getElementById('valorTotal').textContent = moeda(carrinho.total(tipo));
    campoEndereco.classList.toggle('d-none', tipo !== 'delivery');
    atualizarContador();
}

function alterarQuantidade(id, delta) {
    carrinho.alterarQuantidade(id, delta);
    criarCarrinho();
}

function removerItem(id) {
    carrinho.remover(id);
    criarCarrinho();
}

document.querySelectorAll('input[name="tipoEntrega"]').forEach(r => r.addEventListener('change', atualizarTotais));

// valida, cria o objeto pedido e mostra o resumo
formPedido.addEventListener('submit', function (evento) {
    evento.preventDefault();
    esconderErro(erroPedido);

    const tipo = tipoEntrega();
    const cliente = {
        nome: inputNomeCliente.value.trim(),
        telefone: inputTelefone.value.trim(),
        endereco: tipo === 'delivery' ? inputEndereco.value.trim() : ''
    };

    let erro = null;
    if (carrinho.itens.length === 0) erro = 'O carrinho está vazio';
    else if (cliente.nome === '') erro = 'Informe o nome do cliente';
    else if (cliente.telefone === '') erro = 'Informe o telefone do cliente';
    else if (tipo === 'delivery' && cliente.endereco === '') erro = 'Informe o endereço para a entrega';

    if (erro) {
        mostrarErro(erroPedido, erro);
        return;
    }

    const pedido = new Pedido(cliente, carrinho, tipo);
    console.log(pedido);
    mostrarResumo(pedido);

    carrinho.limpar();
    formPedido.reset();
    criarCarrinho();
});

function mostrarResumo(p) {
    const itens = p.itens.map(i => `<li>${i.quantidade}x ${i.nome} — ${moeda(i.subtotal)}</li>`).join('');
    const entrega = p.tipoEntrega === 'delivery' ? `Delivery (taxa de ${moeda(p.taxaEntrega)})` : 'Comer no local';
    const endereco = p.cliente.endereco ? `<br>Endereço: ${p.cliente.endereco}` : '';

    document.getElementById('resumoPedido').innerHTML = `
      <p>Cliente: ${p.cliente.nome} (${p.cliente.telefone})${endereco}</p>
      <ul>${itens}</ul>
      <p>${entrega}</p>
      <p class="fs-5 fw-semibold text-primary mb-0">Valor Total: ${moeda(p.total)}</p>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPedido')).show();
}

criarCarrinho();

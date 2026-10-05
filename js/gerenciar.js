const tituloFormulario = document.getElementById('tituloFormulario');
const erroPrato = document.getElementById('erroPrato');
const formPrato = document.getElementById('formPrato');
const inputId = document.getElementById('pratoId');
const inputNome = document.getElementById('nome');
const inputPreco = document.getElementById('preco');
const inputImagem = document.getElementById('imagem');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');
const inputBusca = document.getElementById('busca');
const tabelaPratos = document.getElementById('tabelaPratos');
const vazioPratos = document.getElementById('vazioPratos');

let termoBusca = '';

// devolve a mensagem de erro, ou null se estiver tudo certo
function validarPrato(nome, preco, idAtual) {
    if (nome === '') return 'O prato precisa de um nome';
    if (isNaN(preco) || preco <= 0) return 'O preço precisa ser um número maior que zero';
    if (cardapio.nomeDuplicado(nome, idAtual)) return 'Um prato com este nome já foi cadastrado';
    return null;
}

function criarTabelaPratos() {
    tabelaPratos.innerHTML = '';
    const pratos = cardapio.listar(termoBusca);

    vazioPratos.classList.toggle('d-none', pratos.length > 0);
    vazioPratos.textContent = cardapio.produtos.length === 0 ? 'Não há pratos cadastrados' : 'Nenhum prato encontrado';

    pratos.forEach(p => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${imagemHtml(p, 'miniatura rounded')}</td>
          <td>${p.nome}</td>
          <td>${moeda(p.preco)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" onclick="editarPrato(${p.id})">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirPrato(${p.id})">Excluir</button>
          </td>`;
        tabelaPratos.appendChild(linha);
    });
}

// cadastra ou altera, depende se o campo escondido tem id
formPrato.addEventListener('submit', function (evento) {
    evento.preventDefault();
    esconderErro(erroPrato);

    const id = inputId.value ? parseInt(inputId.value) : null;
    const nome = inputNome.value.trim();
    const preco = parseFloat(inputPreco.value);
    const imagem = inputImagem.value.trim();

    const erro = validarPrato(nome, preco, id);
    if (erro) {
        mostrarErro(erroPrato, erro);
        return;
    }

    if (id) cardapio.atualizar(id, nome, preco, imagem);
    else cardapio.cadastrar(nome, preco, imagem);

    criarTabelaPratos();
    resetarFormulario();
});

function editarPrato(id) {
    const p = cardapio.buscar(id);
    inputId.value = p.id;
    inputNome.value = p.nome;
    inputPreco.value = p.preco;
    inputImagem.value = p.imagem;

    tituloFormulario.textContent = 'Alterando prato: ' + p.nome;
    botaoSalvar.textContent = 'Alterar';
    botaoCancelar.classList.remove('d-none');
    formPrato.scrollIntoView({ behavior: 'smooth' });
}

// tira do cardápio e também do carrinho
function excluirPrato(id) {
    const p = cardapio.buscar(id);
    if (!confirm(`Excluir "${p.nome}"? Após a exclusão ele não poderá ser recuperado.`)) return;

    cardapio.remover(id);
    carrinho.remover(id);
    atualizarContador();
    criarTabelaPratos();
}

inputBusca.addEventListener('input', function () {
    termoBusca = inputBusca.value.trim();
    criarTabelaPratos();
});

function resetarFormulario() {
    formPrato.reset();
    inputId.value = '';
    tituloFormulario.textContent = 'Novo prato';
    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.classList.add('d-none');
}
botaoCancelar.addEventListener('click', resetarFormulario);

criarTabelaPratos();

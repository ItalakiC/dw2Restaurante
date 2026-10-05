
const TAXA_ENTREGA = 2.5;
// formatação em reais
const moeda = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// se a imagem falhar mostra imagem quebrada
const imagemHtml = (p, classe) => `<img src="${p.imagem}" class="${classe}" alt="${p.nome}">`;

// função que mostra caixa de erro
function mostrarErro(caixa, mensagem) {
    caixa.textContent = mensagem;
    caixa.classList.remove('d-none');
}

// função que esconde a caixa de erro
function esconderErro(caixa) {
    caixa.classList.add('d-none');
    caixa.textContent = '';
}

// usa sessionStorage para passar dados de uma página pra outra
const armazenamento = sessionStorage;


// transforma o texto em objeto no array, caso não haja nenhum texto, como abrindo a página pela primeira vez só retorna o padrão que é array vazia
function lerDados(chave, padrao) {
    const texto = armazenamento.getItem(chave);
    if (texto === null) return padrao;
    return JSON.parse(texto);
}

// Tranforma o array de dados em texto 
function salvarDados(chave, valor) {
    const texto = JSON.stringify(valor);
    armazenamento.setItem(chave, texto);
}

// classe produto com o construtor
class Produto {
    constructor(id, nome, preco, imagem) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.imagem = imagem;
    }
}

// CRUD do cardápio 
class Cardapio {
    // o construtor busca os pratos já guradados, se não tiver devolve lista vazia, percorre a lista criando outra que recria cada prato como um produto mesmo e não só um texto que não tem ligação com a classe
    constructor() {
        this.produtos = lerDados('cardapio', []).map(p => new Produto(p.id, p.nome, p.preco, p.imagem));
    }
    // grava a lista no navegador
    salvar() { salvarDados('cardapio', this.produtos); }

    // create do CRUD, extrai os ids, tem o 0 que serve para lisra vazia, fazendo com que o primeiro prato receba id 1 já que 0+1=1, o +1 faz o novo id ser o id maior que já estava na lista mais 1.
    cadastrar(nome, preco, imagem) {
        const id = Math.max(0, ...this.produtos.map(p => p.id)) + 1;
        //cria o prato e coloca no fim da lista
        this.produtos.push(new Produto(id, nome, preco, imagem));
        this.salvar();
    }

    // read do CRUD, se chamar listar e não tiver nada a busca é um texto vazio
    listar(busca = '') {
        //devolve a lista onde os itens estejam com condição verdadeiro somente
        return this.produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
    }
    // devolve o primeiro prato com aquele id ou undefined se não tiver nenhum que bater
    buscar(id) { return this.produtos.find(p => p.id === id); }

    // update do CRUD, devolve o prato que está na lista e não uma cópia, mudar o nome muda o prato na lista mesmo
    atualizar(id, nome, preco, imagem) {
        const p = this.buscar(id);
        p.nome = nome;
        p.preco = preco;
        p.imagem = imagem;
        this.salvar();
    }
    // delete do CRUD, o filter mantem os pratos com id diferente do q vai ser removido, a nova lista substitui a antiga q tinha o prato apagado e salva, o filter não necessariamente apaga, só monta uma nova lista com o que sobrou
    remover(id) {
        this.produtos = this.produtos.filter(p => p.id !== id);
        this.salvar();
    }
    // com o some, se um prato no minimo tiver dentro da condição faz retornar verdadeiro, essa condição sendo ignorar maiusculo e minusculo e id diferente do idAtual
    nomeDuplicado(nome, idAtual) {
        return this.produtos.some(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== idAtual);
    }
}

// inicializa o objeto recebendo os dados, garantindo por padrão que o valor seja 1 na quantidade caso, não seja especificado
class ItemCarrinho {
    constructor(produto, quantidade = 1) {
        this.produto = produto;
        this.quantidade = quantidade;
    }
    // cria um valor em que computa o preço unitario multiplicando pela quantidade do produto, retornando o valor parcial do item na hora q é lido
    get subtotal() { return this.produto.preco * this.quantidade; }
}

// CRUD do carrinho, salva só o id e a quantidade o preço vem do cardápio
class Carrinho {
    constructor(cardapio) {
        // busca no sessionStorage os dados salvos com a chave carrinho
        this.itens = lerDados('carrinho', [])
            .map(s => {
                const p = cardapio.buscar(s.produtoId);
                return p && new ItemCarrinho(p, s.quantidade);
            })
            .filter(Boolean);
    }
    salvar() {
        salvarDados('carrinho', this.itens.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade })));
    }

    // soma 1 se o prato já estiver no carrinho, senão cria o item
    adicionar(produto) {
        const item = this.itens.find(i => i.produto.id === produto.id);
        if (item) item.quantidade++;
        else this.itens.push(new ItemCarrinho(produto));
        this.salvar();
    }
    // delta = +1 ou -1, a quantidade mínima é 1
    alterarQuantidade(id, delta) {
        const item = this.itens.find(i => i.produto.id === id);
        if (item) item.quantidade = Math.max(1, item.quantidade + delta);
        this.salvar();
    }
    remover(id) {
        this.itens = this.itens.filter(i => i.produto.id !== id);
        this.salvar();
    }
    limpar() {
        this.itens = [];
        this.salvar();
    }

    get quantidadeTotal() { return this.itens.reduce((soma, i) => soma + i.quantidade, 0); }
    get subtotal() { return this.itens.reduce((soma, i) => soma + i.subtotal, 0); }
    taxa(tipoEntrega) { return tipoEntrega === 'delivery' ? TAXA_ENTREGA : 0; }
    total(tipoEntrega) { return this.subtotal + this.taxa(tipoEntrega); }
}

// guarda uma foto do pedido: cliente, itens, tipo de entrega e total final
class Pedido {
    constructor(cliente, carrinho, tipoEntrega) {
        this.cliente = cliente;
        this.itens = carrinho.itens.map(i => ({
            nome: i.produto.nome, preco: i.produto.preco, quantidade: i.quantidade, subtotal: i.subtotal
        }));
        this.tipoEntrega = tipoEntrega;
        this.taxaEntrega = carrinho.taxa(tipoEntrega);
        this.total = carrinho.total(tipoEntrega);
    }
}

const cardapio = new Cardapio();
const carrinho = new Carrinho(cardapio);

// número de itens ao lado do link "Carrinho" no menu
function atualizarContador() {
    document.getElementById('contadorCarrinho').textContent = carrinho.quantidadeTotal;
}
atualizarContador();

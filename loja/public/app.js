async function carregarProdutos(url = "/produtos") {

const box = document.getElementById("produtos");

box.innerHTML = "<h2 style='padding:20px'>Carregando produtos...</h2>";

try {

const r = await fetch(url);
const data = await r.json();

console.log(data);

/* erro vindo da API */
if (data.errors) {
box.innerHTML =
"<h2 style='padding:20px'>Erro da API ao buscar produtos.</h2>";
return;
}

/* valida estrutura */
if (
!data ||
!data.data ||
!data.data.productOfferV2 ||
!data.data.productOfferV2.nodes ||
data.data.productOfferV2.nodes.length === 0
) {
box.innerHTML =
"<h2 style='padding:20px'>Nenhum produto encontrado.</h2>";
return;
}

const produtos = data.data.productOfferV2.nodes;

let html = "";

produtos.forEach(p => {

const nome = p.productName || "Produto";
const imagem = p.imageUrl || "";
const preco = Number(p.price || 0).toFixed(2);
const link = p.offerLink || "#";

html += `
<div class="card">
<img src="${imagem}" onerror="this.src='https://via.placeholder.com/300x300?text=Produto'">
<div class="title">${nome}</div>
<div class="price">R$ ${preco}</div>
<a class="btn" href="${link}" target="_blank">
Comprar
</a>
</div>
`;

});

box.innerHTML = html;

} catch (erro) {

console.log(erro);

box.innerHTML =
"<h2 style='padding:20px'>Erro ao carregar produtos.</h2>";

}

}

carregarProdutos();

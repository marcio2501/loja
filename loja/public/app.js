fetch("/produtos")
.then(r => r.json())
.then(data => {

console.log(data);

/* verifica se veio correto */
if (
!data ||
!data.data ||
!data.data.productOfferV2 ||
!data.data.productOfferV2.nodes
) {

document.getElementById("produtos").innerHTML =
"<h2 style='padding:20px'>Nenhum produto encontrado.</h2>";

return;
}

const produtos = data.data.productOfferV2.nodes;

let html = "";

produtos.forEach(p => {

html += `
<div class="card">
<img src="${p.imageUrl}">
<div class="title">${p.productName}</div>
<div class="price">R$ ${p.price}</div>
<a class="btn" href="${p.offerLink}" target="_blank">
Comprar
</a>
</div>
`;

});

document.getElementById("produtos").innerHTML = html;

})
.catch(erro => {

console.log(erro);

document.getElementById("produtos").innerHTML =
"<h2 style='padding:20px'>Erro ao carregar produtos.</h2>";

});

fetch("/produtos")
.then(r=>r.json())
.then(data=>{

const produtos = data.data.productOfferV2.nodes;

let html = "";

produtos.forEach(p=>{

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

});
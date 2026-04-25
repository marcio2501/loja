async function carregarProdutos(url = "/produtos") {

const box = document.getElementById("produtos");

box.className = "status";
box.innerHTML = "🔄 Carregando produtos...";

try {

const r = await fetch(url, {
cache: "no-store"
});

if (!r.ok) {
throw new Error("Falha na requisição");
}

const data = await r.json();

console.log(data);

/* =========================
   ERRO VINDO DA API
========================= */
if (data.errors || data.erro) {

box.innerHTML = "⚠️ Erro ao buscar produtos.";
return;

}

/* =========================
   VALIDA ESTRUTURA
========================= */
if (
!data ||
!data.data ||
!data.data.productOfferV2 ||
!data.data.productOfferV2.nodes ||
data.data.productOfferV2.nodes.length === 0
) {

box.innerHTML = "🛍️ Nenhum produto encontrado.";
return;

}

/* =========================
   PEGA 48 ITENS
========================= */
const produtos = data.data.productOfferV2.nodes.slice(0,48);

let html = '<div class="grid">';

/* =========================
   MONTA PRODUTOS
========================= */
produtos.forEach(p => {

const nome = (p.productName || "Produto")
.replace(/'/g,"")
.replace(/"/g,"");

const imagem = p.imageUrl || "";
const preco = Number(p.price || 0).toFixed(2);
const link = p.offerLink || "#";

html += `
<div class="card"
onclick="abrirModal('${nome}','${imagem}','${preco}','${link}')">

<div class="img-wrap">
<img 
src="${imagem}" 
alt="${nome}"
loading="lazy"
onerror="this.src='https://via.placeholder.com/300x300?text=Produto'">
</div>

<div class="title">${nome}</div>

<div class="price">R$ ${preco}</div>

<button
class="btn"
onclick="event.stopPropagation();window.open('${link}','_blank')">
Comprar
</button>

</div>
`;

});

html += "</div>";

box.className = "";
box.innerHTML = html;

} catch (erro) {

console.log(erro);

box.className = "status";
box.innerHTML = "❌ Erro ao carregar produtos.";

}

}

/* =========================
   BUSCA
========================= */
function buscarProduto() {

const termo = document
.getElementById("buscar")
.value
.trim();

if (!termo) {
carregarProdutos("/produtos");
return;
}

carregarProdutos("/buscar/" + encodeURIComponent(termo));

}

const campoBusca = document.getElementById("buscar");

if (campoBusca) {

campoBusca.addEventListener("keydown", function(e){

if (e.key === "Enter") {
buscarProduto();
}

});

}

/* =========================
   MODAL PRODUTO
========================= */
function abrirModal(nome,img,preco,link){

const modal = document.getElementById("modalProduto");

if(!modal) return;

document.getElementById("mImg").src = img;
document.getElementById("mTitulo").innerText = nome;
document.getElementById("mPreco").innerText = "R$ " + preco;

document.getElementById("mComprar").onclick = () => {
window.open(link,"_blank");
};

modal.style.display = "block";

}

function fecharModal(){

const modal = document.getElementById("modalProduto");

if(modal){
modal.style.display = "none";
}

}

const modalBox = document.getElementById("modalProduto");

if(modalBox){

modalBox.addEventListener("click", function(e){

if(e.target.id === "modalProduto"){
fecharModal();
}

});

}

/* =========================
   MENU CATEGORIAS
========================= */
function abrirCategoria(tipo){
carregarProdutos("/produtos/" + tipo);
}

/* =========================
   HEADER MINI AO ROLAR
========================= */
let ativo = false;
let rodando = false;

function atualizarHeader(){

const mini = window.scrollY > 70;

if(mini !== ativo){

const topo = document.getElementById("topo");

if(topo){
topo.classList.toggle("mini",mini);
}

ativo = mini;

}

rodando = false;

}

window.addEventListener("scroll", function(){

if(!rodando){

requestAnimationFrame(atualizarHeader);
rodando = true;

}

},{passive:true});

/* =========================
   INICIAR HOME
========================= */
carregarProdutos("/produtos");

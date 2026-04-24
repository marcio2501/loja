// ============================
// server.js
// ============================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;

const API_URL = "https://open-api.affiliate.shopee.com.br/graphql";

/* ============================
   CACHE
============================ */
let cacheHome = null;
let cacheTempo = 0;
const CACHE_MS = 10000; // 10 segundos

/* ============================
   ASSINATURA
============================ */
function gerarAuth(payload){

const timestamp = Math.floor(Date.now()/1000).toString();

const factor =
APP_ID +
timestamp +
payload +
APP_SECRET;

const signature = crypto
.createHash("sha256")
.update(factor)
.digest("hex");

return `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`;

}

/* ============================
   CONSULTA API
============================ */
async function buscarProdutos(keyword, limit = 10){

try{

const query = `
{
  productOfferV2(
    keyword:"${keyword}"
    limit:${limit}
  ){
    nodes{
      itemId
      productName
      imageUrl
      price
      offerLink
    }
  }
}`;

const payload = JSON.stringify({query});

const resposta = await fetch(API_URL,{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":gerarAuth(payload)
},
body:payload
});

const data = await resposta.json();

if(
data &&
data.data &&
data.data.productOfferV2 &&
data.data.productOfferV2.nodes
){
return data.data.productOfferV2.nodes;
}

return [];

}catch(e){

return [];

}

}

/* ============================
   FILTRO DO NICHO
============================ */
function filtrarNicho(lista){

const palavras = [

"umbanda",
"exu",
"pomba gira",
"preto velho",
"caboclo",
"orixa",
"orixá",
"guia",
"colar",
"pulseira",
"vela",
"7 dias",
"banho",
"descarrego",
"erva",
"arruda",
"guiné",
"alecrim",
"incenso",
"defumador",
"incensario",
"imagem",
"santo",
"religiosa",
"tarot",
"baralho cigano",
"cristal",
"ametista",
"quartzo",
"chakra",
"proteção",
"atabaque"

];

return lista.filter(p=>{

const nome =
(p.productName || "").toLowerCase();

return palavras.some(t =>
nome.includes(t)
);

});

}

/* ============================
   VITRINE NICHO REAL
============================ */
async function buscarMaisProcurados(){

if(
cacheHome &&
(Date.now() - cacheTempo < CACHE_MS)
){
return cacheHome;
}

const termos = [

"guia umbanda",
"exu umbanda",
"pomba gira",
"preto velho umbanda",
"caboclo umbanda",
"orixa umbanda",
"vela 7 dias espiritual",
"banho descarrego",
"ervas espirituais",
"arruda guiné",
"colar proteção espiritual",
"incenso espiritual",
"defumador casa",
"imagem umbanda",
"tarot espiritual",
"baralho cigano",
"cristal energia",
"quartzo rosa",
"ametista",
"atabaque umbanda"

];

/* embaralha */
termos.sort(()=>Math.random()-0.5);

/* escolhe 12 */
const escolhidos = termos.slice(0,12);

/* paralelo */
const promessas =
escolhidos.map(t=>buscarProdutos(t,8));

const resultados =
await Promise.all(promessas);

let todos = [];

resultados.forEach(lista=>{
todos = todos.concat(lista);
});

/* filtra nicho */
todos = filtrarNicho(todos);

/* remove repetidos */
const ids = new Set();

todos = todos.filter(p=>{

if(ids.has(p.itemId)){
return false;
}

ids.add(p.itemId);
return true;

});

/* embaralha */
todos.sort(()=>Math.random()-0.5);

/* maximo 50 */
todos = todos.slice(0,50);

const resposta = {
data:{
productOfferV2:{
nodes:todos
}
}
};

cacheHome = resposta;
cacheTempo = Date.now();

return resposta;

}

/* ============================
   HOME
============================ */
app.get("/produtos", async(req,res)=>{

const data = await buscarMaisProcurados();

res.json(data);

});

/* ============================
   BUSCA INTELIGENTE
============================ */
app.get("/buscar/:termo", async(req,res)=>{

const termo =
req.params.termo.toLowerCase().trim();

const lista = [

`${termo} umbanda`,
`${termo} espiritual`,
`${termo} religioso`,
`${termo} esoterico`,
`${termo} proteção`,
`${termo} exu`,
`${termo} guia`

];

const promessas =
lista.map(t=>buscarProdutos(t,12));

const resultados =
await Promise.all(promessas);

let todos = [];

resultados.forEach(r=>{
todos = todos.concat(r);
});

/* filtra nicho */
todos = filtrarNicho(todos);

/* remove repetidos */
const ids = new Set();

todos = todos.filter(p=>{

if(ids.has(p.itemId)){
return false;
}

ids.add(p.itemId);
return true;

});

/* maximo 50 */
todos = todos.slice(0,50);

res.json({
data:{
productOfferV2:{
nodes:todos
}
}
});

});

/* ============================
   HOME HTML
============================ */
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public/index.html"));
});

app.listen(10000,()=>{
console.log("Servidor ON");
});

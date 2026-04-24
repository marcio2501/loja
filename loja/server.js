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
   CACHE ULTRA RÁPIDO
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
   HOME DINÂMICA NICHO
============================ */
async function buscarMaisProcurados(){

/* cache 10 segundos */
if(
cacheHome &&
(Date.now() - cacheTempo < CACHE_MS)
){
return cacheHome;
}

const termos = [

"guia umbanda",
"exu",
"pomba gira",
"vela 7 dias",
"banho descarrego",
"colar proteção",
"incenso",
"imagem religiosa",
"preto velho",
"orixa",
"caboclo",
"ervas espirituais",
"amuleto proteção",
"tarot",
"baralho cigano",
"cristal",
"ametista",
"quartzo rosa",
"defumador",
"atabaque"

];

/* embaralha termos */
termos.sort(()=>Math.random()-0.5);

/* usa 12 termos por rodada */
const escolhidos = termos.slice(0,12);

/* busca paralelo */
const promessas =
escolhidos.map(t=>buscarProdutos(t,8));

const resultados =
await Promise.all(promessas);

let todos = [];

/* junta */
resultados.forEach(lista=>{
todos = todos.concat(lista);
});

/* remove repetidos */
const ids = new Set();

todos = todos.filter(p=>{

if(ids.has(p.itemId)){
return false;
}

ids.add(p.itemId);
return true;

});

/* embaralha produtos */
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

/* salva cache */
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
`${termo} proteção`

];

/* paralelo */
const promessas =
lista.map(t=>buscarProdutos(t,12));

const resultados =
await Promise.all(promessas);

let todos = [];

resultados.forEach(r=>{
todos = todos.concat(r);
});

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

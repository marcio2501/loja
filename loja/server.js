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
   CACHE HOME
   sempre renova ao atualizar
============================ */
let cacheHome = null;
let cacheTempo = 0;
const CACHE_MS = 1500;

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
async function buscarProdutos(keyword, limit = 12){

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
   FILTRO NICHO
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
"incensário",
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

const nome = (p.productName || "").toLowerCase();

return palavras.some(t => nome.includes(t));

});

}

/* ============================
   REMOVE REPETIDOS
============================ */
function removerDuplicados(lista){

const ids = new Set();

return lista.filter(p=>{

if(ids.has(p.itemId)){
return false;
}

ids.add(p.itemId);
return true;

});

}

/* ============================
   EMBARALHAR REAL
============================ */
function embaralhar(lista){

for(let i = lista.length - 1; i > 0; i--){

const j = Math.floor(Math.random() * (i + 1));

[lista[i], lista[j]] = [lista[j], lista[i]];

}

return lista;

}

/* ============================
   HOME 48 SEMPRE NOVA
============================ */
async function buscarMaisProcurados(force = false){

if(
!force &&
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
"atabaque umbanda",
"guia proteção",
"vela exu",
"banho espiritual",
"quartzo branco"

];

embaralhar(termos);

/* pega 18 termos diferentes */
const escolhidos = termos.slice(0,18);

const promessas =
escolhidos.map(t => buscarProdutos(t,8));

const resultados =
await Promise.all(promessas);

let todos = [];

resultados.forEach(lista=>{
todos = todos.concat(lista);
});

/* processa */
todos = filtrarNicho(todos);
todos = removerDuplicados(todos);
todos = embaralhar(todos);

/* 48 itens */
todos = todos.slice(0,48);

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
   sempre nova ao atualizar
============================ */
app.get("/produtos", async(req,res)=>{

const force = req.query.refresh === "1";

const data = await buscarMaisProcurados(force);

res.set("Cache-Control","no-store");

res.json(data);

});

/* ============================
   BUSCA 48 NOVA
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
`${termo} guia`,
`${termo} vela`,
`${termo} cristal`,
`${termo} banho`,
`${termo} incenso`,
`${termo} exu`,
`${termo} pomba gira`,
`${termo} caboclo`,
`${termo} preto velho`

];

embaralhar(lista);

const promessas =
lista.slice(0,12).map(t => buscarProdutos(t,8));

const resultados =
await Promise.all(promessas);

let todos = [];

resultados.forEach(r=>{
todos = todos.concat(r);
});

todos = filtrarNicho(todos);
todos = removerDuplicados(todos);
todos = embaralhar(todos);

/* 48 */
todos = todos.slice(0,48);

res.set("Cache-Control","no-store");

res.json({
data:{
productOfferV2:{
nodes:todos
}
}
});

});

/* ============================
   INDEX
============================ */
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public/index.html"));
});

/* ============================
   START
============================ */
app.listen(10000,()=>{
console.log("Servidor ON porta 10000");
});

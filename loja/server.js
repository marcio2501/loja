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
   CONSULTA
============================ */
async function buscarProdutos(keyword, limit = 30){

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
data.data.productOfferV2.nodes &&
data.data.productOfferV2.nodes.length > 0
){
return data.data.productOfferV2.nodes;
}

return [];

}catch(e){

return [];

}

}

/* ============================
   BUSCA VARIADA
============================ */
async function buscarVariados(){

const termos = [

"guia umbanda",
"exu",
"pomba gira",
"preto velho",
"caboclo",
"orixa",
"vela 7 dias",
"banho descarrego",
"ervas espirituais",
"colar proteção"

];

let todos = [];

for(const termo of termos){

const lista = await buscarProdutos(termo,3);

todos = todos.concat(lista);

}

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

/* maximo 30 */
todos = todos.slice(0,30);

return {
data:{
productOfferV2:{
nodes:todos
}
}
};

}

/* ============================
   HOME PRODUTOS VARIADOS
============================ */
app.get("/produtos", async(req,res)=>{

const data = await buscarVariados();

res.json(data);

});

/* ============================
   BUSCA INTELIGENTE
============================ */
app.get("/buscar/:termo", async(req,res)=>{

const termo = req.params.termo.toLowerCase().trim();

const lista = [
`${termo} umbanda`,
`${termo} espiritual`,
`${termo} religioso`
];

let todos = [];

for(const item of lista){

const r = await buscarProdutos(item,10);

todos = todos.concat(r);

}

const ids = new Set();

todos = todos.filter(p=>{

if(ids.has(p.itemId)){
return false;
}

ids.add(p.itemId);
return true;

});

todos = todos.slice(0,30);

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

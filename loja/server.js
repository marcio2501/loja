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
async function buscarProdutos(keyword, limit = 20){

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
return data;
}

return null;

}catch(e){
return null;
}

}

/* ============================
   FALLBACK
============================ */
async function buscarComFallback(lista){

for(const termo of lista){

const r = await buscarProdutos(termo,20);

if(r){
return r;
}

}

return {
data:{
productOfferV2:{
nodes:[]
}
}
};

}

/* ============================
   HOME
============================ */
app.get("/produtos", async(req,res)=>{

const data = await buscarComFallback([
"guia umbanda",
"exu",
"pomba gira",
"vela 7 dias",
"banho descarrego",
"colar proteção"
]);

res.json(data);

});

/* ============================
   BUSCA INTELIGENTE BLINDADA
============================ */
app.get("/buscar/:termo", async(req,res)=>{

const termo = req.params.termo.toLowerCase().trim();

const mapa = {

exu:["exu","imagem exu","estatua exu"],
vela:["vela 7 dias","vela espiritual","vela religiosa"],
guia:["guia umbanda","guia colar proteção"],
colar:["colar proteção","guia umbanda"],
erva:["ervas espirituais","arruda guiné alecrim"],
ervas:["ervas espirituais","arruda guiné alecrim"],
banho:["banho descarrego","banho espiritual"],
pomba:["pomba gira","imagem pomba gira"],
preto:["preto velho","imagem preto velho"],
caboclo:["caboclo","imagem caboclo"],
orixa:["orixa","imagem orixa"],
atabaque:["atabaque","tambor religioso"]

};

let lista = mapa[termo];

if(!lista){
lista = [
`${termo} umbanda`,
`${termo} espiritual`,
`${termo} religioso`
];
}

const data = await buscarComFallback(lista);

res.json(data);

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

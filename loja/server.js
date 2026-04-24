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

/* ===================================
   ASSINATURA SHOPEE
=================================== */
function gerarAuth(payload) {

const timestamp = Math.floor(Date.now() / 1000).toString();

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

/* ===================================
   CONSULTA API
=================================== */
async function buscarProdutos(keyword, limit = 20) {

try {

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

const payload = JSON.stringify({ query });

const resposta = await fetch(API_URL, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": gerarAuth(payload)
},
body: payload
});

const data = await resposta.json();

if (
data &&
data.data &&
data.data.productOfferV2 &&
data.data.productOfferV2.nodes &&
data.data.productOfferV2.nodes.length > 0
) {
return data;
}

return null;

} catch (erro) {
return null;
}

}

/* ===================================
   SISTEMA ANTI-FALHA
   testa várias keywords até achar
=================================== */
async function buscarComFallback(listaKeywords) {

for (const termo of listaKeywords) {

const resultado = await buscarProdutos(termo, 20);

if (resultado) {
console.log("ACHOU:", termo);
return resultado;
}

}

return {
data: {
productOfferV2: {
nodes: []
}
}
};

}

/* ===================================
   HOME ANTI-FALHA
=================================== */
app.get("/produtos", async (req, res) => {

const data = await buscarComFallback([

"incenso vela cristal tarot espiritual",
"religioso catolico santo terço vela",
"umbanda guia colar ervas banho",
"tarot baralho cigano cristal",
"esoterico pendulo runas amuleto"

]);

res.json(data);

});

/* ===================================
   UMBANDA
=================================== */
app.get("/produtos/umbanda", async (req, res) => {

const data = await buscarComFallback([

"umbanda guia colar exu pomba gira",
"caboclo preto velho orixa",
"ervas umbanda banho descarrego"

]);

res.json(data);

});

/* ===================================
   INCENSOS
=================================== */
app.get("/produtos/incensos", async (req, res) => {

const data = await buscarComFallback([

"incenso",
"defumador",
"incensario mirra"

]);

res.json(data);

});

/* ===================================
   TAROT
=================================== */
app.get("/produtos/tarot", async (req, res) => {

const data = await buscarComFallback([

"tarot",
"baralho cigano",
"runas pendulo"

]);

res.json(data);

});

/* ===================================
   CRISTAIS
=================================== */
app.get("/produtos/cristais", async (req, res) => {

const data = await buscarComFallback([

"cristal",
"ametista quartzo rosa",
"pedra chakra energia"

]);

res.json(data);

});

/* ===================================
   CATOLICO
=================================== */
app.get("/produtos/catolico", async (req, res) => {

const data = await buscarComFallback([

"terço crucifixo santo",
"nossa senhora sao jorge",
"biblia escapulario"

]);

res.json(data);

});

/* ===================================
   HOME HTML
=================================== */
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(10000, () => {
console.log("Servidor ON");
});

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
   ASSINATURA API SHOPEE
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
   HOME UMBANDA PROFISSIONAL
=================================== */
app.get("/produtos", async (req, res) => {

const data = await buscarComFallback([

"guia umbanda",
"exu",
"pomba gira",
"preto velho",
"caboclo",
"orixa",
"banho descarrego",
"ervas espirituais",
"vela 7 dias",
"imagem religiosa",
"atabaque",
"colar proteção"

]);

res.json(data);

});

/* ===================================
   GUIAS E COLARES
=================================== */
app.get("/produtos/guias", async (req, res) => {

const data = await buscarComFallback([

"guia umbanda",
"colar proteção",
"guia religiosa"

]);

res.json(data);

});

/* ===================================
   EXU E POMBA GIRA
=================================== */
app.get("/produtos/exu", async (req, res) => {

const data = await buscarComFallback([

"exu",
"pomba gira",
"imagem exu"

]);

res.json(data);

});

/* ===================================
   PRETO VELHO E CABOCLO
=================================== */
app.get("/produtos/entidades", async (req, res) => {

const data = await buscarComFallback([

"preto velho",
"caboclo",
"imagem religiosa umbanda"

]);

res.json(data);

});

/* ===================================
   BANHOS E ERVAS
=================================== */
app.get("/produtos/banhos", async (req, res) => {

const data = await buscarComFallback([

"banho descarrego",
"ervas espirituais",
"arruda guiné alecrim"

]);

res.json(data);

});

/* ===================================
   VELAS
=================================== */
app.get("/produtos/velas", async (req, res) => {

const data = await buscarComFallback([

"vela 7 dias",
"vela espiritual",
"vela religiosa"

]);

res.json(data);

});

/* ===================================
   ATABAQUE
=================================== */
app.get("/produtos/atabaque", async (req, res) => {

const data = await buscarComFallback([

"atabaque",
"tambor religioso"

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

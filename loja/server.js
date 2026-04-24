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

/* =========================
   FUNÇÃO CONSULTAR SHOPEE
========================= */
async function buscarProdutos(keyword, limit = 100) {

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

const timestamp = Math.floor(Date.now() / 1000).toString();

const factor = APP_ID + timestamp + payload + APP_SECRET;

const signature = crypto
.createHash("sha256")
.update(factor)
.digest("hex");

const auth =
`SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`;

const resposta = await fetch(API_URL, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": auth
},
body: payload
});

return await resposta.json();
}

/* =========================
   TODA LOJA GERAL
========================= */
app.get("/produtos", async (req, res) => {
try {

const data = await buscarProdutos(
"umbanda candomble quimbanda esoterico tarot catolico cristais incensos velas espiritual",
500
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   UMBANDA
========================= */
app.get("/produtos/umbanda", async (req, res) => {
try {

const data = await buscarProdutos(
"umbanda candomble quimbanda exu pomba gira preto velho caboclo orixa guia colar atabaque roupa branca ervas",
300
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   INCENSOS
========================= */
app.get("/produtos/incensos", async (req, res) => {
try {

const data = await buscarProdutos(
"incenso defumador mirra benjoim copal sandalwood resina incensario aromaterapia",
300
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   TAROT
========================= */
app.get("/produtos/tarot", async (req, res) => {
try {

const data = await buscarProdutos(
"tarot baralho cigano cartas oracle runas pendulo radiestesia toalha tarot",
300
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   CATOLICO
========================= */
app.get("/produtos/catolico", async (req, res) => {
try {

const data = await buscarProdutos(
"catolico santo nossa senhora sao jorge terço crucifixo escapulario medalha biblia anjo",
300
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   CRISTAIS
========================= */
app.get("/produtos/cristais", async (req, res) => {
try {

const data = await buscarProdutos(
"cristais pedras ametista quartzo rosa citrino obsidiana turmalina selenita energia chakra",
300
);

res.json(data);

} catch (erro) {
res.status(500).json({ erro: erro.message });
}
});

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(10000, () => console.log("Servidor ON"));

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
async function buscarProdutos(keyword, limit = 50) {

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

const data = await resposta.json();

return data;

} catch (erro) {

return {
erro: erro.message
};

}

}

/* =========================
   TODA LOJA
========================= */
app.get("/produtos", async (req, res) => {

const data = await buscarProdutos(
"umbanda candomble quimbanda esoterico tarot catolico cristais incensos velas espiritual",
50
);

res.json(data);

});

/* =========================
   UMBANDA
========================= */
app.get("/produtos/umbanda", async (req, res) => {

const data = await buscarProdutos(
"umbanda candomble quimbanda exu pomba gira preto velho caboclo orixa guia colar atabaque roupa branca ervas",
50
);

res.json(data);

});

/* =========================
   INCENSOS
========================= */
app.get("/produtos/incensos", async (req, res) => {

const data = await buscarProdutos(
"incenso defumador mirra benjoim copal sandalwood resina incensario aromaterapia",
50
);

res.json(data);

});

/* =========================
   TAROT
========================= */
app.get("/produtos/tarot", async (req, res) => {

const data = await buscarProdutos(
"tarot baralho cigano cartas oracle runas pendulo radiestesia toalha tarot",
50
);

res.json(data);

});

/* =========================
   CATOLICO
========================= */
app.get("/produtos/catolico", async (req, res) => {

const data = await buscarProdutos(
"catolico santo nossa senhora sao jorge terço crucifixo escapulario medalha biblia anjo",
50
);

res.json(data);

});

/* =========================
   CRISTAIS
========================= */
app.get("/produtos/cristais", async (req, res) => {

const data = await buscarProdutos(
"cristais pedras ametista quartzo rosa citrino obsidiana turmalina selenita energia chakra",
50
);

res.json(data);

});

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(10000, () => console.log("Servidor ON"));

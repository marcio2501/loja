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

/* ==================================
   FUNÇÃO CONSULTAR API SHOPEE
================================== */
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
    return { erro: erro.message };
  }
}

/* ==================================
   HOME - MELHOR ESTRATÉGIA
================================== */
/* mistura termos populares para trazer
   mais chance de ofertas aparecerem */
app.get("/produtos", async (req, res) => {

  const data = await buscarProdutos(
    "incenso vela cristal tarot guia colar imagem santo ervas banho espiritual umbanda candomble esoterico",
    20
  );

  res.json(data);

});

/* ==================================
   UMBANDA
================================== */
app.get("/produtos/umbanda", async (req, res) => {

  const data = await buscarProdutos(
    "umbanda guia colar exu pomba gira preto velho caboclo orixa",
    20
  );

  res.json(data);

});

/* ==================================
   CANDOMBLE
================================== */
app.get("/produtos/candomble", async (req, res) => {

  const data = await buscarProdutos(
    "candomble orixa guia colar atabaque roupa branca",
    20
  );

  res.json(data);

});

/* ==================================
   ESPIRITISMO
================================== */
app.get("/produtos/espiritismo", async (req, res) => {

  const data = await buscarProdutos(
    "espiritismo espiritual livro mediunidade energia",
    20
  );

  res.json(data);

});

/* ==================================
   ESOTÉRICO
================================== */
app.get("/produtos/esoterico", async (req, res) => {

  const data = await buscarProdutos(
    "tarot runas pendulo radiestesia cristal amuleto",
    20
  );

  res.json(data);

});

/* ==================================
   INCENSOS
================================== */
app.get("/produtos/incensos", async (req, res) => {

  const data = await buscarProdutos(
    "incenso defumador incensario mirra",
    20
  );

  res.json(data);

});

/* ==================================
   HOME HTML
================================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(10000, () => {
  console.log("Servidor ON");
});

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

app.get("/produtos", async (req, res) => {

try {

const query = `
{
  productOfferV2(limit:20){
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

const timestamp = Math.floor(Date.now()/1000).toString();

const factor = APP_ID + timestamp + payload + APP_SECRET;

const signature = crypto
.createHash("sha256")
.update(factor)
.digest("hex");

const auth =
`SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`;

const resposta = await fetch(API_URL,{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":auth
},
body:payload
});

const data = await resposta.json();

res.json(data);

} catch(erro){
res.status(500).json({erro:erro.message});
}

});

app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public/index.html"));
});

app.listen(10000, ()=> console.log("ON"));

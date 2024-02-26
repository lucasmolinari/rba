const express = require("express");

const port = 6969;
const app = express();

app.use(express.json());
app.set("port", port);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (_, res) => {
  res.send("API works").status(200);
});


// Transações: POST /clientes/[id]/transacoes
app.post("/clientes/:id/transacoes", (req, res) => {
    const id  = req.params.id;
    const body  = req.body;
    res.status(200); // TODO: Send JSON with 'limite' and  'saldo'
});

// Extrato: GET /clientes/[id]/extrato
app.get("/clientes/:id/extrato", (req, res) => {
    const { id } = req.params;
    res.send(`Extrato do cliente ${id}`).status(200);
});


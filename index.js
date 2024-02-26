import express from "express";
import { getUser, setBalance } from "./db/db.js";
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
//{
//     "valor": 1000,
//     "tipo" : "c",
//     "descricao" : "descricao"
// }
app.post("/clientes/:id/transacoes", (req, res) => {
  const id = req.params.id;
  const body = req.body;
  getUser(id)
    .then((row) => {
      const novoSaldo = row.saldo - body.valor;
      if (body.tipo === "d" && novoSaldo > -row.limite) {
        console.log("422");
        return res.status(422).json({ message: "Limite insuficiente" });
      }
      setBalance(id, novoSaldo);
      return res.status(200).json({ limite: row.limite, saldo: novoSaldo });
    })
    .catch((_) => {
      return res.status(404).json({ message: "Cliente não encontrado" });
    });
});

// Extrato: GET /clientes/[id]/extrato
app.get("/clientes/:id/extrato", (req, res) => {
  const { id } = req.params;
  res.send(`Extrato do cliente ${id}`).status(200);
});

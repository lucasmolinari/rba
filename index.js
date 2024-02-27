import express from "express";
import {
  getUser,
  updateBalance,
  resetUsers,
  updateLastTransactions,
  getTransactions,
} from "./db/db.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.set("port", port);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (_, res) => {
  res.send("API works").status(200);
});

app.post("/clientes/:id/transacoes", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  if (isNaN(id) || isNaN(parseFloat(id))) {
    return res.status(400).json({ message: "ID inválido" });
  }
  const user = await getUser(id);
  if (user === null) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }
  const novoSaldo = user.saldo - body.valor;
  if (body.tipo === "d" && novoSaldo < -user.limite) {
    console.log("422");
    return res.status(422).json({ message: "Limite insuficiente" });
  }
  await updateBalance(id, novoSaldo);
  await updateLastTransactions(id, {
    valor: body.valor,
    tipo: body.tipo,
    descricao: "descricao",
    realizada_em: new Date().toISOString(),
  });
  return res.status(200).json({ limite: user.limite, saldo: novoSaldo });
});

// Extrato: GET /clientes/[id]/extrato
app.get("/clientes/:id/extrato", (req, res) => {
  const { id } = req.params;
  res.send(`Extrato do cliente ${id}`).status(200);
});

app.delete("/reset", async (req, res) => {
  await resetUsers();
  res.status(200).json({ message: "Users reseted" });
});

import express from "express";
import {
  getUser,
  updateBalance,
  resetUsers,
  updateLastTransactions,
} from "./db/db.js";

const port = process.env.PORT || 9999;
const app = express();

app.use(express.json());
app.set("port", port);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// POST /clientes/[id]/transacoes
app.post("/clientes/:id/transacoes", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const isValid = await isBodyValid(body, id);
  if (!isValid) {
    return res.status(422).json({ message: "Dados inválidos" });
  }

  const user = await getUser(id);
  if (user === null) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }
  let newBalance;
  if (body.tipo === "d") {
    if (user.saldo - body.valor < -user.limite) {
      return res.status(422).json({ message: "Limite insuficiente" });
    }
    newBalance = user.saldo - body.valor;
  } else {
    newBalance = user.saldo + body.valor;
  }

  await updateBalance(id, newBalance);
  await updateLastTransactions(id, {
    valor: body.valor,
    tipo: body.tipo,
    descricao: body.descricao,
    realizada_em: new Date().toISOString(),
  });
  return res.status(200).json({ limite: user.limite, saldo: newBalance });
});

// Extrato: GET /clientes/[id]/extrato
app.get("/clientes/:id/extrato", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  if (user === null) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }
  const balance = {
    total: user.saldo,
    data_extrato: new Date().toISOString(),
    limite: user.limite,
  };
  res
    .status(200)
    .json({ saldo: balance, ultimas_transacoes: user.ultimas_transacoes });
});

app.delete("/reset", async (req, res) => {
  await resetUsers();
  res.status(200).json({ message: "Users reseted" });
});

async function isBodyValid(body, id) {
  if (isNaN(id) || isNaN(parseFloat(id))) {
    return false;
  }
  if (body.tipo !== "d" && body.tipo !== "c") {
    return false;
  }
  if (typeof body.valor !== "number") {
    return false;
  }
  if (body.descricao === "" || body.descricao.length > 10) {
    return false;
  }
  return true;
}

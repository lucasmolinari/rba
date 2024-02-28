import { Router } from "express";

import {
  getUser,
  updateBalance,
  resetUsers,
  updateLastTransactions,
} from "./db.js";

export const router = Router();
// POST /clientes/[id]/transacoes
router.post("/clientes/:id/transacoes", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const isValid = await isBodyValid(body, id);
  if (isValid !== true) {
    return res.status(422).json({ message: `Dados inválidos: ${isValid}` });
  }

  const user = await getUser(id);
  if (user === null) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }
  
  const newBalance = body.tipo === "d" ? user.saldo - body.valor : user.saldo + body.valor;
    if (newBalance < -user.limite) {
      return res.status(422).json({ message: "Limite insuficiente" });
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
router.get("/clientes/:id/extrato", async (req, res) => {
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

router.delete("/reset", async (req, res) => {
  await resetUsers();
  res.status(200).json({ message: "Users reseted" });
});

async function isBodyValid(body, id) {
  if (isNaN(id) || isNaN(parseFloat(id))) {
    return "id";
  }
  if (body.tipo !== "d" && body.tipo !== "c") {
    console.log(body.tipo)
    return "tipo";
  }
  if (typeof body.valor !== "number") {
    return "valor";
  }
  if (body.descricao === "" || body.descricao.length > 10) {
    return "desc";
  }
  return true;
}

export default router;

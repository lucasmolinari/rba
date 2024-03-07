import { Router } from "express";

import {
  getUser,
  updateLastTransactions,
  debitTransaction,
  creditTransaction,
} from "./db.js";

export const router = Router();

// POST /clientes/[id]/transacoes
router.post("/clientes/:id/transacoes", async (req, res) => {
  const body = await req.body;
  try {
    if (!["d", "c"].includes(body.tipo)) {
      return res.status(422).json({ error: "Tipo Inválido" });
    }
    if (!Number.isInteger(body.valor) || body.valor <= 0) {
      return res.status(422).json({ error: "Valor Inválido" });
    }
    if (body.descricao.length > 10 || body.descricao.length < 1) {
      return res.status(422).json({ error: "Descrição Inválida" });
    }

    const id = Number(req.params.id);
    if (isNaN(id) || !Number.isInteger(id))
      return res.status(422).json({ error: "ID Inválido" });
    if (id > 5 || id < 1)
      return res.status(404).json({ error: "Cliente não encontrado" });

    let userInfo;
    if (body.tipo === "c") {
      userInfo = await creditTransaction(id, body.valor);
    } else {
      userInfo = await debitTransaction(id, body.valor);
      if (!userInfo.isValid)
        return res.status(422).json({ error: "Limite excedido" });
    }
    await updateLastTransactions(id, {
      valor: body.valor,
      tipo: body.tipo,
      descricao: body.descricao,
      realizada_em: new Date().toISOString(),
    });
    return res
      .status(200)
      .json({ limite: userInfo.limite, saldo: userInfo.saldo });
  } catch (error) {
    return res.status(422).json({ error: error.message });
  } finally {
    console.log(`Transação: POST -> body: ${JSON.stringify(body)}\n`);
  }
});

// Extrato: GET /clientes/[id]/extrato
router.get("/clientes/:id/extrato", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id) || !Number.isInteger(id))
    return res.status(422).json({ error: "ID Inválido" });
  if (id > 5 || id < 1)
    return res.status(404).json({ error: "Cliente não encontrado" });
  try {
    const user = await getUser(id);
    const balance = {
      total: user.saldo,
      data_extrato: new Date().toISOString(),
      limite: user.limite,
    };

    return res
      .status(200)
      .json({ saldo: balance, ultimas_transacoes: user.ultimas_transacoes });
  } catch (error) {
    return res.status(422).json({ error: error.message });
  } finally {
    console.log(`Extrato: GET -> id: ${id}\n`);
  }
});

export default router;

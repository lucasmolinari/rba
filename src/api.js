import { Router } from "express";

import { getUser, updateUser } from "./db.js";

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
    if (!Boolean(body.descricao) || body.descricao.length > 10) {
      return res.status(422).json({ error: "Descrição Inválida" });
    }

    const id = req.params.id;
    const user = await getUser(id);
    if (user === null) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const newBalance =
      user.saldo + (body.tipo === "d" ? -body.valor : body.valor);
    if (newBalance < -user.limite) {
      return res.status(422).json({ error: "Limite excedido" });
    }

    await updateUser(
      id,
      newBalance,
      {
        valor: body.valor,
        tipo: body.tipo,
        descricao: body.descricao,
        realizada_em: new Date().toISOString(),
      },
      user.ultimas_transacoes
    );

    return res.status(200).json({ limite: user.limite, saldo: newBalance });
  } catch (error) {
    return res.status(422).json({ error: error.message });
  } finally {
    console.log(`Transação: POST -> body: ${JSON.stringify(body)}\n`);
  }
});

// Extrato: GET /clientes/[id]/extrato
router.get("/clientes/:id/extrato", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await getUser(id);
    if (user === null) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
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
    console.log(`\nExtrato: GET -> id: ${id}\n`);
  }
});

export default router;

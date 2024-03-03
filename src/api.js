import { Router } from "express";

import { getUser, updateUser, resetUsers } from "./db.js";

export const router = Router();

// POST /clientes/[id]/transacoes
router.post("/clientes/:id/transacoes", async (req, res) => {
  const body = await req.body;
  try {
    await isBodyValid(body);

    const id = req.params.id;
    const user = await getUser(id);
    if (user === null) {
      throw new Error("Cliente não encontrado");
    }

    const newBalance =
      user.saldo + (body.tipo === "d" ? -body.valor : body.valor);
    if (newBalance < -user.limite) {
      throw new Error("Limite excedido");
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
    if (error.message === "Cliente não encontrado") {
      return res.status(404).json({ error: error.message });
    }
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
      throw new Error("Cliente não encontrado");
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
    if (error.message === "Cliente não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(422).json({ error: error.message });
  } finally {
    console.log(`\nExtrato: GET -> id: ${id}\n`);
  }
});

router.delete("/reset", async (_, res) => {
  await resetUsers();
  res.status(200).json({ message: "Users reseted" });
});

async function isBodyValid(body) {
  if (!["d", "c"].includes(body.tipo)) {
    throw new Error("Tipo Inválido");
  }
  if (!Number.isInteger(body.valor) || body.valor <= 0) {
    throw new Error("Valor Inválido");
  }
  if (!Boolean(body.descricao) || body.descricao.length > 10) {
    throw new Error("Descrição Inválida");
  }
}

export default router;

import { MongoClient } from "mongodb";

const uri = "mongodb://mongo:pass@mongo:27017/rbe?authSource=admin";
let client;
let users;
async function run() {
  try {
    client = await MongoClient.connect(uri, { maxPoolSize: 50 });
    users = client.db("rbe").collection("users");
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("Failed to connect to MongoDB: \n", e.message);
  }
}

export async function getUser(id) {
  return await users.findOne(
    { _id: id },
    { projection: { saldo: 1, limite: 1, ultimas_transacoes: 1 } }
  );
}

export async function debitTransaction(id, valor, transacao) {
  return await users.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          saldo: {
            $cond: [
              {
                $gte: [
                  { $subtract: ["$saldo", valor] },
                  { $subtract: [0, "$limite"] },
                ],
              },
              { $subtract: ["$saldo", valor] },
              "$saldo",
            ],
          },
          isValid: {
            $cond: [
              {
                $gte: [
                  { $subtract: ["$saldo", valor] },
                  { $subtract: [0, "$limite"] },
                ],
              },
              true,
              false,
            ],
          },
          ultimas_transacoes: {
            $cond: [
              {
                $gte: [
                  { $subtract: ["$saldo", valor] },
                  { $subtract: [0, "$limite"] },
                ],
              },
              {
                $slice: [
                  {
                    $concatArrays: [[transacao], "$ultimas_transacoes"],
                  },
                  10,
                ],
              },
              "$ultimas_transacoes",
            ],
          },
        },
      },
    ],
    { returnDocument: "after", projection: { saldo: 1, limite: 1, isValid: 1 } }
  );
}

export async function creditTransaction(id, valor, transacao) {
  return await users.findOneAndUpdate(
    { _id: id },
    [
      { $set: { saldo: { $add: ["$saldo", valor] } } },
      {
        $set: {
          ultimas_transacoes: {
            $slice: [
              {
                $concatArrays: [[transacao], "$ultimas_transacoes"],
              },
              10,
            ],
          },
        },
      },
    ],
    { returnDocument: "after", projection: { saldo: 1, limite: 1 } }
  );
}

export async function updateLastTransactions(id, transacao) {
  await users.findOneAndUpdate({ _id: id }, [
    {
      $set: {
        ultimas_transacoes: {
          $slice: [
            {
              $concatArrays: [[transacao], "$ultimas_transacoes"],
            },
            10,
          ],
        },
      },
    },
  ]);
}
await run();
export default {
  getUser,
  updateLastTransactions,
  debitTransaction,
  creditTransaction,
};

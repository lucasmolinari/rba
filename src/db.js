import { MongoClient } from "mongodb";

const uri = "mongodb://mongo:pass@localhost:27017/rbe?authSource=admin";
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

export async function debitTransaction(id, valor) {
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
        },
      },
    ],
    { returnDocument: "after", projection: { saldo: 1, limite: 1, isValid: 1 } }
  );
}

export async function creditTransaction(id, valor) {
  return await users.findOneAndUpdate(
    { _id: id },
    { $inc: { saldo: valor } },
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
              $concatArrays: ["$ultimas_transacoes", [transacao]],
            },
            -10,
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

import mongoose from "mongoose";

async function run() {
  await mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(err));
}

export async function getUser(id) {
  return await mongoose.model("User").findById(id, "-_id");
}

export async function debitTransaction(id, valor) {
  return await mongoose.model("User").findByIdAndUpdate(
    id,
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
    { new: true }
  );
}

export async function creditTransaction(id, valor) {
  return await mongoose
    .model("User")
    .findByIdAndUpdate(
      id,
      { $inc: { saldo: valor } },
      { new: true, projection: { saldo: 1, limite: 1 } }
    );
}

export async function updateLastTransactions(id, transacao) {
  return await mongoose.model("User").findByIdAndUpdate(
    id,
    [
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
    ],
    { new: true }
  );
}

const url = `mongodb://mongo:pass@mongo:27017/rbe?authSource=admin`;

const transactionSchema = new mongoose.Schema(
  {
    valor: Number,
    tipo: String,
    descricao: String,
    realizada_em: Date,
  },
  { _id: false }
);
const userSchema = new mongoose.Schema({
  _id: Number,
  limite: Number,
  saldo: Number,
  ultimas_transacoes: [transactionSchema],
  isValid: Boolean,
});
const User = mongoose.model("User", userSchema);

run();
export default {
  getUser,
  updateLastTransactions,
  debitTransaction,
  creditTransaction,
};

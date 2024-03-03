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

export async function updateUser(id, saldo, transacao, last_transactions) {
  if (last_transactions.length >= 10) last_transactions.pop();
  last_transactions.unshift(transacao);
  await mongoose.model("User").findByIdAndUpdate(id, {
    saldo: saldo,
    ultimas_transacoes: last_transactions,
  });
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
});
const User = mongoose.model("User", userSchema);

run();
export default { getUser, updateUser };

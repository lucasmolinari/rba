import mongoose from "mongoose";

async function run() {
  await mongoose
    .connect(url)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));
  await insertUsers();
}

async function insertUsers() {
  for (const user of users) {
    if (await User.findOne({ id: user.id })) {
      continue;
    }
    const newUser = new User(user);
    await newUser.save();
  }
}

export async function getUser(id) {
  return await mongoose.model("User").findOne({ id: id }, "-_id");
}

export async function updateBalance(id, saldo) {
  await mongoose.model("User").updateOne({ id: id }, { saldo: saldo });
}

export async function resetUsers() {
  for (const user of users) {
    await User.findOneAndDelete({ id: user.id });
  }
  await insertUsers();
}

export async function updateLastTransactions(id, transacao) {
  let lastTransactions = await getTransactions(id);
  if (lastTransactions.length >= 10) {
    lastTransactions.pop();
  }
  lastTransactions.unshift(transacao);
  await User.updateOne({ id: id }, { ultimas_transacoes: lastTransactions });
}

export async function getTransactions(id) {
  const user = await getUser(id);
  return await user.ultimas_transacoes;
}

const url = `mongodb://mongo:pass@mongo:27017/rbe?authSource=admin`;
const users = [
  { id: 1, limite: 100000, saldo: 0, ultimas_transacoes: [] },
  { id: 2, limite: 80000, saldo: 0, ultimas_transacoes: [] },
  { id: 3, limite: 1000000, saldo: 0, ultimas_transacoes: [] },
  { id: 4, limite: 10000000, saldo: 0, ultimas_transacoes: [] },
  { id: 5, limite: 500000, saldo: 0, ultimas_transacoes: [] },
];

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
  id: Number,
  limite: Number,
  saldo: Number,
  ultimas_transacoes: [transactionSchema],
});
const User = mongoose.model("User", userSchema);

run();
export default { getUser, updateBalance, resetUsers, updateLastTransactions };

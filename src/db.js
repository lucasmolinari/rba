import mongoose from "mongoose";

async function run() {
  await mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(err));
  await insertInitialUsers();
}

async function insertInitialUsers() {
  for (const user of users) {
    if (await User.findById(user._id)) {
      continue;
    }
    const newUser = new User(user);
    await newUser.save();
  }
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

export async function resetUsers() {
  for (const user of users) {
    await User.findByIdAndDelete(user._id);
  }
  await insertInitialUsers();
}

const url = `mongodb://mongo:pass@mongo:27017/rbe?authSource=admin`;
const users = [
  { _id: 1, limite: 100000, saldo: 0, ultimas_transacoes: [] },
  { _id: 2, limite: 80000, saldo: 0, ultimas_transacoes: [] },
  { _id: 3, limite: 1000000, saldo: 0, ultimas_transacoes: [] },
  { _id: 4, limite: 10000000, saldo: 0, ultimas_transacoes: [] },
  { _id: 5, limite: 500000, saldo: 0, ultimas_transacoes: [] },
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
  _id: Number,
  limite: Number,
  saldo: Number,
  ultimas_transacoes: [transactionSchema],
});
const User = mongoose.model("User", userSchema);

run();
export default { getUser, updateUser, resetUsers };

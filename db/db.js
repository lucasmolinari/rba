import mongoose, { get } from "mongoose";

const url =
  "mongodb+srv://rba:iYO4QYuGObOsY2Yz@cluster0.hzusz0h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const users = [
  { id: 1, limite: 100000, saldo: 0 },
  { id: 2, limite: 80000, saldo: 0 },
  { id: 3, limite: 1000000, saldo: 0 },
  { id: 4, limite: 10000000, saldo: 0 },
  { id: 5, limite: 500000, saldo: 0 },
];
const userSchema = new mongoose.Schema({
  id: Number,
  limite: Number,
  saldo: Number,
});
const User = mongoose.model("User", userSchema);

async function run() {
  await mongoose.connect(url);
  console.log("Connected to MongoDB");

  for (const user of users) {
    if (await User.findOne({ id: user.id })) {
      continue;
    }
    const newUser = new User(user);
    await newUser.save();
    console.log(`Inserted user ${user.id}`);
  }
  //   mongoose.connection.close();
}

export async function getUser(id) {
  return await mongoose.model("User").findOne({ id: id });
}

export async function updateBalance(id, saldo) {
  await mongoose.model("User").updateOne({ id: id }, { saldo: saldo });
}

run().catch((err) => console.dir(err));

export async function clearUsers() {
  for (const user of users) {
    await User.findOneAndDelete({ id: user.id });
  }
}

export default { getUser, updateBalance, clearUsers };

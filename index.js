import express from "express";
import router from "./src/api.js";
import cluster from "cluster";
import os from "os";
const cpus = os.cpus().length;
const port = process.env.PORT || 9999;
const app = express();
app.use(express.json());
app.set("port", port);
app.use(router)

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, _c, _s) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Worker ${process.pid} started`)
  });
}

import mongoose from "mongoose";
import { success, error } from "consola";

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DN_NAME,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    success({ badge: true, message: "Database connected successfully!" })
  )
  .catch((err) => error({ badge: true, message: err.message }));

const db = mongoose.connection;

db.on("connected", () => {
  success({ badge: true, message: "Mongoose connected to db" });
});

db.on("error", (err) => {
  error({ badge: true, message: err.message });
});

db.on("disconnected", () => {
  success({ badge: true, message: "Mongoose connection is disconnected." });
});

process.on("SIGINT", async () => {
  await db.close();
  process.exit(0);
});

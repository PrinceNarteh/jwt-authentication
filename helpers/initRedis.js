import { success, error } from "consola";
import redis from "redis";

// create redis client
const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

client.on("connect", () => {
  success({ badge: true, message: "Client connected to redis..." });
});

client.on("ready", () => {
  success({
    badge: true,
    message: "Client connected to redis and ready to use...",
  });
});

client.on("error", (err) => {
  error({ badge: true, message: err.message });
});

client.on("end", (err) => {
  success({ badge: true, message: "Client disconneced from redis." });
});

process.on("SIGINT", () => {
  client.quit();
});

export default client;

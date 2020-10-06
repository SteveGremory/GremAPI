import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Routes/authRoutes";
import actionRoutes from "./Routes/actionRoutes";
import http from "http";
import socketIO from "socket.io";
//import {checkVPN} from "./Middleware/Check-VPN.js"

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json({ limit: "10mb" }));

//run when a client connects
io.on("connection", (socket) => {
  console.log("socket");
});

app.use("/api/users", authRoutes);

app.use("/api/actions", actionRoutes);

app.get("/", (req, res) => {
  res.send("Welcome To The Grem API!");
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Open up http://localhost:${5000}`);
});

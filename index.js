import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Routes/authRoutes.js";
import contentRoutes from "./Routes/contentRoutes.js";
//import {checkVPN} from "./Middleware/Check-VPN.js"

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb" }));

app.use("/api/users", authRoutes);

app.use("/api/content", contentRoutes);

app.get("/", (req, res) => {
  res.send("Welcome To The Grem API!");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Open up http://localhost:${5000}`);
});

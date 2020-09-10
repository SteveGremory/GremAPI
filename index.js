import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Routes/authRoutes.js";

import mongoose from 'mongoose';
mongoose.connect("mongodb+srv://" + process.env.MONGO_ATLAS_PW + "@cluster0.kplqa.mongodb.net/Grem?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();

app.use(bodyParser.json());

app.use('/users', authRoutes)

app.get("/", (req, res) => {
    res.send("HelloFromHomePage")
});

app.listen(5000, () => {
    console.log(`Open up http://localhost:${5000}`);
});
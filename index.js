import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Routes/authRoutes.js";
import contentRoutes from './Routes/contentRoutes.js'
//import {checkVPN} from "./Middleware/Check-VPN.js"

import mongoose from 'mongoose';
mongoose.connect("mongodb+srv://" + process.env.MONGO_ATLAS_PW + "@cluster0.kplqa.mongodb.net/Grem?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();

app.use(bodyParser.json());

app.use('/users', authRoutes)

app.use('/api/content', contentRoutes)

app.get("/", (req, res) => {
    res.send("Welcome To The Grem API!")
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Open up http://localhost:${5000}`);
});
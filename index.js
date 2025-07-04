const express = require("express");
const server = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const cookieParser=require("cookie-parser");
// const session = require('express-session');


const jwt=require("jsonwebtoken");
secretKey=process.env.JWT_TOKEN;


var corsOptions = {
    origin: "*",
    optionSuccessstatus: "200",
    credentials: true
}
server.use(cors(corsOptions));



server.use(express.json());
server.use(cookieParser());
const dataRoutes  = require("./routes/logroutes");
console.log(dataRoutes);
server.use("/assets/pdf/", express.static(path.join(__dirname, "/assets/pdf/")));

// console.log(dataRoutes);
server.use("/data", dataRoutes);
const PORT = process.env.PORT;



server.listen(PORT, () => { console.log(`server runningon ${PORT}`); });
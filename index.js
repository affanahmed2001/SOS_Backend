const express = require("express");
const server = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");


var corsOptions = {
    origin: "*",
    optionSuccessstatus: "200"
}
server.use(cors(corsOptions));
server.use(express.json());

server.use("/assets/pdf/", express.static(path.join(__dirname, "/assets/pdf/")));


const data = require("./routes/logroutes");
const { error } = require("console");
server.use("/data", data);
const PORT = process.env.PORT;


server.listen(PORT, () => { console.log('server running'); });

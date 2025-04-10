const express = require("express");
const server = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const session = require('express-session');


var corsOptions = {
    origin: "http://localhost:5173",
    optionSuccessstatus: "200",
    credentials: true
}
server.use(cors(corsOptions));
server.use(express.json());

server.use("/assets/pdf/", express.static(path.join(__dirname, "/assets/pdf/")));

server.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

const data = require("./routes/logroutes");
const { error } = require("console");
server.use("/data", data);
const PORT = process.env.PORT;


server.listen(PORT, () => { console.log('server running'); });

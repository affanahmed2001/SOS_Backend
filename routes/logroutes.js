const express = require("express");
const { uploadpdf,uploadcsv } = require("../multer");
const { getData, createData,getPdf,createCsv } = require("../controller/logController");

const router = express.Router();

// Coonection 
router.get('/get', async (req, res) => {
    getData(req, res);
});

router.post("/create", uploadpdf.single("cv"), async (req, res) => {
    createData(req, res);
});

router.post("/pdf/upload", uploadpdf.single("file"),async(req,res)=>{
    getPdf(req,res);
});

router.post("/csvupload",uploadcsv.single("file"),async(req,res)=>{
    createCsv(req,res);
})



module.exports = router
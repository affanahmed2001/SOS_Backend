const express = require("express");
const { uploadpdf,uploadcsv } = require("../multer");
const { getData, createData,getPdf,createCsv,exportCsv,updateData,getLead_id } = require("../controller/logController");

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
});

router.get("/export", async (req,res)=>{
    exportCsv(req,res);
});

router.put("/update/:lead_id",uploadpdf.single("cv"), async (req, res) => {
    updateData(req, res);
});

// router.get("/data/:lead_id", async (req,res)=>{
//     getLead_id(req,res);
// });
router.get("/data/:lead_id", getLead_id);

// router.put('/api/update-lead/:id', uploadpdf.single('file'), updateData);



module.exports = router
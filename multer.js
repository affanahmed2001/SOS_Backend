const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets/pdf"); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};


const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets/CSV");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter1 = (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

const uploadpdf = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
});
const uploadcsv = multer({
    storage:storage1, fileFilter:fileFilter1,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
});

module.exports = { uploadpdf,uploadcsv };

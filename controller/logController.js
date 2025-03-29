const { executeQuery } = require("../config/db.js");
const fs = require("fs");
const fastCsv = require("fast-csv");
const path = require("path")
const csvParser = require('csv-parser');


// Connection
const getData = async (req, res) => {
    try {
        const query = `SELECT * FROM tbl_lead`;
        const result = await executeQuery(query);
        // console.log(result);

        if (!result) {
            res.send({
                success: false,
                message: "Could not get all data",
            });
        }
        res.send({
            success: true,
            message: "All data get successfully",
            // result:[result.length],
            result,
        });
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            message: "Error in getting details",
            error,
        });
    }
}

// Create
const createData = async (req, res) => {
    try {
        const { names, email, phone, designation, city, FBID } = req.body;

        if (!names || !email || !phone || !designation || !city || !FBID) {
            return res.status(400).json({ success: false, message: "Provide all details" });
        }

        const filePath = req.file ? req.file.path : null;
        // console.log("File Path:", filePath); 


        const query = `INSERT INTO tbl_lead (name,email,phone,designation,file_path,city,FBID,created_date) VALUES (?,?,?,?,?,?,?,NOW())`;


        // console.log("Executing Query:", executeQuery, [names, email, phone, designation, filePath]);
        const result = await executeQuery(query, [names, email, phone, designation, filePath, city, FBID]);
        // console.log("Query Result:", result);
        // console.log("DB Insert Result:", result);



        res.status(201).json({
            success: true,
            message: "Data Created Successfully",
            data: { names, email, phone, designation, filePath, city, FBID, created_date: Date.now() },
        });
        // console.log(names,email,phone,designation,filePath,city,FBID );

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error in creating data", error: error.message });
    }
};

const getPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.send("file not selected");

        }
        res.send("PDF uploaded successfully");
    }
    catch {
        console.log('Error in fetching pdf');
    }
}

const createCsv = async (req, res) => {
    // console.log("Request received!");
    // console.log("req.file:", req.file);

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Please upload a CSV file." });
    }

    const filePath = req.file.path;
    // console.log("File Path:", filePath);

    if (!filePath) {
        return res.status(400).json({ error: "File path is undefined. Check Multer configuration." });
    }

    try {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (data) => {
                if (!data.cv) data.cv = null;
                results.push(data);
            })
            .on("end", async () => {
                try {
                    console.log("CSV Data:", results);

                    const query = `
                        INSERT INTO tbl_lead
                        (name, email, phone, designation, city, fbid, created_date)
                        VALUES ?
                    `;



                    const values = results.map(row => [
                        // row.lead_id,
                        row.names || row.name,
                        row.email,
                        row.phone,
                        row.designation,
                        row.city,
                        row.fbid,
                        new Date()
                    ]);

                    if (values.length === 0) {
                        return res.status(400).json({ success: false, message: "CSV contains no valid data." });
                    }

                    await executeQuery(query, [values]);

                    fs.unlinkSync(filePath);

                    res.status(201).json({
                        success: true,
                        message: "CSV uploaded and data inserted successfully",
                        inserted: values.length
                    });

                } catch (dbError) {
                    console.error("Database Error:", dbError);
                    res.status(500).json({ success: false, message: "Error inserting into database", error: dbError.message });
                }
            })
            .on("error", (error) => {
                console.error("Error processing CSV:", error);
                res.status(500).json({ error: "Error processing CSV file" });
            });

    } catch (error) {
        console.error("Unhandled Error:", error);
        res.status(500).json({
            success: false,
            message: "Error in uploading CSV",
            error: error.message,
        });
    }
};

const exportCsv = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            res.send({
                success: false,
                message: "Set the start date and end date"
            });
        }
        const query = ` SELECT name, email, phone, designation, city, fbid, created_date
    FROM tbl_lead
    WHERE created_date BETWEEN ? AND ?`;

        const data = await executeQuery(query, [start_date, end_date]);

        if (!data || data.length === 0) {
            return res.send({
                success: false,
                message: "Data not found"
            });
        }


        // const writeStream = fs.createWriteStream(filePath);
        const dirPath = path.join(__dirname, "../assets/exports/");
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, "leads.csv");
        const writeStream = fs.createWriteStream(filePath);

        console.log("Writing CSV to:", filePath);


        fastCsv
            .write(data, { headers: true })
            .pipe(writeStream)
            .on("finish", () => {

                // console.log("CSV file written successfully:", filePath);

                res.download(filePath, "leads.csv", (err) => {
                    if (err) {
                        console.error("Download Error:", err);
                        res.status(500).json({ 
                            success: false, 
                            message: "Error downloading file." 
                        });
                    } 
                });
            });

    } catch (error) {
        console.error("export error", error);
        res.send({
            success: false,
            message: "Error in exporting data",
            error,
        })
    }
}




module.exports = { getData, createData, getPdf, createCsv, exportCsv }
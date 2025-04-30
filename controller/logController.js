const { executeQuery } = require("../config/db");
const fs = require("fs");
const fastCsv = require("fast-csv");
const path = require("path");
const os = require("os");
const csvParser = require('csv-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')



// Connection
const getData = async (req, res) => {
    try {
        const query = `SELECT * FROM tbl_lead`;
        const result = await executeQuery(query);

        if (result.length === 0) {
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

// GET PDF
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

// CREATE CSV
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

// EXPORT CSV
const exportCsv = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
            res.send({
                success: false,
                message: "Set the start date and end date",
            });
            return;
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


        const fileName = `leads_${start_date}-${end_date}.csv`;
        const downloadsPath = path.join(os.homedir(), "Downloads");
        const filePath = path.join(downloadsPath, fileName);
        const writeStream = fs.createWriteStream(filePath);
        // console.log("Writing CSV to:", filePath);


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

// UPDATE DATA
const updateData = async (req, res) => {
    try {
        const { lead_id, name, email, phone, designation, city } = req.body;


        if (!lead_id) {
            return res.status(400).json({
                success: false,
                message: "Provide lead_id",
            });
        }


        const filePath = req.file ? req.file.path : null;


        const query = "UPDATE tbl_lead SET name=?,email=?,phone=?,designation=?,file_path=?,city=?,created_date=NOW() WHERE lead_id=?";
        const result = await executeQuery(query, [name, email, phone, designation, filePath, city, lead_id]);

        // console.log("data =>", result);

        return res.status(200).json({
            success: true,
            message: "Lead updated ",
            data: { name, email, filePath },
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            message: "Error in Updating the data",
            error,
        });
    }
}

// GET LEAD_ID
const getLead_id = async (req, res) => {
    try {
        const { lead_id } = req.params;

        if (!lead_id) {
            return res.status(400).json({ message: "Provide Lead ID" });
        }

        // console.log('LeadId:', lead_id);

        const query = "SELECT * FROM tbl_lead WHERE lead_id = ?";
        const result = await executeQuery(query, [lead_id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.send({
            message: "Couldn't get the lead id"
        });
    }
};

// LOGIN 
const login = async (req, res) => {
  try {
    const { u_email, u_password } = req.body;

    if (!u_email || !u_password) {
      return res.send({
        success: false,
        message: "Provide email or password",
      });
    }

    const query = `SELECT * FROM tbl_user WHERE u_email=?`;
    const result = await executeQuery(query, [u_email]);

    if (result.length === 0) {
      return res.send({
        success: false,
        message: "Wrong Email",
      });
    }

    const user = result[0];

    const isHashed = user.u_password.startsWith('$2b$'); 
    
    if (!isHashed) {
      const hashedPassword = await bcrypt.hash(user.u_password, 10);

      await executeQuery(
        `UPDATE tbl_user SET u_password = ? WHERE u_id = ?`,
        [hashedPassword, user.u_id]
      );
      
      const isMatch = await bcrypt.compare(u_password, hashedPassword);
      if (!isMatch) {
        return res.json({
          success: false,
          message: 'Wrong password',
        });
      }
    } else {
      const isMatch = await bcrypt.compare(u_password, user.u_password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: 'Wrong password',
        });
      }
    }

    const token = jwt.sign(
        { id: user.u_id, email: user.u_email, name: user.u_name },
        secretKey,
        { expiresIn: "1d" }
      );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: user.u_email,
        name: user.u_name,
      },
    });

  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};


// LOGOUT
const logout = async (req, res) => {
    return res.send({
      success: true,
      message: "Logged out successfully. Please remove the token on client side.",
    });
  };

module.exports = { getData, createData, getPdf, createCsv, exportCsv, updateData, getLead_id, login, logout }; 
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_TOKEN;


const authenticationToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({
            success: false,
            errorCode: 1,
            message: "Token not found"
        });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.json({
            message: "Invalid Token or Token expirs",
            error: error.message
        });
    }
}

module.exports = { authenticationToken }
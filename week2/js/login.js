const bcrypt = require('bcrypt');
const sql = require('./db.js');
const jwt = require('jsonwebtoken');

// Token generation :: using digitalocean tutorial for JWT
const generateAccessToken = (async (username) => {
    const userId = await findUserType(username);
    const payload = { user: userId }
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
})

// Authenticate token using express.js middleware
function authenticateToken(requiredRole) {


    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(token == null) return res.status(401).json({ message: 'Unauthorized: No token provided' });

        try {
            const decoded = jwt.decode(token, process.env.TOKEN_SECRET);
            req.user = decoded;
            const userId = decoded.user[0].id;
            result = await checkUserId(userId);
        
            if (result[0].user_type.length === 0) {
                return res.status(403).json({ message: "User not found."});
            }

            const userRole = result[0].user_type;

            if (requiredRole.length && !requiredRole.includes(userRole)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
            next();

        } catch (error) {
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        }
    }
};

const loginHandler = async (findUser, password)  =>  {
    const [verifyUser] = await sql`
    SELECT * FROM users
    WHERE username = ${findUser}`;

    if (!verifyUser) return false;

    result = await bcrypt.compare(password, verifyUser.password)
    if (!result) return false;
    return result;
};

const checkUserId = async (userId) => {
    try {
        const query = await sql`
        SELECT user_type FROM users
        WHERE id = ${userId}`;

        return query;
    } catch (error) {
        console.error("Error in checkUserId: ", error.message);
        throw new Error("Error fetching ID");
    }  
}

const findUserType = async (username) => {
    try {
        const query = await sql`
        SELECT id FROM users
        WHERE username = ${username}`;
    
        return query;
    } catch (error) {
        console.error("Error in findUserType: ", error.message);
        throw new Error("Error fetchin user type");
    }
}

module.exports = { loginHandler, generateAccessToken, authenticateToken };
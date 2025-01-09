const bcrypt = require('bcrypt');
const sql = require('./db.js');


const loginHandler = async (findUser, password)  =>  {
    const admin_user = "admin";
    const [verifyUser] = await sql`
    SELECT * FROM users
    WHERE email = ${findUser}`;

    if (!verifyUser) return false;
    
    if (verifyUser.user_type == admin_user) {
        return result = await bcrypt.compare(password, verifyUser.password);
    }
    if (!result) return false;
};

module.exports = { loginHandler };
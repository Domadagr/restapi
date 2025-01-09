const bcrypt = require('bcrypt');
const sql = require('../db.js');


const loginHandler = async (findUser, password)  =>  {
    const [findUserPasswordHash] = await sql`
    SELECT password FROM users
    WHERE user = ${findUser}`;

    console.log(findUserPasswordHash);

    if (!findUserPasswordHash) {
        return false;
    } 
    
    const result = await bcrypt.compare(password, findUserPasswordHash.password);
    return result;
};

module.exports = { loginHandler };
//import verify from jwt
const {verify} = require('jsonwebtoken');

//Check if authenticated
const isAuth = req => {
    const authorization = req.headers['authorization'];
    if(!authorization) throw new Error('You need to login');

    //Bearer token
    const token = authorization.split(' ')[1];
    const {userId,role} = verify(token, process.env.ACCESS_TOKEN_SECRET);
    return {userId,role};
}

//Export the function
module.exports = {
    isAuth
}
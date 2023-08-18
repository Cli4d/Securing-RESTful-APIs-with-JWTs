//import sign from jwt
const {sign} = require('jsonwebtoken');

//Create access token function
const createAccessToken = (userId,role) => {
    return sign({userId,role}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    });
}

//Create refresh token function
const createRefreshToken = (userId,role) => {
    return sign({userId, role}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    });
}

//Send access token as a regular response
const sendAccessToken = (req, res, accessToken) => {
    res.send({
        accessToken,
        email: req.body.email
    });
}

//Send refresh token as a cookie
const sendRefreshToken = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/refresh_token'
    });
}

//export the different functions
module.exports = {  
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
}
//Bringing dependencies
require('dotenv/config');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify} = require('jsonwebtoken');
const {hash, compare} = require('bcryptjs');

//import in the database
const {userDataDB} = require('./userDataDB.js');
const {booksDB} = require('./BooksDB.js');

//import token functions
const {createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken} = require('./token.js');

//import auth function
const {isAuth} = require('./auth.js');


//Flow of the Books API

//1. New customers register
//2. Existing customers login
//3. Customers can view all books
//4. Customers can't add books
//5. Admins can add books
//6. Both customers and admins can generate a new access token using their refresh token

//Enab
app.use(express.json()); //Allowing us to access the request body as req.body
app.use(cookieParser()); //Allowing us to access the cookies as req.cookies
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));// Allows us to send cookies from a different domain
//enable url encoding for sending data through the url
app.use(express.urlencoded({extended: true}));

//Register a user
app.post('/register', async (req, res) => {
    const {email, password} = req.body;
    try {
        //1. Check if user exists
        const user = userDataDB.find(user => user.email === email);
        //2. If user exists, throw error
        if(user) throw new Error('User already exists');
        //3. If user doesn't exist, hash the password
        const hashedPassword = await hash(password, 10);
        //4. Insert the user in database
        userDataDB.push({
            id: userDataDB.length,
            email,
            password: hashedPassword,
            role: 'user'
        });
        //Send response to client
        res.send({
            message: 'User created successfully'
        });
        console.log(userDataDB);
    } catch (error) {
        res.json({error: error.message});
    }
})

//Login a user
app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        //1. Find user in database. If not found, throw error
        const user = userDataDB.find(user => user.email === email);
        if(!user) throw new Error('User does not exist');
        //2. Compare crypted password and see if it checks out. If not, throw error
        const valid = await compare(password, user.password);
        if(!valid) throw new Error('Password not correct');
        //3. Create refresh and access token
        const accessToken = createAccessToken(user.id, user.role);
        const refreshToken = createRefreshToken(user.id, user.role);
        //4. Put the refresh token in the database
        user.refreshToken = refreshToken;
        //5. Send token. Refresh token as a cookie and access token as a regular response
        sendRefreshToken(res, refreshToken);
        sendAccessToken(req, res, accessToken);
    } catch (error) {
        res.json({error: error.message});
    }
})

//User checks available books from books endpoint. Confirm role is user
app.get('/books', async (req, res) => {
    try {
        //1. Check if user is logged in
        const {role} = isAuth(req);
        if(role !== 'user' && role !== 'admin') throw new Error('Not authorized');
        //3. Send books
        res.json(booksDB);
    } catch (error) {
        res.json({error: error.message});
    }
})

//Admin adds a book to the books endpoint. Confirm role is admin
app.post('/books', async (req, res) => {
    const {title, author, genre, year} = req.body;
    try {
        //1. Check if user is logged in
        const {role} = isAuth(req);
        if(role !== 'admin') throw new Error('Not authorized');
        //3. Add book to database
        booksDB.push({
            title,
            author,
            genre,
            year
        });
        //4. Send response
        res.json({
            message: 'Book added successfully'
        });
        console.log(booksDB);
    } catch (error) {
        res.json({error: error.message});
    }
})

//User and admin can generate a new access token using their refresh token
app.post('/refresh_token', (req, res) => {
    const token = req.cookies.refreshToken;
    //If we don't have a token in our request
    if(!token) return res.send({accessToken: ''});
    //If we have a token, verify it
    let payload = null;
    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        return res.send({accessToken: ''});
    }
    //Token is valid, check if user exists
    const user = userDataDB.find(user => user.id === payload.userId);
    if(!user) return res.send({accessToken: ''});
    //User exists, check if refresh token exists on user
    if(user.refreshToken !== token) return res.send({accessToken: ''});
    //Token exists, create new refresh and access token
    const accessToken = createAccessToken(user.id, user.role);
    const refreshToken = createRefreshToken(user.id, user.role);
    //Update refresh token on user in database
    user.refreshToken = refreshToken;
    //Send new refresh token and access token
    sendRefreshToken(res, refreshToken);
    return res.send({accessToken});
})

//Logout a user
app.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {path: '/refresh_token'});
    return res.send({
        message: 'Logged out'
    });
})

//listen to port
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})


//Usecases
//1. User registers
//2. User logs in
//3. User gets new access token using refresh token
//4. User logs out
//5. Admin logs in
//6. Admin adds a book
//7. Admin gets new access token using refresh token
//8. Admin logs out
//9. User tries to add a book
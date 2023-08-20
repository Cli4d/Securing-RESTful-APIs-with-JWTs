# Securing-RESTful-APIs-with-JWTs

This is a repository for the workshop explaining about JSON Web Tokens and how the improve the security of RESTful APIs

## How to run the project

1. Clone the repository
2. `cd Code` to move into the `Code` folder
3. Run `npm install` in the root folder
4. Create a .env file in the root folder and add the following variables
    - PORT
    - DB_CONNECTION
    - TOKEN_SECRET
5. Run `npm start` in the Code folder to start the server
6. Test the API using Postman or any other API testing tool.
7. Remember the credentials to test adding books in the `/books` route are:
    - email: `cliffordouma@gmail.com`
    - password: `admin`
These are in the `userDataDb.js` file in the `Code` folder and can be changed if you want to.

<!-- Attribution: https://github.com/weibenfalk/jwtToken-react-express -->

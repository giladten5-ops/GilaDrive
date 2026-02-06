const express = require('express')
const UserSchema = require('../models/UserSchema');
const app = express()
app.use(express.json({ limit: "10mb" }));
const jwt = require('jsonwebtoken');
const key = 'this is the secret key of BGE (Benny Gilad and Ilya)';
const userModel = require('../models/users');

const login = async (req, res) => {
    const { username, password } = req.body;
    //check user exists and password is correct and save user data
    const user = await UserSchema.findOne({ username, password });
    if (!user) {
        return res.status(401).json({ error: "Invalid username and/or password" });
    }

    //generate the JWT for 24h using user ID and username
    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, key, { expiresIn: '24h' });
    res.status(201).json({ token,
         userId: user._id.toString(),
         name: user.name,
         image: user.image
     });
};

//this is the main middleware function to verify tokens before allowing access to protected routes
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    //check if token is in the header and is of Bearer type (standard format)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Token required" });
    }
    //get just the token part
    const token = authHeader.split(" ")[1];

    try {
        //check the token and returns {userId, username , iat, exp}
        const decoded = jwt.verify(token, key);
        //add user metadata to the request object for later use
        const user = await UserSchema.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }
        req.user = { id: user._id.toString(), username: user.username };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = { login, verifyToken };

const crypto = require("crypto");
const UserSchema = require("./UserSchema");
const mongoose = require("mongoose");

// we will now migrate to using MongoDB with Mongoose

async function createUser({username, password, name, image}) {
    try {
    const newUser = new UserSchema({
        username: username.trim(),
        password,
        name: name.trim(),
        image,
    });
    return await newUser.save();
} catch (err) {
    if (err.code === 11000) {
        throw new Error("Username already exists.");
    }
    if (err.name === 'ValidationError' && err.errors.password && err.errors.password.kind === 'minlength') {
        throw new Error("Password must be at least 8 characters long.");
    }
    throw err;
}
}

async function getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await UserSchema.findById(id);
}

async function findUserByCredentials(username, password) {
    return await UserSchema.findOne({ username, password }) || null;
}   

async function getUserId(username) {
    const user = await UserSchema.findOne({ username });
    return user ? user.id : null;
}
async function setUserImage(userId, image) {
    const user = await UserSchema.findById(userId);
    if (!user) throw new Error("User not found");
    user.image = image;
    return user.save();
}

module.exports = {
    createUser,
    getUserById,
    findUserByCredentials,
    getUserId,
    setUserImage,
};
const userModel = require("../models/users");

async function patchUserImage(req, res) {
    const { id } = req.params;
    const { image } = req.body || {};
    const authUserId = req.user.id;

    if (!authUserId || String(authUserId) !== String(id)) {
        return res.status(403).json({ error: "Forbidden: You can only update your own profile image." });
    }
    if (image !== undefined && typeof image !== "string") {
        return res.status(400).json({ error: "Image must be a string." });
    }
    try {
        const updated = await userModel.setUserImage(id, image ? image.trim() : '');
        return res.status(200).json({
            id: updated.id,
            username: updated.username,
            name: updated.name,
            image: updated.image,
        });
    } catch (err) {
        if (err.message === "User not found.") {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function createUser(req, res) {
    const { username, password, name, image } = req.body || {};

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ error: "Username is required" });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({ error: "Password is required" });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Name is required" });
    }
    try {
        const newUser = await userModel.createUser({
            username: username.trim(),
            password: password.trim(),
            name: name ? name.trim() : '',
            image: image ? image.trim() : '',
        })

        res.set('Location', `/api/users/${newUser.id}`);
        return res.status(201).send();
    } catch (err) {
        if (err.message === "Username already exists.") {
            return res.status(409).json({ error: err.message });
        }
        if (err.message === "Password must be at least 8 characters long.") {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getUserById(req, res) {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
    });
}

async function getUserId(req, res) {
  const { username } = req.query;
  const id = await userModel.getUserId(username);

  if (!id) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ username, userId: id });
}
module.exports = { createUser, getUserById, getUserId, patchUserImage };
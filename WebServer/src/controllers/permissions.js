const { getFileMetadata } = require("../models/files");
const {getUserById} = require("../models/users");
const {
    listFilePermissions: listPermissionsModel,
    addPermission: addPermissionModel,
    updatePermission: updatePermissionModel,
    removePermission: removePermissionModel,
    getPermissionById: getPermissionModel,
} = require("../models/permissions");


async function listPermissions(req, res) {
    const ownerId = req.user.id;
    const fileId = req.params.id;
    //check if file exists and requesting user is the owner
    const file = await getFileMetadata(fileId);
    if (!file || file.ownerId.toString() !== ownerId) {
        return res.status(404).json({ error: "File not found" });
    }
    const permissions = (await listPermissionsModel(fileId)).map((perm) => ({
        id: perm.pid,
        userId: perm.userId,
        permissionType: perm.permissionType,
    }));
    return res.status(200).json(permissions);
}

 async function addPermission(req, res) {
    const ownerId = req.user.id;
    const fileId = req.params.id;
    const file = await getFileMetadata(fileId);

    //check if file exists and user is its owner
    if (!file || file.ownerId.toString() !== ownerId.toString()) {
        return res.status(404).json({ error: "File not found" });
    }
    
    const { userId, permissionType } = req.body || {};
    if (typeof userId !== "string" || userId.trim() === "") {
        return res.status(400).json({ error: "Invalid or missing userId" });
    }

    if (permissionType !== "read" && permissionType !== "write") {
        return res.status(400).json({ error: "Invalid permissionType, must be 'read' or 'write'" });
    }
    
    if (!await getUserById(userId.trim())) {
        return res.status(400).json({ error: "User with the specified userId does not exist" });
    }
    // maybe check if you trying to add permission for the ownerId
    const newPermission = await addPermissionModel(fileId, userId.trim(), permissionType);
    if (!newPermission) {
        return res.status(409).json({ error: "Failed to add permission" });
    }
    res.set("Location", `/api/files/${fileId}/permissions/${newPermission._id}`);
    return res.status(201).send();
}

async function updatePermission(req, res) {
    const ownerId = req.user.id;
    const fileId = req.params.id;
    const permissionId = req.params.permissionId;

    const file = await getFileMetadata(fileId);
    if (!file || file.ownerId.toString() !== ownerId.toString()) {
        return res.status(404).json({ error: "File not found" });
    }
    const { permissionType } = req.body || {};

    if (permissionType !== "read" && permissionType !== "write") {
        return res.status(400).json({ error: "Invalid permissionType, must be 'read' or 'write'" });
    }
    const permission = await getPermissionModel(permissionId);
    if (!permission || permission.fileId !== fileId) {
        return res.status(404).json({ error: "Permission not found for the specified file" });
    }
    const success = await updatePermissionModel(permissionId, permissionType);
    if (!success) {
        return res.status(404).json({ error: "Permission not found" });
    }
    return res.status(204).send();
    
}

async function removePermission(req, res) {
    const ownerId = req.user.id;
    const fileId = req.params.id;
    const permissionId = req.params.permissionId;
    const file = await getFileMetadata(fileId);
    if (!file || file.ownerId.toString() !== ownerId.toString()) {
        return res.status(404).json({ error: "File not found" });
    }
    
    const permission = await getPermissionModel(permissionId);
    if (!permission || permission.fileId !== fileId) {
        return res.status(404).json({ error: "Permission not found for the specified file" });
    }
    const success = await removePermissionModel(permissionId);
    if (!success) {
        return res.status(404).json({ error: "Permission not found" });
    }
    return res.status(204).send();
}

module.exports = { listPermissions, addPermission, updatePermission, removePermission };
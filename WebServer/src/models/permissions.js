const crypto = require("crypto");
const permissionsSchema = require("./PermissionsSchema");
const fileSchema = require("./FileSchema");
//const { getFileMetadata } = require("./files"); consider changing to a service or something
// pid: unique permission id
// each permission: {pid, fileId, userId, permissionType}

async function listFilePermissions(fileId) {
    return await permissionsSchema.find({ fileId }).populate('userId', 'username');
}

async function listUserPermissions(userID) {
    return await permissionsSchema.find({ userId: userID });
}

// Recursively check permissions up the file hierarchy
async function checkUserPermission(fileId, userId, permissionType) {
    const file = await fileSchema.findById(fileId);
    if (!file) return false;

    if (file.ownerId.toString() === userId.toString()) return true;

    const directPermission = await permissionsSchema.findOne({ fileId, userId });
    if (directPermission) {
        const hasDirectAccess = permissionType === 'read' || (permissionType === 'write' && directPermission.permissionType === 'write');
        if (hasDirectAccess) return true;
    }

    if (file.parentId) {
        return await checkUserPermission(file.parentId, userId, permissionType);
    }

    return false;
}


async function addPermission(fileId, userId, permissionType) {
    if(permissionType !== 'read' && permissionType !== 'write') {
        return null;
    }
    //if user can already read/write the file directly, upgrade if needed
    const existing = await permissionsSchema.findOne({ fileId, userId });
    if(existing) {
        if (permissionType === 'write' && existing.permissionType === 'read') {
            existing.permissionType = 'write';
            await existing.save();
        }
        return existing;
    }
    //if user already can access the file with existing permissions (parent or direct), dont create a new one
    //but if we explicitly give a file permission, and then we want to give to its parent - create a new one
    const isAlreadyPermitted = await checkUserPermission(fileId, userId, permissionType);
    if (isAlreadyPermitted) {
        return null;
    }
    const newPermission = new permissionsSchema({ fileId, userId, permissionType });
    return await newPermission.save();
}


async function updatePermission(permissionId, newPermissionType) {
    if(newPermissionType !== 'read' && newPermissionType !== 'write') {
        return false;
    }
    const permission = await permissionsSchema.findById(permissionId);
    if(!permission) {
        return false;
    }
    permission.permissionType = newPermissionType;
    await permission.save();
    return true;
}


async function removePermission(permissionId) {
    const result = await permissionsSchema.findByIdAndDelete(permissionId);
    return result !== null;
}


async function getPermissionById(permissionId) {
    return await permissionsSchema.findById(permissionId) || null;
}

async function getPermissionByUserAndFile(userId, fileId) {
    return await permissionsSchema.findOne({ userId, fileId });
}


module.exports = {
    listFilePermissions,
    listUserPermissions,
    addPermission,
    updatePermission,
    removePermission,
    getPermissionById,
    checkUserPermission,
    getPermissionByUserAndFile,    
};
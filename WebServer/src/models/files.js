const crypto = require("crypto");
const { sendRequest } = require("../services/backendSocketComms");
const usersModel = require("./users");
const { listFilePermissions: listFilePermissions,
  listUserPermissions: listUserPermissions,
  checkUserPermission: checkUserPermission,
  getPermissionByUserAndFile,
  removePermission } = require("./permissions");
const UserSchema = require("./UserSchema");
const FileSchema = require("./FileSchema");
const mongoose = require("mongoose");


async function getFileMetadata(id) {
  return FileSchema.findById(id);
}

function normalizeParentId(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") return null;
    return trimmed;
  }
  if (typeof value === "object") {
    if (typeof value.id === "string") return normalizeParentId(value.id);
    if (typeof value._id === "string") return normalizeParentId(value._id);
    return null;
  }
  return value;
}
function attachIsStarredField(fileDoc, userId) {
  const file = fileDoc.toObject();
  file.id = file._id.toString();
  file.name = file.filename;
  file.isStarred = file.starredBy
    ? file.starredBy.some(uid => uid.toString() === userId.toString())
    : false;
  return file;
}



async function listFiles (userId, parentId = null, view = null) {
  if (parentId === "" || parentId === "null" || parentId === undefined) {
    parentId = null;
  }
  const {checkUserPermission, listUserPermissions} = require("./permissions");
  const userPerms = (await listUserPermissions(userId))
  const sharedFileIds = userPerms.map(p => p.fileId);

  if (parentId) {
    const hasAccess = await checkUserPermission(parentId, userId, 'read');
    if (!hasAccess) {
      throw { status: 403, message: "Access denied to the specified folder" };
    }
  }

  if (view === "starred") {
    return await FileSchema.find({
      $or: [
        { ownerId: userId },
        { _id: { $in: sharedFileIds } }
      ],
      isTrashed: false,
      starredBy: userId
    }).populate('ownerId', 'username');  
  }
  if (view === "trash") {
    return await FileSchema.find({ 
      ownerId: userId, 
      isTrashed: true 
    }).populate('ownerId', 'username');  
  }
  if (view === "recent") {
    // Use aggregation to compute lastActivity and sort
  const results = await FileSchema.aggregate([
    {
      $match: {
        $or: [
          { ownerId: new mongoose.Types.ObjectId(userId) }, // Ensure userId is an ObjectId
          { _id: { $in: sharedFileIds } }
        ],
        isTrashed: false
      }
    },
    {
      $addFields: {
        lastActivity: { $max: ["$lastOpenedTime", "$lastUpdateTime"] }
      }
    },
    { $sort: { lastActivity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users", 
        localField: "ownerId",
        foreignField: "_id",
        as: "ownerDoc" // Use a temporary name to avoid confusion
      }
    },
    { $unwind: "$ownerDoc" }
  ]);

  // Map results to include isStarred and proper owner structure
  return results.map(file => ({
    ...file,
    id: file._id.toString(),
    name: file.filename, // Map filename to name
    ownerId: {
      _id: file.ownerDoc._id,
      username: file.ownerDoc.username
    },
    // Recalculate isStarred for the UI
    isStarred: (file.starredBy || []).some(uid => uid.toString() === userId.toString())
  }));
}
  if (view === "shared") {
    if (parentId) {
      const children = await FileSchema.find({ parentId, isTrashed: false }).populate('ownerId', 'username');
      const filteredChildren = [];
      for (const child of children) {
        const isTrashed = await isPathTrashed(child);
        if (!isTrashed && await checkUserPermission(child._id, userId, "read")) {
          filteredChildren.push(child);
        }
      }
      return filteredChildren;
    }

    const candidateFiles = await FileSchema.find({ 
      _id: { $in: sharedFileIds },
      ownerId: { $ne: userId },
      isTrashed: false 
    }).populate('ownerId', 'username');

    const topLevelShared = [];
    for (const file of candidateFiles) {
      if (await isPathTrashed(file)) continue;
      if (!await checkUserPermission(file._id, userId, "read")) continue;
      if (file.parentId && await checkUserPermission(file.parentId, userId, "read")) continue;
      if( file.parentId ) {
        const parent = await checkUserPermission(file.parentId, userId, "read");
        if (parent) continue;
      }
      topLevelShared.push(file);
    }

    return topLevelShared;
  }

  let query = { isTrashed: false };

  if (parentId === null) {
    query.parentId = null;
    query.ownerId = userId;
  } else {
    query.parentId = parentId;
  }

  const results = await FileSchema.find(query).populate('ownerId', 'username');
  const filteredResults = [];
  for (const file of results) {
    if (!await isPathTrashed(file) && await checkUserPermission(file._id, userId, "read")) {
      filteredResults.push(file);
    }
  }
  return filteredResults.map(f => attachIsStarredField(f, userId));
}
  
//helper function to check if a file is trashed
async function isPathTrashed(file) {
  if (file.isTrashed) return true;
  if (!file.parentId) return false;
  const parent = await FileSchema.findById(file.parentId);
  if (parent) {
    return await isPathTrashed(parent);
  }
  return false;
}

// Creates metadata in Node.js and physical content in C++
async function createFile({ name, ownerId, ownerName, type, parentId, content }) {
  // check parent existence and type
  if (parentId) {
    const parent = await FileSchema.findById(parentId);
    if (!parent) {
      throw { status: 404, message: "Parent directory not found" };
    }
    if (parent.type !== "folder") {
      throw { status: 400, message: "Cannot create items inside a file" };
    }

    //check writing permissions to parent folder
    const hasWriteAccess = await checkUserPermission(parentId, ownerId, 'write');
    if (!hasWriteAccess) {
      throw { status: 403, message: "Permission denied: Cannot write to this folder" };
    }
  }

  const normalizedType = type === "folder" ? "folder" : "file";
  const user = await usersModel.getUserById(ownerId);
  const resolvedOwnerName = ownerName ?? user?.username ?? null;

  const newFile = new FileSchema({
    filename: name.trim(),
    parentId: parentId || null,
    ownerId,
    ownerName: resolvedOwnerName,
    type: normalizedType,
  });

  try {
    const savedFile = await newFile.save();

    // If it's a file, create physical content in C++
    if (normalizedType === "file" && content && content.trim() !== "") {
      const response = await sendRequest(`POST ${savedFile._id} ${content}`);
      if (response?.status && response.status >= 400) {
        // Rollback metadata creation on failure
        await FileSchema.findByIdAndDelete(savedFile._id);
        throw response;
      }
    }

    return savedFile;
  } catch (err) {
    throw {
      status: err?.status ?? 500,
      message: err?.message ?? "Failed to create file"
    };
  }
    }

  

// migrate getFile to use MongoDB and Mongoose
async function getFile(id, userId) {
  const file = await FileSchema.findById(id).populate('ownerId', 'username').lean();
  if (!file) throw { status: 404, message: "File not found" };

  const hasAccess = await checkUserPermission(id, userId, 'read');
  if (!hasAccess) throw { status: 403, message: "Access denied" };

  // Update last opened time
  await FileSchema.findByIdAndUpdate(id, { lastOpenedTime: new Date().toISOString() });

  //compute isStarred
  file.isStarred = file.starredBy
    ? file.starredBy.some(uid => uid.toString() === userId.toString())
    : false;

  file.name = file.filename;
  file.ownerName = file.ownerName ?? file.ownerId?.username ?? null;
    
  // Fetch file names if it's a folder
  if (file.type === "folder") {
    const children = await FileSchema.find({ parentId: id, isTrashed: false })
      .populate('ownerId', 'username')
      .lean();
    file.children = children.map(child => {
      const mapped = {
        ...child,
        id: child._id.toString(),
        name: child.filename,
        ownerName: child.ownerName ?? child.ownerId?.username ?? null,
        isStarred: child.starredBy
          ? child.starredBy.some(uid => uid.toString() === userId.toString())
          : false
      };
      delete mapped._id;
      return mapped;
    });
  } else {
    try {
      const response = await sendRequest(`GET ${id}`);
      file.content = response?.content ?? "";
    } catch (err) {
      file.content = "";  
    }
}
file.id = file._id.toString();
delete file._id;
return file;

}






// Search files by logical name or content
async function searchFiles(query, userId) {
  try {
    if (!query || query.trim() === "") return [];
    const lowerQuery = query.toLowerCase();

    //fetch all non-trashed files
    const allFiles = await FileSchema.find({ isTrashed: false }).populate('ownerId', 'username');

    // Filter files to those the user has read access to, running checks in parallel
   const permChecks = await Promise.all(
      allFiles.map(async (file) => ({
        file,
        hasAccess: await checkUserPermission(file._id, userId, "read"),
    }))
  );

    const allowedFiles = permChecks
      .filter(({ hasAccess }) => hasAccess)
      .map(({ file }) => file);
    

    // Request backend search and split results to array of physical IDs
    const cppResponse = await sendRequest(`SEARCH ${query}`);
    const physicalIds = cppResponse.status === 200
      ? (cppResponse.content || "").trim().split(/\s+/).filter(Boolean)
      : [];

    const finalResults = [];

    // Use a loop to allow await inside
    for (const file of allowedFiles) {
      file.isStarred = file.starredBy
        ? file.starredBy.some(uid => uid.toString() === userId.toString())
        : false;
      // Check logical name match
      if (file.filename.toLowerCase().includes(lowerQuery)) {
        finalResults.push(file);
        continue;
      }

      // Check if C++ found this specific file ID
      const inCppResults = physicalIds.includes(file._id.toString());

      if (inCppResults) {
        // If the ID includes the query, we MUST verify content
        if (file._id.toString().toLowerCase().includes(lowerQuery)) {
          const requestFile = await sendRequest(`GET ${file._id.toString()}`);
          const fileContent = requestFile.content || "";

          if (requestFile.status === 200 && fileContent.toLowerCase().includes(lowerQuery)) {
            finalResults.push(file);
          }
        }
        // If ID doesn't include query but C++ found it then content must match
        else {
          finalResults.push(file);
        }
      }
    }

    return finalResults;
  } catch (err) {
    throw {
      status: err?.status ?? 500,
      message: err?.message ?? "Search failed"
    };
  }
}

async function deleteFile (fileId, userId) {
  const file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  // case #1: owner wants to delete the file
  if (file.ownerId.toString() === userId.toString()) {
    if (!file.isTrashed) {
      //not truly delete - just mark as trashed
      file.isTrashed = true;
      await file.save();
      return { status: 200, message: "Moved to trash", data: file };
    } else {
      //if file already trashed - delete it and its subtree permanently.
      await deleteSubtree(file);
      return { status: 204, message: "Permanently deleted" };
    }
  } else {
    // case #2: shared user wants to delete the file, so we remove his permission (if exists)
    // so the file is no longer visible to him, but not actually deleted for others
    const perm = await getPermissionByUserAndFile(userId, fileId);
    if (perm) {
      await removePermission(perm._id);
      return { status: 204, message: "Permission removed" };
    }
    //if the file is inside a shared folder that user has permission to write 
    // actually delete it (Google implementation)
    if (await checkUserPermission(fileId, userId, "write")) {
      await deleteSubtree(file);
      return { status: 204, message: "Permanently deleted" };
    }
    throw { status: 403, message: "Permission denied: Cannot delete file or folder" }
  }
}




  
async function deleteSubtree(file) {
  if (file.type === "folder") {
    const children = await FileSchema.find({ parentId: file._id });
    for (const child of children) {
      await deleteSubtree(child);
    }
  }

  if (file.type === "file") {
    try {
      await sendRequest(`DELETE ${file._id.toString()}`);
    } catch (err) {
      if (err?.status !== 404) {
        throw err;
      }
    }
  }

  await FileSchema.findByIdAndDelete(file._id.toString());
}




async function restoreFile(fileId, userId) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  // Permission check: only the owner can restore
  if (file.ownerId.toString() !== userId.toString()) {
    throw { status: 403, message: "Permission denied" };
  }

  file.isTrashed = false;
  await file.save();

  return { status: 200, message: "Restored successfully", data: file };
}




async function renameFile(fileId, userId, name) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  // check write permissions
  const hasAccess = await checkUserPermission(fileId, userId, 'write');
  if (!hasAccess) throw { status: 403, message: "Write permission required" };

  const newName = String(name).trim();
  if (!newName) throw { status: 400, message: "Non empty name is required" };

  file.filename = newName;
  file.lastUpdateTime = new Date().toISOString();

  return await file.save();
}


async function writeFileContent(fileId, userId, content) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };
  if (file.type !== "file") throw { status: 400, message: "Cannot patch content of a folder" };

  const hasAccess = await checkUserPermission(fileId, userId, 'write');
  if (!hasAccess) throw { status: 403, message: "Write permission required" };

  const newContent = String(content);

  // delete physical if exists
  try {
    const del = await sendRequest(`DELETE ${fileId}`);
    if (del?.status && del.status >= 400 && del.status !== 404) throw del;
  } catch (err) {
    if (err?.status !== 404) throw err;
  }
  
  // create physical only if non-empty
  if (newContent.trim() !== "") {
    const post = await sendRequest(`POST ${fileId} ${newContent}`);
    if (post?.status && post.status >= 400) throw post;
  }
  file.lastUpdateTime = new Date().toISOString();
  file.markModified('content');
  return await file.save();
}




async function starFile(fileId, userId) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!await checkUserPermission(fileId, userId, "read")) {
    throw { status: 403, message: "Access denied" };
  }
  file = await FileSchema.findByIdAndUpdate(
    fileId,
    { $addToSet: { starredBy: userId } },
    { new: true }
  );
  return file;
  
}

async function unstarFile(fileId, userId) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!await checkUserPermission(fileId, userId, "read")) {
    throw { status: 403, message: "Access denied" };
  }

  file = await FileSchema.findByIdAndUpdate(
    fileId,
    { $pull: { starredBy: userId } },
    { new: true }
  );
  return file;
}

async function changeParentId(fileId, userId, updatedParentId) {
  let file = await FileSchema.findById(fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!await checkUserPermission(fileId, userId, "write")) {
    throw { status: 403, message: "Access denied - only owner can move the file" };
  }
  if (updatedParentId !== null) {
    const parent = await FileSchema.findById(updatedParentId);
    if (!parent) throw { status: 404, message: "ParentId not found" };

    if (parent.type !== "folder") { throw { status: 400, message: "Parent must be a folder" }; }

    if (!await checkUserPermission(updatedParentId, userId, "write")) {
      throw { status: 403, message: "Permission denied - cannot write in given folder" };
    }

    if (fileId === updatedParentId) {
      throw { status: 400, message: "Cannot move a folder into itself" };
    }

    if (file.type === "folder" && await isAncestor(file, parent)) {
      throw { status: 400, message: "Cannot move a folder into its own descendant" };
    }
  }

  file.parentId = updatedParentId;
  return await file.save();
}

//helper method to check if a file is an ancestor of another
async function isAncestor(ancestorFile, nodeFile) {
  let current = nodeFile;
  const ancestorId = (ancestorFile._id ?? ancestorFile.id)?.toString();

  while (current && current.parentId != null) {
    if (current.parentId.toString() === ancestorId) return true;
    current = await FileSchema.findById(current.parentId);
  }
  return false;
}



module.exports = {
  listFiles,
  createFile,
  getFile,
  renameFile,
  writeFileContent,
  deleteFile,
  restoreFile,
  searchFiles,
  getFileMetadata,
  starFile,
  unstarFile,
  changeParentId
};

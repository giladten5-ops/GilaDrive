const crypto = require("crypto");
const { sendRequest } = require("../services/backendSocketComms");
const usersModel = require("./users");
const { listFilePermissions: listFilePermissions,
  listUserPermissions: listUserPermissions,
  checkUserPermission: checkUserPermission,
  getPermissionByUserAndFile,
  removePermission } = require("./permissions");

const files = [];

function getFileMetadata(id) {
  return files.find(f => f.id === id);
}

// List files for a user under a specific parent folder (or root if parentId is null)
function listFiles(userId, parentId = null, view = null) {
  if (parentId === "" || parentId === "null" || parentId === undefined) {
    parentId = null;
  }
  let hasAccess;
  const userPerms = listUserPermissions(userId).map(p => p.fileId);
  if (parentId) {
    hasAccess = checkUserPermission(parentId, userId, 'read');
  }
  if (parentId && !hasAccess) {
    throw { status: 403, message: "Access denied to the specified folder" };
  }

  if (view === "starred") {
    const visibleFiles = files.filter(f => f.ownerId === userId || userPerms.includes(f.id));
    return visibleFiles.filter(f => !f.isTrashed && (f.starredBy || []).includes(userId));
  }


  if (view === "trash") {
    return files.filter(file => file.ownerId === userId && file.isTrashed);
  }

  if (view === "recent") {
    const visibleFiles = files.filter(f => f.ownerId === userId || userPerms.includes(f.id));
    const recentFiles = visibleFiles
      .filter(f => !f.isTrashed)
      .sort((a, b) => {
        // Sort by the most recent of lastOpenedTime or lastUpdateTime
        const aOpened = new Date(a.lastOpenedTime).getTime() || 0;
        const bOpened = new Date(b.lastOpenedTime).getTime() || 0;
        const aUpdated = new Date(a.lastUpdateTime).getTime() || 0;
        const bUpdated = new Date(b.lastUpdateTime).getTime() || 0;
        const aRecent = Math.max(aOpened, aUpdated);
        const bRecent = Math.max(bOpened, bUpdated);
        return bRecent - aRecent;
      })
      .slice(0, 10); // return top 10 recent files
    return recentFiles;
  }
  // view all shared files at top level, but be able to navigate inside shared folders
  if (view === "shared") {
    // inside a shared folder: list its children normally (by parentId)
    if (parentId) {
      return files.filter(f =>
        f.parentId === parentId &&
        !isPathTrashed(f) &&
        checkUserPermission(f.id, userId, "read")
      );
    }

    // shared root: show only top-level shared entries (optional google-like)
    return files.filter(f => {
      if (f.ownerId === userId) return false;
      if (isPathTrashed(f)) return false;
      if (!checkUserPermission(f.id, userId, "read")) return false;
      if (f.parentId && checkUserPermission(f.parentId, userId, "read")) return false;
      return true;
    });
  }




  // Root level: list owned files only
  if (parentId === null) {
    return files.filter(f => f.parentId === null && !f.isTrashed && f.ownerId === userId);
  }

  // Inside any folder (owned or shared): list children you can read (or write)
  return files.filter(f =>
    f.parentId === parentId &&
    !isPathTrashed(f) &&
    checkUserPermission(f.id, userId, "read")
  );
}


//helper function to check if a file is trashed
function isPathTrashed(file) {
  if (file.isTrashed) return true;
  if (!file.parentId) return false;
  const parent = files.find(f => f.id === file.parentId);
  if (parent) {
    return isPathTrashed(parent);
  }
  return false;
}

// Creates metadata in Node.js and physical content in C++
async function createFile({ name, ownerId, ownerName, type, parentId, content }) {
  // check parent existence and type
  if (parentId) {
    const parent = getFileMetadata(parentId);
    if (!parent) {
      throw { status: 404, message: "Parent directory not found" };
    }
    if (parent.type !== "folder") {
      throw { status: 400, message: "Cannot create items inside a file" };
    }

    //check writing permissions to parent folder
    const hasWriteAccess = checkUserPermission(parentId, ownerId, 'write');
    if (!hasWriteAccess) {
      throw { status: 403, message: "Permission denied: Cannot write to this folder" };
    }
  }

  let id;
  do {
    id = crypto.randomUUID();
  } while (files.some((file) => file.id === id));

  const normalizedType = type === "folder" ? "folder" : "file";
  const resolvedOwnerName = ownerName ?? usersModel.getUserById(ownerId)?.username ?? null;

  const newFile = {
    id,
    name,
    ownerId,
    ownerName: resolvedOwnerName,
    type: normalizedType,
    parentId: parentId ?? null,
    isTrashed: false,
    creationTime: new Date().toISOString(),
    lastUpdateTime: new Date().toISOString(),
    lastOpenedTime: new Date().toISOString(),
    starredBy: []
  };

  try {
    if (normalizedType === "file" && content?.trim()) {
      const result = await sendRequest(`POST ${id} ${content}`);
      if (result?.status && result.status >= 400) {
        throw result;
      }
    }

    files.push(newFile);
    return newFile;

  } catch (err) {
    throw {
      status: err?.status ?? 500,
      message: err?.message ?? "Failed to create file in backend"
    };
  }
}



async function getFile(id, userId) {
  const fileMetadata = files.find(f => f.id === id);
  if (!fileMetadata) {
    throw { status: 404, message: "File not found" };
  }

  const hasAccess = checkUserPermission(id, userId, 'read');
  if (!hasAccess) {
    throw { status: 403, message: "Access denied" };
  }
  // Update last opened time
  fileMetadata.lastOpenedTime = new Date().toISOString();

  // Fetch file names if it's a folder
  if (fileMetadata.type === "folder") {
    const children = files.filter(f => f.parentId === id).map(child => ({
      id: child.id,
      name: child.name,
      ownerId: child.ownerId,
      ownerName: child.ownerName || null,
      type: child.type,
      parentId: child.parentId
    }));
    // Return folder metadata with children
    return {
      id: fileMetadata.id,
      name: fileMetadata.name,
      ownerId: fileMetadata.ownerId,
      ownerName: fileMetadata.ownerName || null,
      type: fileMetadata.type,
      isStarred: (fileMetadata.starredBy || []).includes(userId),
      lastOpenedTime: fileMetadata.lastOpenedTime,
      creationTime: fileMetadata.creationTime,
      lastUpdateTime: fileMetadata.lastUpdateTime,
      children
    };
  }

  let fileContent = "";

  try {
    // Fetch content from backend for files
    const response = await sendRequest(`GET ${id}`);
    fileContent = response?.content ?? "";
  } catch (err) {
    // catch 404 from backend as empty content (for empty files we save only metadata)
    if (err?.status === 404) {
      fileContent = "";
    } else {
      throw {
        status: err?.status ?? 500,
        message: err?.message ?? "Failed to fetch content from backend"
      };
    }
  }

  return {
    id: fileMetadata.id,
    name: fileMetadata.name,
    ownerId: fileMetadata.ownerId,
    ownerName: fileMetadata.ownerName || null,
    type: fileMetadata.type,
    parentId: fileMetadata.parentId,
    creationTime: fileMetadata.creationTime,
    lastUpdateTime: fileMetadata.lastUpdateTime,
    lastOpenedTime: fileMetadata.lastOpenedTime,
    isStarred: (fileMetadata.starredBy || []).includes(userId),
    content: fileContent ?? ""
  };
}




// Search files by logical name or content
async function searchFiles(query, userId) {
  try {
    if (query === undefined || query === null || query.trim() === "") {
      return [];
    }
    const lowerQuery = (query || "").toLowerCase();

    // List files user has access to - either owner or with read permission, and not trashed because we don't search in trash
    const allowedFiles = files.filter(f => {
      return checkUserPermission(f.id, userId, 'read') && !isPathTrashed(f);
    });

    // Request backend search and split results to array of physical IDs
    const cppResponse = await sendRequest(`SEARCH ${query}`);
    const physicalIds = cppResponse.status === 200
      ? (cppResponse.content || "").trim().split(/\s+/).filter(Boolean)
      : [];

    const finalResults = [];

    // Use a loop to allow await inside
    for (const file of allowedFiles) {
      // Check logical name match
      if (file.name.toLowerCase().includes(lowerQuery)) {
        finalResults.push(file);
        continue;
      }

      // Check if C++ found this specific file ID
      const inCppResults = physicalIds.includes(file.id);

      if (inCppResults) {
        // If the ID includes the query, we MUST verify content
        if (file.id.toLowerCase().includes(lowerQuery)) {
          const requestFile = await sendRequest(`GET ${file.id}`);
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


async function deleteFile(fileId, userId) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };
  //check if user is the file's owner
  if (file.ownerId === userId) {
    if (!file.isTrashed) {
      //mark trash first
      file.isTrashed = true;
      return { status: 200, message: "Moved to trash", data: file };
    } else {
      //if file already trashed - delete it and its subtree permanently.
      await deleteSubtree(file);
      return { status: 204, message: "Permanently deleted" };
    }
  } else {
    //if the file is shared with the user - remove the permission
    let perm = getPermissionByUserAndFile(userId, fileId);
    if (perm) {
      removePermission(perm.pid);
      return { status: 204, message: "Permission removed" };
    }
    //if the file is inside a shared folder that user has permission to write 
    // actually delete it (Google implementation)
    if (checkUserPermission(fileId, userId, "write")) {
      await deleteSubtree(file);
      return { status: 204, message: "Permanently deleted" };
    }
  }
  return { status: 403, message: "Permission denied: Cannot delete file or folder" }
}

async function deleteSubtree(file) {
  let children;
  if (file.type === "folder") { children = files.filter(f => f.parentId === file.id); }

  if (children) {
    //recursivly delete all childrens of the file
    for (const child of children) {
      await deleteSubtree(child.id);
    }
  }

  if (file.type === "file") {
    try { await sendRequest(`DELETE ${file.id}`); }
    catch (err) {
      if (err?.status !== 404) {
        throw err;
      }
    }
  }

  // remove metadata for this node
  const index = files.findIndex(f => f.id === file.id);
  if (index !== -1) files.splice(index, 1);
}

async function restoreFile(fileId, userId) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };

  // Permission check: only the owner can restore
  if (file.ownerId !== userId) {
    throw { status: 403, message: "Permission denied" };
  }

  file.isTrashed = false;

  return { status: 200, message: "Restored successfully", data: file };
}


//method to change file name
async function renameFile(fileId, userId, name) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };

  // check write permissions
  const hasAccess = checkUserPermission(fileId, userId, 'write');
  if (!hasAccess) throw { status: 403, message: "Write permission required" };

  const newName = String(name).trim();
  if (!newName) throw { status: 400, message: "Non empty name is required" };

  file.name = newName;
  file.lastUpdateTime = new Date().toISOString();

  return { ...file };
}

//change file contnet
async function writeFileContent(fileId, userId, content) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };
  if (file.type !== "file") throw { status: 400, message: "Cannot patch content of a folder" };

  const hasAccess = checkUserPermission(fileId, userId, 'write');
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
  return { ...file };
}


function starFile(fileId, userId) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!checkUserPermission(fileId, userId, "read")) {
    throw { status: 403, message: "Access denied" };
  }

  file.starredBy ||= [];
  if (!file.starredBy.includes(userId)) file.starredBy.push(userId);
  return file;
}

function unstarFile(fileId, userId) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!checkUserPermission(fileId, userId, "read")) {
    throw { status: 403, message: "Access denied" };
  }

  file.starredBy ||= [];
  file.starredBy = file.starredBy.filter(id => id !== userId);
  return file;
}

function changeParentId(fileId, userId, updatedParentId) {
  const file = files.find(f => f.id === fileId);
  if (!file) throw { status: 404, message: "File not found" };

  if (!checkUserPermission(fileId, userId, "write")) {
    throw { status: 403, message: "Access denied - only owner can move the file" };
  }
  if (updatedParentId !== null) {
    const parent = files.find(f => f.id === updatedParentId);
    if (!parent) throw { status: 404, message: "ParentId not found" };

    if (parent.type !== "folder") { throw { status: 400, message: "Parent must be a folder" }; }

    if (!checkUserPermission(updatedParentId, userId, "write")) {
      throw { status: 403, message: "Permission denied - cannot write in given folder" };
    }

    if (fileId === updatedParentId) {
      throw { status: 400, message: "Cannot move a folder into itself" };
    }

    if (file.type === "folder" && isAncestor(file, parent)) {
      throw { status: 400, message: "Cannot move a folder into its own descendant" };
    }
  }

  file.parentId = updatedParentId;
  return file;
}

//helper method to check if a file is an ancestor of another
function isAncestor(ancestorFile, nodeFile) {
  let current = nodeFile;

  while (current && current.parentId != null) {
    if (current.parentId === ancestorFile.id) return true;
    current = files.find(f => f.id === current.parentId);
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

const { listFiles: listFilesModel,
    createFile: createFileModel,
    getFile: getFileModel,
    renameFile: renameFile,
    deleteFile: deleteFileModel,
    getFileMetadata: getFileMetadata,
    writeFileContent: writeFileContent,
    starFile,
    unstarFile,
    changeParentId,
    restoreFile } = require("../models/files");
    const userModel = require("../models/users");

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

//list all files for the authenticated user, optionally filtered by parentId (null for root files)
async function listFiles(req, res) {
    const { parentId, view } = req.query; // "trash", "starred", etc....
    const pid = normalizeParentId(parentId);
    const pidString = pid == null ? null : String(pid);

    // returns all files with the relevent filters
    const rawFiles = await listFilesModel(req.user.id, pidString, view);
    const files = rawFiles.map(file => ({
        id: file.id,
        name: file.name ?? file.filename,
        ownerName: file.ownerName ?? file.ownerId?.username ?? null,
        type: file.type,
        parentId: file.parentId,
        isTrashed: file.isTrashed,
        creationTime: file.creationTime,
        isStarred: (file.starredBy || []).some(userId => userId.toString() === req.user.id.toString()) ? true : false,
        lastUpdateTime: file.lastUpdateTime,
        lastOpenedTime: file.lastOpenedTime
    }));
    return res.status(200).json(files);
}

async function createFile(req, res) {
    const { name, type = "file", parentId, content } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Name is required" });
    }

    if (type !== "file" && type !== "folder") {
        return res.status(400).json({ error: "Type must be either 'file' or 'folder'" });
    }

    const pid = normalizeParentId(parentId);
    const pidString = pid == null ? null : String(pid);
    if (pidString) {
        const parentFile = await getFileMetadata(pidString);
        if (!parentFile || parentFile.type !== "folder") {
            return res.status(400).json({ error: "Invalid parentId" });
        }
    }

    try {
        const newFile = await createFileModel({
            name: name.trim(),
            ownerId: req.user.id,
            ownerName: req.user.username,
            type,
            parentId: pidString,
            content,
        });

        res.set("Location", `/api/files/${newFile.id}`);
        return res.status(201).send();
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || "Failed to create file" });
    }
}

async function getFile(req, res) {
    const fileId = req.params.id;
    if (!fileId) {
        return res.status(400).json({ error: "File id is required" });
    }

    try {
        const data = await getFileModel(fileId, req.user.id);
        res.status(200).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}


async function updateFile(req, res) {
  const fileId = req.params.id;
  if (!fileId) return res.status(400).json({ error: "File id is required" });

  try {
    const { name, content, isStarred, parentId, restore } = req.body || {};
    const userId = req.user.id;

    // ensure file exists
    let updatedFile = await getFileMetadata(fileId);
    if (!updatedFile) return res.status(404).json({ error: "File not found" });

    if (restore === true) {
      const restored = await restoreFile(fileId, userId); // { status, message, data }
      updatedFile = await getFileMetadata(fileId);
    }

    if (name !== undefined) {
      updatedFile = await renameFile(fileId, userId, name);
    }

    if (content !== undefined) {
      updatedFile = await writeFileContent(fileId, userId, content);
    }

    if (isStarred !== undefined) {
      updatedFile = isStarred
        ? await starFile(fileId, userId)
        : await unstarFile(fileId, userId);
    }

    if (parentId !== undefined) {
      const pid = parentId == null || parentId === "null" || parentId === "" ? null : String(parentId);
      updatedFile = await changeParentId(fileId, userId, pid);
    }

    return res.status(200).json(updatedFile);
  } catch (err) {
    console.error(`Error updating file ${req.params.id}:`, err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to update file" });
  }
}


async function deleteFile(req, res) {
    const file = await getFileMetadata(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    try {
        await deleteFileModel(req.params.id, req.user.id);
        return res.status(204).send();
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || "Failed to delete file" });
    }
}


module.exports = { listFiles, createFile, getFile, updateFile, deleteFile };

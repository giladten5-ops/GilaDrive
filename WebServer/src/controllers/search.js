const filesModel = require("../models/files");

async function search(req, res) {
    
        const userId = req.user.id ?? req.user.userId;
        const query = req.params.query;
        
    try {
        const results = await filesModel.searchFiles(query, userId);
        // we return all these fields so the frontend can properly display the search results
        const formatResults = results.map(file => ({
            id: (file._id ?? file.id)?.toString?.() ?? file.id,
            name: file.name ?? file.filename,
            ownerName: file.ownerName ?? file.ownerId?.username ?? null,
            type: file.type,
            isStarred: file.isStarred ?? (file.starredBy || []).some(uid => uid.toString() === userId.toString()),
            lastOpenedTime: file.lastOpenedTime,
            lastUpdateTime: file.lastUpdateTime
        }));
        return res.status(200).json(formatResults);
    } catch (e) {
        return res.status(500).json({ error: "Search failed" });
    }
}

module.exports = { search }

const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['file', 'folder'],
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    creationTime: {
        type: Date,
        default: Date.now
    },
    lastUpdateTime: {
        type: Date,
        default: Date.now
    },
    lastOpenedTime: {
        type: Date,
        default: Date.now
    },
    
    isTrashed: {
        type: Boolean,
        default: false
    },
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
}, { timestamps: true });

FileSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { 
        ret.id = ret._id.toString();
        delete ret._id; }
});

module.exports = mongoose.model('File', FileSchema);
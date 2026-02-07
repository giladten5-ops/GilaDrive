const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    permissionType: {
        type: String,
        enum: ['read', 'write'],
        required: true
    }
}, { timestamps: true });

permissionsSchema.virtual('pid').get(function() {
    return this._id.toHexString();
});

permissionsSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { delete ret._id; }
});

permissionsSchema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model('Permission', permissionsSchema);
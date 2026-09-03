const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    postedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    title: {type: String, required: true},
    deadline: {type: Date, required: true},
    shortDescription: { type: String, required: true},
    briefDescription: {type: String, required: true},
    upload: [{type: String, required: true}],
    amount: {type: Number, required: true},
    type: {type: String, required: true},
    assignee:{type: mongoose.Schema.Types.ObjectId,ref: 'User',default: null},
    completeWork:[{type: String, default: null}],
    qr: {type: String, default: null},
    ss:{type:String, default:null},
    messages: [{
            sender: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
            to: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
            body: {type: String,default: ''},
            type: {type: String,enum: ['p2p', 'system', 'submission'],default: 'p2p'},
            createdAt: {type: Date,default: Date.now}
        }],
    deleteAt: { type: Date, default: null },
});

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);
const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
    name: {
        type:String,
        required: true
    },
    user_id: {
        type:String,
        required: true
    },
    text: {
        type:String,
        required: true
    },
    room_id: {
        type:String,
        required: true
    },

} , {timestamps: true})

module.exports = model('Message', messageSchema);
const { model, Schema } = require("mongoose");

const userSchema = new Schema({
    name: String,
    chatId: Number,
    phone: String,
    admin: {
        type: Boolean,
        default: false
    },
    action: String,
    createdAt: Date,
    status: {
        type: Boolean,
        default: true
    },
    quanttityUsing: Number,
    userCategory: String
})

module.exports = model("User", userSchema)
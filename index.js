require('dotenv').config()
const { bot } = require('./bot/bot');


const { default: mongoose } = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('Connected to database')).catch(error => console.log('Error while connecting to database', error))

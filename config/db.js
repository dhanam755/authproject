const mongoose =require('mongoose');

const database =async()=>
{
    mongoose.connect('mongodb://localhost:27017/mydatabase')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error', err));
};
module.exports=database;

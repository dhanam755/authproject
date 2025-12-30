const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET= process.env.JWT_SECRET|| 'mysecretkey';
const signup = async (req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }
        const userExists = await User.findOne({ username });
        if (userExists) {
        return res.status(400).json({ message: 'User already exists' });}
        const hashedPassword = await bcrypt.hash(password, 5);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:'Server error'});
    }
};
const login=async (req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' });}
        const user = await User.findOne({ username });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });}
            const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });}
            const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
            res.json({ message: 'Login successful', token });
            }
    catch(error){
        res.status(500).json({message:'Server error', error:error.message});
    }  
    };
const logout =async(req,res)=>{
    try{
        res.status(200).json({message:'Successfully Logout'});}
    catch(error){
        res.status(500).json({message:error.message})}};
module.exports={signup,login,logout};
const mongoose =require('mongoose');
const Task = require('../models/Task');

const createTask=async(req,res)=>{
    try{
        const {title,description}=req.body;
        const task =await Task.create({
            user:req.user._id,
            title,
            description
        });
            res.status(201).json(task);
        }
    catch(error){
        res.status(500).json({message: error.message});}
};

const getTasks=async(req,res)=>{
    try{
        const tasks=await Task.find({
            user:req.user._id
        });
            res.status(201).json(tasks);
        }
    catch(error){
        res.status(500).json({message: error.message});}
};

const updateTask=async(req,res)=>{
    try{
        const task =await Task.findOneAndUpdate(
            {_id:req.params.id,
            user:req.user._id},
            req.body,
            {new: true}
        );
        if (!task) 
            return res.status(404).json({ message: 'Not found' });
        res.status(200).json(task);
        }
    catch(error){
        res.status(500).json({message: error.message});}
};


const deleteTask=async(req,res)=>{
    try{
        const task =await Task.findOneAndDelete(
            {_id:req.params.id,
            user:req.user._id});
        if (!task) 
            return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message:'Delete successfully'});
        }
    catch(error){
        res.status(500).json({message: error.message});}
};
module.exports = { createTask, getTasks, updateTask, deleteTask };
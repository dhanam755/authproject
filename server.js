const express = require('express');
const database = require('./config/db');
const authRoutes = require ('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config();
database();
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

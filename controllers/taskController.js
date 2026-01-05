const pool = require('../config/db');
const createTask = async (req, res) => {
try {
    const { title, description } = req.body;

    const result = await pool.query(`INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *`,[req.user.id, title, description]
    );

    res.status(201).json(result.rows[0]);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};


const getTasks = async (req, res) => {
try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1',
    [req.user.id]
    );

    res.status(200).json(result.rows);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};


const updateTask = async (req, res) => {
try {
    const { title, description, completed } = req.body;

    const result = await pool.query(
    'UPDATE tasks SET title = $1,description = $2,completed = $3 WHERE id = $4 AND user_id = $5 RETURNING *',[title, description, completed, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(result.rows[0]);} catch (error) {
    res.status(500).json({ message: error.message });
}
};
const deleteTask = async (req, res) => {
try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
    [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

module.exports = { createTask, getTasks, updateTask, deleteTask };

const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost/todo-list', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date },
  done: { type: Boolean, default: false },
});
const Task = mongoose.model('Task', taskSchema);


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/tasks', async (req, res) => {
    try {
      const { title, deadline } = req.body;
      const task = new Task({ title, deadline });
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: 'Bad request' });
    }
  });
  
  app.get('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const task = await Task.findById(taskId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(task);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const { title, deadline, done } = req.body;
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { title, deadline, done },
        { new: true }
      );
      if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(updatedTask);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findByIdAndRemove(taskId);
      if (!deletedTask) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(deletedTask);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/tasks/:id/done', async (req, res) => {
    try {
      const taskId = req.params.id;
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { done: true },
        { new: true }
      );
      if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(updatedTask);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/tasks/stats', async (req, res) => {
    try {
      const completedTasks = await Task.countDocuments({ done: true });
      const notCompletedTasks = await Task.countDocuments({ done: false });
      res.json({
        completedTasks,
        notCompletedTasks,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/tasks/alert', async (req, res) => {
    try {
      const currentTime = moment();
      const approachingTasks = await Task.find({
        deadline: { $gte: currentTime, $lte: moment().add(24, 'hours') },
      });
      res.json(approachingTasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
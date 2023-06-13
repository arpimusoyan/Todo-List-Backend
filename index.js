const express = require('express');
const app = express();

app.use(express.json());

let tasks = [{id: 1, name: 'Mike'}, {id: 2, name: 'Anna'}];


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const task = req.body;
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const task = tasks.find((task) => task.id === taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    res.json(task);
  }
});

app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
    res.json(tasks[taskIndex]);
  }
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    const deletedTask = tasks.splice(taskIndex, 1);
    res.json(deletedTask[0]);
  }
});

app.patch('/tasks/:id/done', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    tasks[taskIndex].done = true;
    res.json(tasks[taskIndex]);
  }
});

app.get('/tasks/stats', (req, res) => {
  const completedTasks = tasks.filter((task) => task.done);
  const notCompletedTasks = tasks.filter((task) => !task.done);
  res.json({
    completedTasks: completedTasks.length,
    notCompletedTasks: notCompletedTasks.length,
  });
});

app.get('/tasks/alert', (req, res) => {
  const approachingTasks = tasks.filter((task) => {
    const deadline = new Date(task.deadline);
    const currentTime = new Date();
    const timeDiff = deadline.getTime() - currentTime.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);
    return hoursRemaining <= 24;
  });
  res.json(approachingTasks);
  
});
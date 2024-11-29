const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// Database connection (replace with your MongoDB connection string)
const uri = "mongodb://localhost:27017/"; //or your connection string
const client = new MongoClient(uri);

// EJS templating engine
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files (CSS, JS)
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('todo-db'); // Replace 'todo-db' with your database name
        const collection = db.collection('todos');
        const todos = await collection.find({}).toArray();
        res.render('index', { todos });
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).send('Error fetching todos');
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('todo-db');
        const collection = db.collection('todos');
        const todoId = req.params.id;
        await collection.deleteOne({ _id: new ObjectId(todoId) });
        res.sendStatus(200); // Send 200 OK status
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).send('Error deleting todo');
    } finally {
        await client.close();
    }
});


app.put('/edit/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('todo-db');
        const collection = db.collection('todos');
        const todoId = req.params.id;
        await collection.updateOne(
            { _id: new ObjectId(todoId) },
            { $set: { text: req.body.text } }
        );
        res.sendStatus(200);
    } catch (error) {
        console.error('Error editing todo:', error);
        res.status(500).send('Error editing todo');
    } finally {
        await client.close();
    }
});


app.post('/addTodo', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('todo-db');
        const collection = db.collection('todos');
        await collection.insertOne({ text: req.body.todoText, completed: false });
        res.redirect('/');
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).send('Error adding todo');
    } finally {
        await client.close();
    }
});


app.post('/toggle/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('todo-db');
        const collection = db.collection('todos');
        const todoId = req.params.id;
        await collection.updateOne(
            {_id: new ObjectId(todoId)},
            {$set: {completed: !req.body.completed}}
        );
        res.redirect('/');
    } catch (error) {
        console.error('Error toggling todo:', error);
        res.status(500).send('Error toggling todo');
    } finally {
        await client.close();
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

const { ObjectId } = require('mongodb');


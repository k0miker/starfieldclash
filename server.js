const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    highScore: Number
});

const User = mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost:27017/starfield', { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('User not found');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(400).send('Invalid password');
    }
    const token = jwt.sign({ id: user._id }, 'secret');
    res.json({ token, username, highScore: user.highScore });
});

app.post('/save-score', async (req, res) => {
    const { token, score } = req.body;
    try {
        const decoded = jwt.verify(token, 'secret');
        const user = await User.findById(decoded.id);
        if (user.highScore < score) {
            user.highScore = score;
            await user.save();
        }
        res.send('Score saved');
    } catch (err) {
        res.status(400).send('Error saving score');
    }
});

app.get('/highscores', async (req, res) => {
    const users = await User.find().sort({ highScore: -1 }).limit(10);
    res.json(users);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Ecom', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Storing passwords in plain text (not recommended)
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  address: String,
  phoneNumber: String,
  items: Array,
  totalCost: Number,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Route for user registration
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists!');
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User does not exist!');
    }

    if (user.password !== password) {
      return res.status(401).send('Invalid password!');
    }

    res.status(200).send('Login successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to retrieve user data by email
app.get('/users/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).send('User not found!');
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle order placement
app.post('/orders', async (req, res) => {
  const { address, phoneNumber, items, totalCost } = req.body;

  try {
    const newOrder = new Order({ address, phoneNumber, items, totalCost });
    await newOrder.save();
    res.status(201).send('Order placed successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to place order');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

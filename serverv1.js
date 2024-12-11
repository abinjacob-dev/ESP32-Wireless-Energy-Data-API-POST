const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an instance of express app
const app = express();
const port = 3000;  // Choose the port you want to run the server on

// MongoDB connection (replace with your MongoDB URI)
const mongoURI = 'mongodb://localhost:27017/pzemdata1'; // Local MongoDB
// For MongoDB Atlas:
// const mongoURI = 'your_mongodb_atlas_url';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

// Create a schema for the PZEM data
const pzemSchema = new mongoose.Schema({
  voltage: Number,
  current: Number,
  power: Number,
  energy: Number,
  frequency: Number,
  pf: Number,
  date: String,
  time: String,
  timestamp: { type: Date, default: Date.now }
});

// Create a model for the PZEM data
const PzemData = mongoose.model('PzemData', pzemSchema);

// Middleware to parse JSON body
app.use(bodyParser.json());

// POST route to receive data from ESP32 and save to MongoDB
app.post('/api/sendData', (req, res) => {
  console.log('Received data:', req.body);  // Log the incoming data
  const data = req.body;

  // Get the current date and time
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().split('T')[0];  // YYYY-MM-DD
  const timeStr = currentDate.toLocaleTimeString('en-US', { hour12: true });  // HH:MM:SS AM/PM

  // Create a new document from the data
  const newData = new PzemData({
    voltage: data.voltage,
    current: data.current,
    power: data.power,
    energy: data.energy,
    frequency: data.frequency,
    pf: data.pf,
    date: dateStr,
    time: timeStr,
  });

  // Save the data to MongoDB
  newData.save()
    .then(() => {
      console.log('Data saved to MongoDB');
      res.status(200).send('Data received and saved');
    })
    .catch((err) => {
      console.error('Error saving data:', err);
      res.status(500).send('Error saving data: ' + err);
    });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

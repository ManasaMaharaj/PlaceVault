const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const placementRoutes = require('./routes/placements');
app.use('/api/placements', placementRoutes);

app.get('/', (req, res) => {
  res.send('Placement Portal API running!');
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

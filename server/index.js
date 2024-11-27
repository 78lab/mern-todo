const express = require('express');
// const axios = require('axios');
const mongoose = require('mongoose');
// const xml2js = require('xml2js');

// const MetroStation = require('./models/MetroStation');
// const BusRouteInfo = require('./models/BusRouteInfo');

const cors = require('cors');
require('dotenv').config();

const { PUB_DATA_API_KEY, SEOUL_SERVICE_KEY } = process.env;
const busRoutes = require('./routes/busRoutes');
const metroRoutes = require('./routes/metroRoutes');

const app = express();
const PORT = process.env.PORT || 5009;

// const BUS_BASE_URL = "https://apis.data.go.kr/6410000"
// const BUS_ARRIVAL_URL = BUS_BASE_URL + `/busarrivalservice/getBusArrivalList?serviceKey=${PUB_DATA_API_KEY}`

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/bus', busRoutes);
app.use('/metro', metroRoutes);

app.get('/', (req, res) => {
  res.send('REAL Metro!');
});

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error(error);
});
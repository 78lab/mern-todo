const mongoose = require('mongoose');

const MetroStationSchema = new mongoose.Schema({
    subwayId: {
      type: String,
      required: true,
    },
    statnId: {
        type: String,
        required: true,
      },
    statnNm: {
        type: String,
        required: true,
      },
  }, { timestamps: true });

const MetroStation = mongoose.model('MetroStation', MetroStationSchema);

module.exports = MetroStation;

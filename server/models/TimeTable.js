const mongoose = require('mongoose');

const TimeTableSchema = new mongoose.Schema({
  LINE_NUM: { type: String, required: true },
  FR_CODE: { type: String, required: true },
  STATION_CD: { type: String, required: true },
  STATION_NM: { type: String, required: true },
  TRAIN_NO: { type: String, required: true },
  ARRIVETIME: { type: String, required: true },
  LEFTTIME: { type: String, required: true },
  ORIGINSTATION: { type: String, required: true },
  DESTSTATION: { type: String, required: true },
  SUBWAYSNAME: { type: String, required: true },
  SUBWAYENAME: { type: String, required: true },
  WEEK_TAG: { type: String, required: true },
  INOUT_TAG: { type: String, required: true },
  FL_FLAG: { type: String },
  DESTSTATION2: { type: String },
  EXPRESS_YN: { type: String, required: true },
  BRANCH_LINE: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TimeTable', TimeTableSchema);

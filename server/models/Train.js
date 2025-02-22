const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
    TRAIN_NO: {
      type: String,
      required: true,
    },
    trainNo: {
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
    recptnDt: {
        type: String,
        required: true,
      },
      updnLine: {
        type: String,
        required: true,
      },
      trainSttus: { //열차상태구분(0:진입 1:도착, 2:출발, 3:전역출발)
        type: String,
        required: true,
      },
      directAt: {   //급행여부(1:급행, 0:아님, 7:특급)
        type: String,
        required: true,
      },
      lstcarAt: {    //막차여부
        type: String,
        required: true,
      },
      delay: { type: Number, default: 0 },
  }, { timestamps: true });

const Train = mongoose.model('Train', TrainSchema);

module.exports = Train;
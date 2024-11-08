const express = require('express');
const axios = require('axios');
const TimeTable = require('../models/TimeTable');
const MetroStation = require('../models/MetroStation');
const router = express.Router();

const SEOUL_SERVICE_KEY = process.env.SEOUL_SERVICE_KEY;
const SEOUL_BASE_URL = "http://swopenapi.seoul.go.kr/api/subway";


// let tag_messages = [];

const calculateTimeLeft = (leftTime) => {
  const [hours, minutes, seconds] = leftTime.split(':');
  const leftTimeInSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  const currentDate = new Date();
  const currentTimeInSeconds = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds();

  const timeDifferenceInSeconds = leftTimeInSeconds - currentTimeInSeconds;
  const min = Math.floor(timeDifferenceInSeconds / 60);
  const sec = timeDifferenceInSeconds % 60;

  return {min, sec};
};

const makeMsgsForStations = (items) => {
  let msg = null;
  let title = null;
  // let train_updn = null;

  items.forEach(item => {
      const {
        TRAIN_NO,
        FR_CODE,
        INOUT_TAG,
        ARRIVETIME,
        LEFTTIME,
        SUBWAYENAME,
        SUBWAYSNAME,
        EXPRESS_YN,
        WEEK_TAG,
        STATION_CD,
        STATION_NM,
        LINE_NUM
          // ordkey,
          // trainLineNm,
          // statnId,
          // statnNm: current_station_name,
          // btrainNo,
          // arvlMsg2: rawArvlMsg2,
          // arvlMsg3: train_station_name,
          // recptnDt,
          // btrainSttus,
          // lstcarAt,
          // updnLine: train_updn
      } = item;

      // let arvlMsg2 = rawArvlMsg2.startsWith("전역") 
      //     ? `${rawArvlMsg2}(${train_station_name})`
      //     : rawArvlMsg2;
      console.log(STATION_NM,ARRIVETIME, LEFTTIME);
      const {min, sec} = calculateTimeLeft(ARRIVETIME);

      const msgTemp = `이번역 ${STATION_NM} ${min}분 ${sec}초 후`;

      msg = msg ? `${msg}\n${msgTemp}` : msgTemp;
      title = `${TRAIN_NO}열차(${LINE_NUM}) 탑승중 ${SUBWAYSNAME}>${SUBWAYENAME} `;
  });
  
  // title = `${trains[0].statnNm}역(${trains[0].trainLineNm}) ${timeAgo(trains[0].recptnDt)}`;
  // const updn = train_updn === "상행" ? "0" : "1";
  // const tag_key = `s-${trains[0].statnId}-${updn}`;
  // const tag_val = "true";

  console.log(msg, title);
  return { msg, title }; 
}


const makeMsgsWithTrains = (trains) => {
    let msg = null;
    let title = null;
    // let train_updn = null;

    trains.forEach(item => {
        const {
          TRAIN_NO,
          FR_CODE,
          INOUT_TAG,
          ARRIVETIME,
          LEFTTIME,
          SUBWAYENAME,
          SUBWAYSNAME,
          EXPRESS_YN,
          WEEK_TAG,
          STATION_CD,
          STATION_NM,
          LINE_NUM
            // ordkey,
            // trainLineNm,
            // statnId,
            // statnNm: current_station_name,
            // btrainNo,
            // arvlMsg2: rawArvlMsg2,
            // arvlMsg3: train_station_name,
            // recptnDt,
            // btrainSttus,
            // lstcarAt,
            // updnLine: train_updn
        } = item;

        // let arvlMsg2 = rawArvlMsg2.startsWith("전역") 
        //     ? `${rawArvlMsg2}(${train_station_name})`
        //     : rawArvlMsg2;
        console.log(TRAIN_NO,ARRIVETIME, LEFTTIME);
        const {min, sec} = calculateTimeLeft(LEFTTIME);

        const msgTemp = `(${TRAIN_NO}) ${min}분 ${sec}초 후`;

        msg = msg ? `${msg}\n${msgTemp}` : msgTemp;
        title = `${STATION_NM}역(${LINE_NUM}) ${SUBWAYSNAME}>${SUBWAYENAME} `;
    });
    
    // title = `${trains[0].statnNm}역(${trains[0].trainLineNm}) ${timeAgo(trains[0].recptnDt)}`;
    // const updn = train_updn === "상행" ? "0" : "1";
    // const tag_key = `s-${trains[0].statnId}-${updn}`;
    // const tag_val = "true";

    console.log(msg, title);
    return { msg, title };
    // tag_messages.push({ tag_key, tag_value: tag_val, message: push_msg, title: push_title });
};



const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};


// Get metro stations
router.get('/msgfortrain', async (req, res) => {
  try {
    // let stationId = req.query.station_id;
    let trainNo = req.query.train_no;
    // let frCode = req.query.fr_code;
    let inoutTag = req.query.inout_tag;
    let weekTag = req.query.week_tag;
    let query = {}
    let sort = {}
    // if (frCode) { query.FR_CODE = frCode; }
    if (inoutTag) { query.INOUT_TAG = inoutTag; }
    if (weekTag) { query.WEEK_TAG = weekTag; }
    if (trainNo) { 
      query.TRAIN_NO = trainNo; 
      if(inoutTag == 1) sort.FR_CODE = -1;
      else sort.FR_CODE = 1; 
    }

    const currentTime = formatTime(new Date());
    console.log(currentTime)

    query.ARRIVETIME = { $gt: currentTime };

    try {
        // Fetch data from the external API
        console.log(query,sort)
        const items = await TimeTable.find(query).sort(sort).limit(1);
        console.log(items)

        const {msg,title} = makeMsgsForStations(items);

        res.json([{msg: msg,title:title}]);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch statmessagesions' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get metro stations
router.get('/msgforstation', async (req, res) => {
  try {
    let stationId = req.query.station_id;
    let trainNo = req.query.train_no;
    let frCode = req.query.fr_code;
    let inoutTag = req.query.inout_tag;
    let weekTag = req.query.week_tag;
    let query = {}
    let sort = {}
    if (frCode) { query.FR_CODE = frCode; }
    if (inoutTag) { query.INOUT_TAG = inoutTag; }
    if (weekTag) { query.WEEK_TAG = weekTag; }
    if (trainNo) { 
      query.TRAIN_NO = trainNo; 
      if(inoutTag == 1) sort.FR_CODE = -1;
      else sort.FR_CODE = 1; 
    }


    const currentTime = formatTime(new Date());
    console.log(currentTime)

    query.LEFTTIME = { $gt: currentTime };

    try {
        // Fetch data from the external API
        console.log(query,sort)
        const trains = await TimeTable.find(query).sort(sort).limit(2);
        console.log(trains)

        const {msg,title} = makeMsgsWithTrains(trains);

        res.json([{msg: msg,title:title}]);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch statmessagesions' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get time table
router.get('/timetable', async (req, res) => {
  try {
    let fr_code = req.query.fr_code;
    let inout_tag = req.query.inout_tag;
    let week_tag = req.query.week_tag;
    let train_no = req.query.train_no;
    let query = {}
    let sort = {}
    if (fr_code) { query.FR_CODE = fr_code; }
    if (inout_tag) { query.INOUT_TAG = inout_tag; }
    if (week_tag) { query.WEEK_TAG = week_tag; }
    if (train_no) { 
      query.TRAIN_NO = train_no; 
      if(inout_tag == 1) sort.FR_CODE = -1;
      else sort.FR_CODE = 1; 
    }

    
    // let subwayNm = req.query.subwayNm;
    // let realtimePosUrl = `${SEOUL_BASE_URL}/${SEOUL_SERVICE_KEY}/json/realtimePosition/0/100/${subwayNm}`
    try {
        // Fetch data from the external API
        console.log("query:",query,"sort:",sort)
        // console.log(`query:${query} sort:${sort}`) 
        // const realtimePositionResponse = await axios.get(realtimePosUrl);
        // const realtimePositionData = realtimePositionResponse.data;
        // const trainList = realtimePositionData.realtimePositionList
        const timetable = await TimeTable.find(query).sort(sort);
        // const  = await Train.find({ subwayId: subwayId });
        res.json(timetable);

    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get metro stations
router.get('/stations', async (req, res) => {
  try {
    let subwayId = req.query.subwayId;
    // let subwayNm = req.query.subwayNm;
    // let realtimePosUrl = `${SEOUL_BASE_URL}/${SEOUL_SERVICE_KEY}/json/realtimePosition/0/100/${subwayNm}`
    try {
        // Fetch data from the external API
        console.log(subwayId)
        // const realtimePositionResponse = await axios.get(realtimePosUrl);
        // const realtimePositionData = realtimePositionResponse.data;
        // const trainList = realtimePositionData.realtimePositionList
        const stations = await MetroStation.find({ subwayId: subwayId }).sort({ statnId: 1 });
        // const  = await Train.find({ subwayId: subwayId });
        res.json(stations);

    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get metro stations
router.get('/realtimepositions', async (req, res) => {
  try {

    let subwayId = req.query.subwayId;
    let subwayNm = req.query.subwayNm;
    let realtimePosUrl = `${SEOUL_BASE_URL}/${SEOUL_SERVICE_KEY}/json/realtimePosition/0/100/${subwayNm}`

    try {
        // Fetch data from the external API
        console.log(realtimePosUrl)
        const realtimePositionResponse = await axios.get(realtimePosUrl);
        const realtimePositionData = realtimePositionResponse.data;
        const trainList = realtimePositionData.realtimePositionList
        const stations = await MetroStation.find({ subwayId: subwayId });

        // const  = await Train.find({ subwayId: subwayId });
        res.json(trainList);

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }

    


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
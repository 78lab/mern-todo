const express = require('express');
const axios = require('axios');
const TimeTable = require('../models/TimeTable');
const Train = require('../models/Train');
const MetroStation = require('../models/MetroStation');
const { isTemplateMiddle } = require('typescript');
const router = express.Router();

const SEOUL_SERVICE_KEY = process.env.SEOUL_SERVICE_KEY;
const SEOUL_BASE_URL = "http://swopenapi.seoul.go.kr/api/subway";


// let tag_messages = [];

const calculateTimeLeft = (leftTime, delay = 0) => {
  const [hours, minutes, seconds] = leftTime.split(':');
  const leftTimeInSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  const currentDate = new Date();
  const currentTimeInSeconds = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds();

  const timeDifferenceInSeconds = leftTimeInSeconds - currentTimeInSeconds + delay;
  const min = Math.floor(timeDifferenceInSeconds / 60);
  const sec = timeDifferenceInSeconds % 60;

  return {min, sec};
};

const makeMsgsForStation = (item, trainData) => {
  let msg = null;
  let title = null;
  // let nowData = null;
  // let train_updn = null;

  if(!item) return {msg, title};


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
        LINE_NUM,
      } = item  ?? {};

      const {
        recptnDt,
        trainSttus,
        delay = 0
      } = trainData ?? {}

      console.log(STATION_NM,ARRIVETIME, LEFTTIME,recptnDt,trainSttus,delay);
      const {min, sec} = calculateTimeLeft(ARRIVETIME,delay);

      const msgTemp = `이번역 ${STATION_NM} ${min}:${sec} d:${delay} s:${trainSttus}`;

      msg = msg ? `${msg}\n${msgTemp}` : msgTemp;
      title = `${TRAIN_NO}열차(${LINE_NUM}) 탑승중 ${SUBWAYSNAME}>${SUBWAYENAME}`;

  
  // title = `${trains[0].statnNm}역(${trains[0].trainLineNm}) ${timeAgo(trains[0].recptnDt)}`;
  // const updn = train_updn === "상행" ? "0" : "1";
  // const tag_key = `s-${trains[0].statnId}-${updn}`;
  // const tag_val = "true";
  resData = [{ msg, title,currentStationCD:FR_CODE,trainData:trainData}]
  console.log(resData);
  return resData; 
}

const makeMsgsForFistStation = (trains) => {
  let msg = null;
  let title = null;

  if(!trains || trains.length === 0) return {msg, title};

  trains.forEach(item => {
      const {
        TRAIN_NO,
        ARRIVETIME,
        LEFTTIME,
        SUBWAYENAME,
        SUBWAYSNAME,
        STATION_NM,
        LINE_NUM
      } = item;

      console.log(TRAIN_NO,ARRIVETIME, LEFTTIME,SUBWAYENAME,SUBWAYSNAME,STATION_NM);
      const {min, sec} = calculateTimeLeft(LEFTTIME,0);
      const msgTemp = `(${TRAIN_NO}) ${min}:${sec} 후 출발`;

      msg = msg ? `${msg}\n${msgTemp}` : msgTemp;
      title = `${STATION_NM}역(${LINE_NUM}) ${SUBWAYSNAME}>${SUBWAYENAME}`;
  });

  resData = [{ msg, title,currentTrainNo:trains[0]?.trainNo}]
  console.log(resData);
  return resData; 
};


const makeMsgsWithTrains = (trains, trainData) => {
    let msg = null;
    let title = null;

    if(!trains || trains.length === 0) return {msg, title};

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
        } = item;
        const {
          recptnDt,
          trainSttus,
          delay = 0
        } = trainData ?? {}


        console.log(TRAIN_NO,ARRIVETIME, LEFTTIME,recptnDt,trainSttus,delay);
        const {min, sec} = calculateTimeLeft(ARRIVETIME,delay);

        const msgTemp = `(${TRAIN_NO}) ${min}:${sec} d:${delay} s:${trainSttus}`;

        msg = msg ? `${msg}\n${msgTemp}` : msgTemp;
        title = `${STATION_NM}역(${LINE_NUM}) ${SUBWAYSNAME}>${SUBWAYENAME}`;
    });
    
    resData = [{ msg, title,currentTrainNo:trains[0]?.TRAIN_NO,nowData:trainData}]
    console.log(resData);
    return resData; 
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

    try {
        // Fetch data from the external API
        
        const trainData = await Train.findOne({'trainNo':trainNo})
        console.log(trainData)

        const { trainSttus = "", delay = 0 } = trainData ?? {};
        console.log('delay, trainSttus:', delay, trainSttus);

        if(delay){
          const FomattedTime = formatTime(new Date());
          const delayedDatetime = new Date(Date.now() - (delay * 1000));
          const delayedFomattedTime = formatTime(delayedDatetime);
          console.log(delayedFomattedTime, FomattedTime, delay)

          query.ARRIVETIME = { $gt: delayedFomattedTime, $ne: "00:00:00" };
        }

        console.log(query,sort)
        const nowStation = await TimeTable.findOne(query).sort(sort) //.limit(1);
            // .populate('TRAIN_NO')
            //   .populate({
            //     path: 'trainData',
            //     foreignField: 'TRAIN_NO',    // Field in Profile model
            //     localField: 'TRAIN_NO',       // Field in User model
            //     select: 'TRAIN_NO statnId lastRecptnDt recptnDt trainSttus delay -_id'    // Select specific fields
            // })
        // const trainData = await Train.findOne({trainNo:trainNo})
        console.log(nowStation)

        // const {msg,title} = makeMsgsForStations(items);
        const resData = makeMsgsForStation(nowStation,trainData);//[{msg: msg,title:title, currentStationCD: items[0]?.STATION_CD,trainData:trainData}]
        console.log(resData)
        res.json(resData);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch statmessagesions' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get metro upcoming trains
router.get('/msgforstation', async (req, res) => {
  try {
    // let stationId = req.query.station_id;
    let trainNo = req.query.train_no;
    let frCode = req.query.fr_code;
    let inoutTag = req.query.inout_tag;
    let weekTag = req.query.week_tag;
    let query = {}
    let sort = {}

    if (inoutTag) { query.INOUT_TAG = inoutTag; }
    if (weekTag) { query.WEEK_TAG = weekTag; }
    if (frCode) { 
      query.FR_CODE = frCode; 
      sort.TRAIN_NO = 1; 
      // if(inoutTag == 1) sort.TRAIN_NO = -1;
      // else sort.TRAIN_NO = 1; 
    }
    const stationId = "1008000" + frCode

    if(inoutTag == "1"){
      updnLine = "0"
      trainQuery = { statnId:{$gt:stationId},updnLine:updnLine }
    }else{
      updnLine = "1"
      trainQuery = { statnId:{$lt:stationId},updnLine:updnLine }
    } 

    const currentTime = formatTime(new Date());
    console.log(currentTime)

    try {
        //시작역일경우
        if((inoutTag == 1 && frCode == "827") || (inoutTag == 2 && frCode == "804")){ 
          query.LEFTTIME = { $gt: currentTime };
          console.log('query,sort:',query,sort)
          const trains = await TimeTable.find(query).sort(sort).limit(2);
          console.log(trains)
          const resData = makeMsgsForFistStation(trains)
          console.log(resData)
          res.json(resData);
        //시작역이 아닐경우
        }else{

          console.log('trainQuery:',trainQuery)
          const trainData = await Train.findOne(trainQuery).sort({trainNo:1})
          console.log("trainData:",trainData)
  
          const { trainSttus = null, delay = 0 } = trainData ?? {};
          console.log('delay, trainSttus:', delay, trainSttus);

          if(delay){
          
            const FomattedTime = formatTime(new Date());
            const delayedDatetime = new Date(Date.now() - (delay * 1000));
            const delayedFomattedTime = formatTime(delayedDatetime);
            console.log(delayedFomattedTime, FomattedTime, delay,trainSttus)
  
            query.ARRIVETIME = { $gt: delayedFomattedTime, $ne: "00:00:00" };
          }else{
            console.log('no delay')
            query.ARRIVETIME = { $gt: currentTime, $ne: "00:00:00" };
          }

          console.log('query,sort:',query,sort)
          const trains = await TimeTable.find(query).sort(sort).limit(2);
          console.log(trains)
          const resData = makeMsgsWithTrains(trains,trainData);//[{msg: msg,title:title, ] //trains.map{x => x.TRAIN_NO}
          console.log(resData)
          res.json(resData);
        }

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
    let frCode = req.query.fr_code;
    let inoutTag = req.query.inout_tag;
    let weekTag = req.query.week_tag;
    let trainNo = req.query.train_no;
    let query = {}
    let sort = {}
    if (inoutTag) { query.INOUT_TAG = inoutTag; }
    if (weekTag) { query.WEEK_TAG = weekTag; }
    
    if (frCode) { 
      query.FR_CODE = frCode; 
      sort.TRAIN_NO = 1; 
      // if(inoutTag == 1) sort.TRAIN_NO = -1;
      // else sort.TRAIN_NO = 1; 
    }

    if (trainNo) { 
      query.TRAIN_NO = trainNo; 
      if(inoutTag == 1) sort.FR_CODE = -1;
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
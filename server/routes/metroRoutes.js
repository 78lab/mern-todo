const express = require('express');
const axios = require('axios');
const TimeTable = require('../models/TimeTable');
const MetroStation = require('../models/MetroStation');
const router = express.Router();

const SEOUL_SERVICE_KEY = process.env.SEOUL_SERVICE_KEY;
const SEOUL_BASE_URL = "http://swopenapi.seoul.go.kr/api/subway";
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
const express = require('express');
const axios = require('axios');
// const mongoose = require('mongoose');
// const xml2js = require('xml2js');
const BusRouteInfo = require('../models/BusRouteInfo');
const router = express.Router();

const { PUB_DATA_API_KEY, SEOUL_SERVICE_KEY } = process.env;

const BUS_BASE_URL = "https://apis.data.go.kr/6410000"
const BUS_ARRIVAL_URL = BUS_BASE_URL + `/busarrivalservice/v2/getBusArrivalListv2?serviceKey=${PUB_DATA_API_KEY}&format=json`
const BUS_STATION_AROUND_LIST_URL = BUS_BASE_URL + `/busstationservice/v2/getBusStationAroundListv2?serviceKey=${PUB_DATA_API_KEY}&format=json`


const TAGO_BUS_BASE_URL = "https://apis.data.go.kr/1613000"
const TAGO_BUS_ARRIVAL_URL = TAGO_BUS_BASE_URL + `/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${PUB_DATA_API_KEY}&_type=json`
const TAGO_BUS_STATION_AROUND_LIST_URL = TAGO_BUS_BASE_URL + `/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=${PUB_DATA_API_KEY}&_type=json`


// Get all todos
router.get('/getTBusArrivals', async (req, res) => {
    try {
        const cityCode = req.query.cityCode
      const nodeId = req.query.nodeId
      console.log("req.query:",req.query)
    //   const tempUrl = "https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=AruAfuXNbzd%2FSJ3kjpQFaLUngxr8ce4O1IKHJFtPxxk8CBngL8FvTffnsrWwirDx4t1kESNbX1nS7M3z4x5tuQ%3D%3D&_type=json"
      // Fetch data from the external API
      console.log("TAGO_BUS_ARRIVAL_URL",TAGO_BUS_ARRIVAL_URL)
      const params = {cityCode, nodeId}
      console.log(params)
      const busArrivalListRes = await axios.get(TAGO_BUS_ARRIVAL_URL,{params} );
      console.log(busArrivalListRes.data)
      const resData = busArrivalListRes.data.response.body.items.item
      console.log("resData:",resData)
      if(resData instanceof Array){
        console.log("resData instanceof Array")
        res.json(resData);
      }else if(resData){
        console.log("resData not Array")
        res.json([resData]);
      }else{
        res.json([]);
      }
      

      // const items = await BusRouteInfo.find();
      // res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



// Get all todos
router.get('/getTBusStations', async (req, res) => {
    try {
      const lat = req.query.lat
      const lon = req.query.lon
      console.log("lat,lon:",lat,lon)
    //   const tempUrl = "https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=AruAfuXNbzd%2FSJ3kjpQFaLUngxr8ce4O1IKHJFtPxxk8CBngL8FvTffnsrWwirDx4t1kESNbX1nS7M3z4x5tuQ%3D%3D&_type=json"
      // Fetch data from the external API
      console.log("TAGO_BUS_STATION_AROUND_LIST_URL",TAGO_BUS_STATION_AROUND_LIST_URL)
      const params = {gpsLati: lat, gpsLong:lon}
      console.log(params)
      const busStationListRes = await axios.get(TAGO_BUS_STATION_AROUND_LIST_URL,{params} );
      // const busArrivalResData = busStationListRes.data
      console.log(busStationListRes.data)
      const resData = busStationListRes.data.response.body.items.item    
    //   const result = await xml2js.parseStringPromise(busStationListRes.data, { explicitArray: false });
    //   const resultCode = result.response.msgHeader.resultCode;
    //   if (resultCode !== '0') {
    //       console.log(`Error fetching data for lat,lon ${lat},${lon}`);
    //       throw new Error(`Error fetching data for lat,lon ${lat},${lon}`);
    //   }
  
    //   // busStationAroundList
    //   const busStationAroundList = result.response.msgBody.busStationAroundList;
    //   const routeData = Array.isArray(busStationAroundList) ? busStationAroundList : [busStationAroundList];
    //   const resData = routeData.map(item => ({
    //       centerYn: item.centerYn,
    //       districtCd: item.districtCd,
    //       mobileNo: item.mobileNo,
    //       regionName: item.regionName ,
    //       stationId: item.stationId,
    //       stationName: item.stationName,
    //       x: item.x,
    //       y: item.y,
    //       distance: item.distance,
    //   }));

      console.log(resData)
      res.json(resData);
  
      // const items = await BusRouteInfo.find();
      // res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Get all todos
router.get('/getGBusStations', async (req, res) => {
  try {
    const lat = req.query.lat
    const lon = req.query.lon
    console.log("lat,lon:",lat,lon)

    // Fetch data from the external API
    console.log("BUS_STATION_AROUND_LIST_URL",BUS_STATION_AROUND_LIST_URL)
    const params = {y: lat, x:lon}
    console.log(params)
    const busStationListRes = await axios.get(BUS_STATION_AROUND_LIST_URL,{params} );
    // const busArrivalResData = busStationListRes.data
    console.log(busStationListRes.data)

    const resultCode = busStationListRes.data.response.msgHeader.resultCode;
    console.log("resultCode",resultCode)
        // XML 데이터를 JSON으로 변환
    // const result = await xml2js.parseStringPromise(busStationListRes.data, { explicitArray: false });
    // const resultCode = result.response.msgHeader.resultCode;
    if (resultCode !== 0) {
        console.log(`Error fetching data for lat,lon ${lat},${lon}`);
        throw new Error(`Error fetching data for lat,lon ${lat},${lon}`);
    }

    // busStationAroundList
    const busStationAroundList = busStationListRes.data.response.msgBody.busStationAroundList;
    const routeData = Array.isArray(busStationAroundList) ? busStationAroundList : [busStationAroundList];
    const resData = routeData.map(item => ({
        centerYn: item.centerYn,
        districtCd: item.districtCd,
        mobileNo: item.mobileNo,
        regionName: item.regionName ,
        stationId: item.stationId,
        stationName: item.stationName,
        x: item.x,
        y: item.y,
        distance: item.distance,
    }));

    console.log(resData)
    res.json(resData);

    // const items = await BusRouteInfo.find();
    // res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/getGbusMsgForStation', async (req, res) => {
    try {
  
      let stationId = req.query.station_id;
      // let subwayNm = req.query.subwayNm;
  
      try {
          // Fetch data from the external API
          console.log(BUS_ARRIVAL_URL)
          const params = {stationId: stationId}
          console.log(params)
          const busArrivalRes = await axios.get(BUS_ARRIVAL_URL,{params} );
          const busArrivalResData = busArrivalRes.data
          console.log(busArrivalResData)
              // XML 데이터를 JSON으로 변환
          // const result = await xml2js.parseStringPromise(busArrivalResData, { explicitArray: false });
          const resultCode = busArrivalResData.response.msgHeader.resultCode;
          if (resultCode !== 0) {
            console.log(`Error fetching data for stationId ${stationId}`);
            throw new Error(`Error fetching data for stationId ${stationId}`);
          }
  
          const busArrivalList = busArrivalResData.response.msgBody.busArrivalList;
          const routeData = Array.isArray(busArrivalList) ? busArrivalList : [busArrivalList];
          const resData = routeData.map(item => ({
            stationId,
            routeId: item.routeId,
            flag: item.flag,
            locationNo1: item.locationNo1,
            locationNo2: item.locationNo2 || null,
            lowPlate1: item.lowPlate1,
            lowPlate2: item.lowPlate2 || null,
            plateNo1: item.plateNo1,
            plateNo2: item.plateNo2 || null,
            predictTime1: item.predictTime1,
            predictTime2: item.predictTime2 || null,
            remainSeatCnt1: item.remainSeatCnt1,
            remainSeatCnt2: item.remainSeatCnt2 || null,
            staOrder: item.staOrder,
          }));
  
          console.log(resData)
          const resultData = await Promise.all(
            resData.map(async (item) => {
              try {
                const existingBusRouteInfo = await BusRouteInfo.findOne({ routeId: item.routeId });
                
                // 기존 정보가 있을 경우 item에 추가, 없을 경우 기본 정보 유지
                if (existingBusRouteInfo) {
                  return {
                    ...item,
                    routeInfo: {
                      regionName: existingBusRouteInfo.regionName,
                      routeName: existingBusRouteInfo.routeName,
                      startStationName: existingBusRouteInfo.startStationName,
                      endStationName: existingBusRouteInfo.endStationName,
                      routeTypeName: existingBusRouteInfo.routeTypeName,
                    }
                  };
                } else {
                  console.log("No existingBusRouteInfo found for routeId:", item.routeId);
                  return item; // 기본 정보 반환
                }
              } catch (error) {
                console.error('Error fetching data:', error);
                throw error; // 상위 스코프에서 에러 처리
              }
            })
          );
          
          // resultData 사용 예시 (예: API 응답으로 반환)
          res.status(200).json(resultData);
  
      } catch (error) {
          console.error('Error fetching data:', error);
          res.status(500).json({ error: 'Failed to fetch data' });
      }
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

  module.exports = router;
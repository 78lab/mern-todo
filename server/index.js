const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const xml2js = require('xml2js');

const MetroStation = require('./models/MetroStation');
const BusRouteInfo = require('./models/BusRouteInfo');

const cors = require('cors');
require('dotenv').config();

const { PUB_DATA_API_KEY, SEOUL_SERVICE_KEY } = process.env;
// const todoRoutes = require('./routes/todoRoutes');
const metroRoutes = require('./routes/metroRoutes');

const app = express();
const PORT = process.env.PORT || 5009;

const BUS_BASE_URL = "https://apis.data.go.kr/6410000"
const BUS_ARRIVAL_URL = BUS_BASE_URL + `/busarrivalservice/getBusArrivalList?serviceKey=${PUB_DATA_API_KEY}`

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/todos', todoRoutes);
app.use('/metro', metroRoutes);

app.get('/getGbusMsgForStation', async (req, res) => {
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
        const result = await xml2js.parseStringPromise(busArrivalResData, { explicitArray: false });
        const resultCode = result.response.msgHeader.resultCode;
        if (resultCode !== '0') {
          console.log(`Error fetching data for stationId ${stationId}`);
          throw new Error(`Error fetching data for stationId ${stationId}`);
        }

        const busArrivalList = result.response.msgBody.busArrivalList;
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
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/todos', todoRoutes);

// const KAKAO_API_KEY = "KakaoAK 59d6afe3e3b5669568c1be0f4c22c65e";
// const AIR_SERVICE_KEY = "AruAfuXNbzd/SJ3kjpQFaLUngxr8ce4O1IKHJFtPxxk8CBngL8FvTffnsrWwirDx4t1kESNbX1nS7M3z4x5tuQ==";
const nearAirStationUrl = "https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList"
const getTMxyUrl = "https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getTMStdrCrdnt"
const getAirConUrl = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty"

app.get('/mise',async (req, res) => {
    let stationName = 'Jongro';
    // //let airConditionRes;
    let addr = 'Seoul';
    let msg = 'The api ver is 1.2';
    // let geoRes = [];
    let x = req.query.x;
    let y = req.query.y;
    // let items = [];
    let forecast = {pm10:[1,2,1],pm25:[1,2,3],o3:[1,2,2],time:'17:00 기준'}
    let sido;
    console.log('x,y:',x,y);

    // res.json();

    try {
        const data = {}

        const geoRes = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json',{
            headers: {'Authorization': process.env.KAKAO_API_KEY},
            params: {
              x:x, y:y, input_coord:"WGS84"
            }
          })

        const umdName = geoRes.data.documents[0].address.region_3depth_name
        console.log(umdName)

        const getTMxyRes = await axios.get(getTMxyUrl,{
            params: {
              serviceKey: process.env.AIR_SERVICE_KEY,   // 자신의 API 키 사용
              returnType: 'json',
              numOfRows: 10,
              pageNo: 1,
              umdName,                // 클라이언트에서 받은 umdName 파라미터 전달
            },
          })
        // console.log(getTMxyRes)
        const tmData = getTMxyRes.data.response.body.items[0]
        console.log(tmData)
        // tmX, tmY 값 추출
        const tmX = tmData.tmX;
        const tmY = tmData.tmY;
        console.log(tmX,tmY)

        const nearAirStationRes = await axios.get(nearAirStationUrl,{
            params: {
                serviceKey: process.env.AIR_SERVICE_KEY,   // 자신의 API 키 사용 (my_key 자리에 본인의 키 입력)
                returnType: 'json',
                tmX,                    // 클라이언트로부터 받은 tmX 값
                tmY,                    // 클라이언트로부터 받은 tmY 값
                ver:'1.1',                    // 클라이언트로부터 받은 API 버전 (ver)
              },
        })

        // data.nearAirStations = nearAirStationRes.data.response.body.items
        data.stationName = nearAirStationRes.data.response.body.items[0].stationName

        const nearAirConditionRes = await axios.get(getAirConUrl,{
            params: {
                serviceKey: process.env.AIR_SERVICE_KEY,   // 자신의 API 키 사용 (my_key 자리에 본인의 키 입력)
                returnType: 'json',
                numOfRows: 3,
                pageNo: 1,
                stationName: data.stationName,
                dataTerm: 'DAILY',
                ver: '1.2',
              },
        })

        
        data.items = nearAirConditionRes.data.response.body.items.map(item => ({...item, stationName: data.stationName}))
        data.addr = geoRes.data.documents[0].address.address_name
        data.msg = msg
        data.forecast = forecast
        data.sido = sido
    

        // // 외부 API 요청 (예: JSONPlaceholder)
        // const externalApi = axios.get('https://jsonplaceholder.typicode.com/posts');
    
        // // MongoDB 데이터 조회
        // const dbData = MyData.find();
    
        // // 두 비동기 작업을 동시에 실행
        // const [externalApiResponse, dbDataResponse] = await Promise.all([externalApi, dbData]);
    
        // // 외부 API 데이터와 MongoDB 데이터를 가공하여 JSON으로 출력
        // const processedData = {
        //   externalData: externalApiResponse.data.map(post => ({
        //     id: post.id,
        //     title: post.title,
        //     body: post.body,
        //   })),
        //   dbData: dbDataResponse.map(item => ({
        //     name: item.name,
        //     value: item.value,
        //   })),
        // };

        res.json(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }


  });

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

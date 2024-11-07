const mongoose = require('mongoose');

const BusRouteInfoSchema = new mongoose.Schema({
  routeId: { type: String, required: true },
  companyId: { type: String },
  companyName: { type: String },
  companyTel: { type: String },
  districtCd: { type: String, required: true },
  downFirstTime: { type: String, required: true },
  downLastTime: { type: String, required: true },
  endStationId: { type: String, required: true },
  endStationName: { type: String, required: true },
  nPeekAlloc: { type: String, required: true },
  peekAlloc: { type: String, required: true },
  regionName: { type: String, required: true },
  routeName: { type: String, required: true },
  routeTypeCd: { type: String, required: true },
  routeTypeName: { type: String, required: true },
  startMobileNo: { type: String, required: true },
  startStationId: { type: String, required: true },
  startStationName: { type: String, required: true },
  upFirstTime: { type: String, required: true },
  upLastTime: { type: String, required: true }
  }, { timestamps: true });

const BusRouteInfo = mongoose.model('BusRouteInfo', BusRouteInfoSchema);

module.exports = BusRouteInfo;

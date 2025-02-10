const mongoose = require('mongoose');

const BusRouteInfoSchema = new mongoose.Schema({
  routeId: { type: Number, required: true },
  companyId: { type: Number },
  companyName: { type: String },
  companyTel: { type: String },
  districtCd: { type: Number, required: true },
  downFirstTime: { type: String, required: true },
  downLastTime: { type: String, required: true },
  endStationId: { type: Number, required: true },
  endStationName: { type: String, required: true },
  nPeekAlloc: { type: Number, required: true },
  peekAlloc: { type: Number, required: true },
  regionName: { type: String, required: true },
  routeName: { type: String, required: true },
  routeTypeCd: { type: Number, required: true },
  routeTypeName: { type: String, required: true },
  startMobileNo: { type: String, required: true },
  startStationId: { type: Number, required: true },
  startStationName: { type: String, required: true },
  upFirstTime: { type: String, required: true },
  upLastTime: { type: String, required: true }
  }, { timestamps: true });

const BusRouteInfo = mongoose.model('BusRouteInfo', BusRouteInfoSchema);

module.exports = BusRouteInfo;

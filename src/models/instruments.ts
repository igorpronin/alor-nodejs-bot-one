const {handleError} = require('../../utils');
import sequelize from '../db';
import {DataTypes} from 'sequelize';

export interface IInstrument {
  symbol: string
  shortname: string
  type: string
  type_code: number
  lotsize: number
  facevalue: number
  cfi_code: string
  cancellation: string
  minstep: number
  rating: number
  marginbuy: number
  marginsell: number
  marginrate: number
  pricestep: number
  price_max: number
  price_min: number
  theor_price: number
  theor_price_limit: number
  volatility: number
  currency: string
  isin: string
  yield: string
  primary_board: string
  trading_status: number
  trading_status_info: string
  complex_product_category: string
}

// https://alor.dev/docs#model-security
const Instrument = sequelize.define('instruments', {
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  shortname: {
    type: DataTypes.STRING
  },
  type_code: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.TEXT
  },
  lotsize: {
    type: DataTypes.INTEGER
  },
  facevalue: {
    type: DataTypes.NUMBER
  },
  cfi_code: {
    type: DataTypes.STRING
  },
  cancellation: {
    type: DataTypes.STRING
  },
  minstep: {
    type: DataTypes.NUMBER
  },
  rating: {
    type: DataTypes.NUMBER
  },
  marginbuy: {
    type: DataTypes.NUMBER
  },
  marginsell: {
    type: DataTypes.NUMBER
  },
  marginrate: {
    type: DataTypes.NUMBER
  },
  pricestep: {
    type: DataTypes.NUMBER
  },
  price_max: {
    type: DataTypes.NUMBER
  },
  price_min: {
    type: DataTypes.NUMBER
  },
  theor_price: {
    type: DataTypes.NUMBER
  },
  theor_price_limit: {
    type: DataTypes.NUMBER
  },
  volatility: {
    type: DataTypes.NUMBER
  },
  currency: {
    type: DataTypes.STRING
  },
  isin: {
    type: DataTypes.STRING
  },
  yield: {
    type: DataTypes.STRING
  },
  primary_board: {
    type: DataTypes.STRING
  },
  trading_status: {
    type: DataTypes.INTEGER
  },
  trading_status_info: {
    type: DataTypes.STRING
  },
  complex_product_category: {
    type: DataTypes.STRING
  }
}, {
  // Other model options go here
});

export const addOrUpdateInstrument = async (data: IInstrument) => {
  try {
    const result = await Instrument.upsert(data);
    if (result && result[0]) {
      return result[0].getDataValue('symbol') === data.symbol;
    }
    return null;
  } catch (e) {
    handleError(e);
    return null;
  }
}

export default Instrument;

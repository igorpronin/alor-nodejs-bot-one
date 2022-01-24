const {handleError} = require('../../utils');
import sequelize from '../db';
import {DataTypes} from 'sequelize';

const Setting = sequelize.define('settings', {
  parameter: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  // Other model options go here
});

export const addSetting = async (parameter: string, value: string | null, description: string | null): Promise<boolean | null> => {
  try {
    const res: any = await Setting.create({parameter, value, description});
    return res.parameter === parameter;
  } catch (e: any) {
    if (e?.parent?.errno === 19) {
      return true;
    }
    handleError(e);
    return null;
  }
}

export const getSettingRowByParam = async (parameter: string) => {
  const result = await Setting.findOne({
    where: {parameter}
  });
  if (result) return result.get();
  return null;
}

export const updateSettingVal = async (parameter: string, value: string | null) => {
  try {
    const result = await Setting.update(
      {value},
      {where: {parameter}});
    return result[0] === 1;
  } catch (e) {
    handleError(e);
    return null;
  }
}

export default Setting;

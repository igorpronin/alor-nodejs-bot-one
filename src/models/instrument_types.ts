import sequelize from '../db';
import {DataTypes} from 'sequelize';

// https://alor.dev/docs#model-security

const InstrumentType = sequelize.define('instrument_types', {
  type_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  // Other model options go here
});

export const addInstrumentType = async (type_code: number, description: string): Promise<boolean | null> => {
  try {
    const res: any = await InstrumentType.create({type_code, description});
    return res.type_code === type_code;
  } catch (e: any) {
    if (e?.parent?.errno === 19) {
      return true;
    }
    // handle error
    console.log(e);
    return null;
  }
}

export default InstrumentType;

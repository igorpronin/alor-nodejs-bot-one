import {Sequelize, DataTypes} from 'sequelize';
import root from 'app-root-path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${root}/data/db.sqlite`,
  define: {underscored: true}
});

export default sequelize;

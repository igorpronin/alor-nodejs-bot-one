import {Sequelize, DataTypes} from 'sequelize';
import root from 'app-root-path';

const SQL_CONSOLE_OUTPUT = false;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${root}/data/db.sqlite`,
  define: {underscored: true},
  logging: SQL_CONSOLE_OUTPUT
});

export default sequelize;

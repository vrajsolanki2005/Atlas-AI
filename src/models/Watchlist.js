const {DataTypes}=require('sequelize')
const sequelize=require('../config/db');
const User = require('./User');

const WatchList = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  company:{
    type:DataTypes.STRING,
    allowNull:false
  },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'company'],
      },
    ],
  }
);

User.hasMany(WatchList, { foreignKey: 'userId' })
WatchList.belongsTo(User, { foreignKey: 'userId' })

module.exports=WatchList;
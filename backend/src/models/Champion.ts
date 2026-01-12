import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define Champion attributes interface
export interface ChampionAttributes {
  championName: string;
  role: string;
  genre: string;
  espece: string;
  ressource: string;
  range: string;
  regions: string;
  releaseDate: string;
  iconUrl: string;
}

// Define creation attributes (for creating new champions)
export interface ChampionCreationAttributes extends Optional<ChampionAttributes, 'championName'> {}

// Define the Champion model class
export class Champion extends Model<ChampionAttributes, ChampionCreationAttributes> implements ChampionAttributes {
  public championName!: string;
  public role!: string;
  public genre!: string;
  public espece!: string;
  public ressource!: string;
  public range!: string;
  public regions!: string;
  public releaseDate!: string;
  public iconUrl!: string;
}

// Initialize the model
Champion.init(
  {
    championName: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      field: 'championname' // Map to lowercase database column
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    genre: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    espece: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ressource: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    range: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    regions: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'releasedate'
    },
    iconUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'iconurl'
    }
  },
  {
    sequelize,
    tableName: 'champion',
    timestamps: false, // No createdAt/updatedAt columns
    freezeTableName: true, // Don't pluralize table name
    underscored: true // Keep JSON keys in lowercase (championName -> championname)
  }
);

export default Champion;

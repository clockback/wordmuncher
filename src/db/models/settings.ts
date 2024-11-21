import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import sequelize from "./index";
import TonguePair from "./tonguepair";

class Settings extends Model<
    InferAttributes<Settings, { omit: "tonguePair" }>,
    InferCreationAttributes<Settings, { omit: "tonguePair" }>
> {
    declare id: CreationOptional<number>;

    declare tonguePairId?: ForeignKey<TonguePair["id"]>;
    declare tonguePair?: NonAttribute<TonguePair>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Settings.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            onUpdate: "CASCADE",
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Settings",
        timestamps: true,
    },
);

Settings.belongsTo(TonguePair, {
    foreignKey: "tonguePairId",
    as: "tonguePair",
});

export default Settings;

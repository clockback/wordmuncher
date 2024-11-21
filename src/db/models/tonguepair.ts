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
import Tongue from "./tongue";

class TonguePair extends Model<
    InferAttributes<TonguePair, { omit: "translateFrom" | "translateTo" }>,
    InferCreationAttributes<
        TonguePair,
        { omit: "translateFrom" | "translateTo" }
    >
> {
    declare id: CreationOptional<number>;

    declare translateFromTongueId: ForeignKey<Tongue["id"]>;
    declare translateFrom: NonAttribute<Tongue>;

    declare translateToTongueId: ForeignKey<Tongue["id"]>;
    declare translateTo: NonAttribute<Tongue>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    async translateFromTongue(): Promise<Tongue> {
        return Tongue.findOne({
            where: { id: this.translateFromTongueId },
        });
    }

    async translateToTongue(): Promise<Tongue> {
        return Tongue.findOne({
            where: { id: this.translateToTongueId },
        });
    }
}

TonguePair.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        translateFromTongueId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        translateToTongueId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "TonguePair",
        timestamps: true,
    },
);

Tongue.hasMany(TonguePair, {
    foreignKey: "translateFromTongueId",
});
Tongue.hasMany(TonguePair, {
    foreignKey: "translateToTongueId",
});
TonguePair.belongsTo(Tongue, {
    foreignKey: "translateFromTongueId",
    as: "translateFrom",
});
TonguePair.belongsTo(Tongue, {
    foreignKey: "translateToTongueId",
    as: "translateTo",
});

Tongue.belongsToMany(Tongue, {
    through: TonguePair,
    foreignKey: "translateFromTongueId",
    as: "translateToTongueId",
});
Tongue.belongsToMany(Tongue, {
    through: TonguePair,
    foreignKey: "translateToTongueId",
    as: "translateFromTongueId",
});

export default TonguePair;

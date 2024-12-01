import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import sequelize from "./db-connection";
import { Tongue } from "@models";

export class TonguePair extends Model<
    InferAttributes<TonguePair, { omit: "nativeTongue" | "studyingTongue" }>,
    InferCreationAttributes<
        TonguePair,
        { omit: "nativeTongue" | "studyingTongue" }
    >
> {
    declare id: CreationOptional<number>;

    declare nativeTongueId: ForeignKey<Tongue["id"]>;
    declare native: NonAttribute<Tongue>;

    declare studyingTongueId: ForeignKey<Tongue["id"]>;
    declare studying: NonAttribute<Tongue>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    async nativeTongue(): Promise<Tongue> {
        return Tongue.findOne({
            where: { id: this.nativeTongueId },
        });
    }

    async studyingTongue(): Promise<Tongue> {
        return Tongue.findOne({
            where: { id: this.studyingTongueId },
        });
    }

    static associate() {
        TonguePair.belongsTo(Tongue, {
            foreignKey: "nativeTongueId",
            as: "native",
        });
        TonguePair.belongsTo(Tongue, {
            foreignKey: "studyingTongueId",
            as: "studying",
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
        nativeTongueId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        studyingTongueId: {
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

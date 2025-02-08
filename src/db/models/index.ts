import { Answer } from "./answer";
import { InflectionAnswer } from "./inflection-answer";
import { InflectionCategory } from "./inflection-category";
import { InflectionFeature } from "./inflection-feature";
import { InflectionType } from "./inflection-type";
import { Question } from "./question";
import { Result } from "./result";
import { Settings } from "./settings";
import { Sheet } from "./sheet";
import { SheetQuestion } from "./sheetquestion";
import { Tongue } from "./tongue";
import { TonguePair } from "./tonguepair";

for (const model of [
    Answer,
    Result,
    InflectionAnswer,
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Tongue,
    TonguePair,
    Settings,
    Sheet,
    Question,
    SheetQuestion,
]) {
    model.associate();
}

export { Answer } from "./answer";
export { InflectionAnswer } from "./inflection-answer";
export { InflectionCategory } from "./inflection-category";
export { InflectionFeature } from "./inflection-feature";
export { InflectionType } from "./inflection-type";
export { Result } from "./result";
export { Tongue } from "./tongue";
export { TonguePair } from "./tonguepair";
export { Settings } from "./settings";
export { Sheet } from "./sheet";
export { Question } from "./question";
export { SheetQuestion } from "./sheetquestion";

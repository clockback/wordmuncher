import { Answer } from "./answer";
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
export { InflectionType } from "./inflection-type";
export { Result } from "./result";
export { Tongue } from "./tongue";
export { TonguePair } from "./tonguepair";
export { Settings } from "./settings";
export { Sheet } from "./sheet";
export { Question } from "./question";
export { SheetQuestion } from "./sheetquestion";

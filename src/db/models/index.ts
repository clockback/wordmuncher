import { Tongue } from "./tongue";
import { TonguePair } from "./tonguepair";
import { Settings } from "./settings";
import { Sheet } from "./sheet";
import { Question } from "./question";
import { SheetQuestion } from "./sheetquestion";

for (const model of [
    Tongue,
    TonguePair,
    Settings,
    Sheet,
    Question,
    SheetQuestion,
]) {
    model.associate();
}

export { Tongue } from "./tongue";
export { TonguePair } from "./tonguepair";
export { Settings } from "./settings";
export { Sheet } from "./sheet";
export { Question } from "./question";
export { SheetQuestion } from "./sheetquestion";

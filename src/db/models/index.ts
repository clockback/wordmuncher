import { Question } from "./question";
import { Settings } from "./settings";
import { Sheet } from "./sheet";
import { SheetQuestion } from "./sheetquestion";
import { Tongue } from "./tongue";
import { TonguePair } from "./tonguepair";

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

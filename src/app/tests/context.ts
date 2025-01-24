import { Dispatch, SetStateAction, createContext } from "react";

interface TestsContextType {
    selectedRowId: number;
    setSelectedRowId: Dispatch<SetStateAction<number>>;
}

const testsContext = createContext<TestsContextType | undefined>(undefined);
export default testsContext;

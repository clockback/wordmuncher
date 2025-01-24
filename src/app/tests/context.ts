import { createContext } from "react";

interface TestsContextType {
    selectedRowId: number;
    setSelectedRowId: (value: number) => void;
}

const testsContext = createContext<TestsContextType | undefined>(undefined);
export default testsContext;

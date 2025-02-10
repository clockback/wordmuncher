import { Dispatch, SetStateAction, createContext } from "react";

interface EditInflectionTemplate {
    isPending: boolean;
    setIsPending: Dispatch<SetStateAction<boolean>>;
}

const editInflectionContext = createContext<EditInflectionTemplate | undefined>(
    undefined,
);
export default editInflectionContext;

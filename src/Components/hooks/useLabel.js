import { useContext } from "react";
import { LabelContext } from "../context/LabelContext";
export const useLabel = () => useContext(LabelContext).t;

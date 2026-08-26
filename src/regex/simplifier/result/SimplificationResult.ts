import { RegEx } from "../../models/regex/RegEx.ts";
import { SimplificationStep } from "./SimplificationStep.ts";

export interface SimplificationResult {
    initial: RegEx;
    steps: SimplificationStep[];
    result: RegEx;
}

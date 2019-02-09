import * as React from "react";
import {Command} from "../types";
import {TextApi, TextState} from "../types/CommandOptions";
import {getBreaksNeededForEmptyLineAfter, getBreaksNeededForEmptyLineBefore, selectWord} from "../util/MarkdownUtil";

export type AlterLineFunction = (line: string, index: number) => string;

/**
 * Inserts insertionString before each line
 */
export function insertBeforeEachLine(selectedText: string, insert: string | AlterLineFunction):
    { modifiedText: string, insertionLength: number } {
    const lines = selectedText.split(/\n/);

    let insertionLength = 0;
    const modifiedText = lines.map((item, index) => {
        if (typeof insert === "string") {
            insertionLength += insert.length;
            return insert + item;
        } else if (typeof insert === "function") {
            const insertionResult = insert(item, index);
            insertionLength += insertionResult.length;
            return insert(item, index) + item;
        }
        throw Error("insertion is expected to be either a string or a function");
    }).join("\n");

    return {modifiedText, insertionLength}
}

export const unorderedListCommand: Command = {
    name: "code",
    buttonContentBuilder: ({iconProvider}) => iconProvider("list-ul"),
    buttonProps: {"aria-label": "Add unordered list"},
    execute: (state0: TextState, api: TextApi) => {
        // Adjust the selection to encompass the whole word if the caret is inside one
        const newSelectionRange = selectWord({text: state0.text, selection: state0.selection});
        const state1 = api.setSelectionRange(newSelectionRange);

        const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
        const breaksBefore = Array(breaksBeforeCount + 1).join("\n");

        const breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
        const breaksAfter = Array(breaksAfterCount + 1).join("\n");

        const state2 = api.replaceSelection(`${breaksBefore}${state1.selectedText}${breaksAfter}`);

        // const modifiedText = insertBeforeEachLine(state2.selectedText, "- ");
        // const state3 = api.replaceSelection(modifiedText.modifiedText);

        const modifiedText = { insertionLength: 0 };
        const state3 = state2;

        const selectionRange = {
            start: state3.selection.end - state1.selectedText.length - breaksAfterCount,
            end: state3.selection.end - breaksAfterCount
        };

        // Adjust the selection to not contain the **
        api.setSelectionRange(selectionRange);
    }
    ,
    keyCommand: "code",
}
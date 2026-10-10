import { ANTLRErrorListener } from 'antlr4ng'

class SqlBaseErrorListener implements ANTLRErrorListener {
    markers: any[]

    constructor() {
        this.markers = []
    }

    getMarkers() {
        return this.markers
    }

    //syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>, offendingSymbol: S | null, line: number, charPositionInLine: number, msg: string, e: RecognitionException | null): void;
    syntaxError(
        recognizer: any,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: any
    ): void {
        // Handle the error (e.g., log it, add it to a list, etc.)
        const startColumn = charPositionInLine + 1
        // start and stop index the whole input, not the line; EOF spans nothing
        const length = offendingSymbol ? offendingSymbol.stop - offendingSymbol.start + 1 : 0
        this.markers.push({
            startLineNumber: line,
            startColumn,
            endLineNumber: line,
            endColumn: startColumn + Math.max(length, 1),
            message: msg,
            severity: 8,
        })
    }

    //reportAmbiguity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void;
    reportAmbiguity(
        recognizer: any,
        dfa: any,
        startIndex: number,
        stopIndex: number,
        exact: boolean,
        ambigAlts: any,
        configs: any
    ): void {
        // Handle the ambiguity (e.g., log it, add it to a list, etc.)
    }

    //reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, configs: ATNConfigSet): void;
    reportContextSensitivity(
        recognizer: any,
        dfa: any,
        startIndex: number,
        stopIndex: number,
        prediction: number,
        configs: any
    ): void {
        // Handle the context sensitivity (e.g., log it, add it to a list, etc.)
    }

    // reportAttemptingFullContext(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, configs: ATNConfigSet): void;
    reportAttemptingFullContext(
        recognizer: any,
        dfa: any,
        startIndex: number,
        stopIndex: number,
        conflictingAlts: any,
        configs: any
    ): void {
        // Handle the full context attempt (e.g., log it, add it to a list, etc.)
    }
}

export default SqlBaseErrorListener

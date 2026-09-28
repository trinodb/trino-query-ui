import { describe, it, expect } from 'vitest'
import SqlBaseErrorListener from './SqlBaseErrorListener'

// ANTLR reports `charPositionInLine` counting from zero, while Monaco columns count
// from one, and `start` and `stop` index the whole input rather than the line.
const token = (start: number, stop: number) => ({ start, stop })

const markerFor = (offendingSymbol: any, line: number, charPositionInLine: number) => {
    const listener = new SqlBaseErrorListener()
    listener.syntaxError(null, offendingSymbol, line, charPositionInLine, 'boom', null)
    return listener.getMarkers()[0]
}

describe('SqlBaseErrorListener', () => {
    it('marks only the offending token', () => {
        // `BY` at line 3, column 10, two characters long
        const marker = markerFor(token(47, 48), 3, 9)
        expect(marker).toMatchObject({
            startLineNumber: 3,
            startColumn: 10,
            endLineNumber: 3,
            endColumn: 12,
            message: 'boom',
            severity: 8,
        })
    })

    // Regression test: sizing the marker from `stop` treated a whole-input offset as a
    // column, so on every line after the first the squiggle ran past the token, usually
    // to the end of the line.
    it('does not widen the marker on lines after the first', () => {
        const onLineOne = markerFor(token(7, 8), 1, 7)
        const onLineFive = markerFor(token(407, 408), 5, 7)
        expect(onLineFive.endColumn - onLineFive.startColumn).toBe(onLineOne.endColumn - onLineOne.startColumn)
        expect(onLineFive.endColumn).toBe(10)
    })

    it('marks a single column for the end-of-file token', () => {
        // ANTLR gives EOF a stop before its start, so the token has no length
        const marker = markerFor(token(21, 20), 2, 4)
        expect(marker.startColumn).toBe(5)
        expect(marker.endColumn).toBe(6)
    })

    it('marks a single column when there is no offending symbol', () => {
        const marker = markerFor(null, 1, 0)
        expect(marker.startColumn).toBe(1)
        expect(marker.endColumn).toBe(2)
    })
})

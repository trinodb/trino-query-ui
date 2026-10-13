import { describe, it, expect } from 'vitest'
import { formatTableAsCsv } from './formatTableAsCsv'

const columns = [{ name: 'id' }, { name: 'value' }]

describe('formatTableAsCsv', () => {
    it('returns an empty string without columns', () => {
        expect(formatTableAsCsv([[[1, 'a']]], [])).toBe('')
    })

    it('writes only the header for an empty result', () => {
        expect(formatTableAsCsv([], columns)).toBe('id,value')
    })

    it('joins the rows of all pages below the header', () => {
        const results = [[[1, 'a']], [[2, 'b']]]
        expect(formatTableAsCsv(results, columns)).toBe('id,value\n1,a\n2,b')
    })

    it('quotes fields containing commas, quotes, and line breaks', () => {
        const results = [[['a,b', 'say "hi"', 'line\nbreak', 'carriage\rreturn']]]
        const fourColumns = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }]
        expect(formatTableAsCsv(results, fourColumns)).toBe(
            'a,b,c,d\n"a,b","say ""hi""","line\nbreak","carriage\rreturn"'
        )
    })

    it('quotes column names that need it', () => {
        expect(formatTableAsCsv([], [{ name: 'a,b' }])).toBe('"a,b"')
    })

    it('writes null and undefined as empty fields', () => {
        expect(formatTableAsCsv([[[null, undefined]]], columns)).toBe('id,value\n,')
    })

    it('formats booleans and complex types like the result grid', () => {
        const results = [[[true, [1, 2]]]]
        expect(formatTableAsCsv(results, columns)).toBe('id,value\ntrue,"[1,2]"')
    })
})

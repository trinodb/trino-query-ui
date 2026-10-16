import { describe, it, expect } from 'vitest'
import { findTokenMismatch } from './sqlTokens'

describe('findTokenMismatch', () => {
    it('accepts identical queries', () => {
        expect(findTokenMismatch('select a from t', 'select a from t')).toBeUndefined()
    })

    it('ignores whitespace and line breaks', () => {
        expect(findTokenMismatch('select a, b from t', 'SELECT\n  a,\n  b\nFROM\n  t')).toBeUndefined()
    })

    it('ignores the case of keywords and unquoted identifiers', () => {
        expect(findTokenMismatch('select Name from Nation', 'SELECT name FROM nation')).toBeUndefined()
    })

    // The generic ANSI SQL dialect of sql-formatter produced exactly this before the
    // Trino dialect was selected.
    it('detects a split lambda arrow', () => {
        expect(findTokenMismatch('select filter(a, x -> x > 0) from t', 'SELECT filter(a, x - > x > 0) FROM t')).toBe(
            'expected "->" at line 1, column 20 but found "-" at line 1, column 20'
        )
    })

    it('compares string literals exactly', () => {
        expect(findTokenMismatch("select 'Abc'", "SELECT 'abc'")).toBeDefined()
        expect(findTokenMismatch("select 'a  b'", "SELECT 'a b'")).toBeDefined()
    })

    it('compares quoted identifiers exactly', () => {
        expect(findTokenMismatch('select "Name" from t', 'SELECT "name" FROM t')).toBeDefined()
        expect(findTokenMismatch('select `Name` from t', 'SELECT `name` FROM t')).toBeDefined()
    })

    it('compares unicode strings exactly apart from the prefix', () => {
        expect(findTokenMismatch("select u&'Abc'", "SELECT U&'Abc'")).toBeUndefined()
        expect(findTokenMismatch("select u&'Abc'", "SELECT U&'abc'")).toBeDefined()
    })

    it('ignores whitespace inside comments', () => {
        expect(findTokenMismatch('select a -- keep  me\nfrom t', 'SELECT\n  a -- keep me\nFROM\n  t')).toBeUndefined()
        expect(findTokenMismatch('select /* one\n   two */ a', 'SELECT\n  /* one\n  two */ a')).toBeUndefined()
    })

    it('detects a changed or dropped comment', () => {
        expect(findTokenMismatch('select a -- keep me\nfrom t', 'SELECT a -- kept me\nFROM t')).toBeDefined()
        expect(findTokenMismatch('select a -- keep me\nfrom t', 'SELECT a FROM t')).toBeDefined()
    })

    it('detects missing and extra tokens', () => {
        expect(findTokenMismatch('select a from t;', 'SELECT a FROM t')).toBe(
            'expected ";" at line 1, column 16 but found the end of the query'
        )
        expect(findTokenMismatch('select a from t', 'SELECT a FROM t;')).toBe(
            'expected the end of the query but found ";" at line 1, column 16'
        )
    })

    it('reports the position of a mismatch in a later statement', () => {
        expect(findTokenMismatch('select 1; select 2', 'SELECT\n  1;\n\n\nSELECT\n  3')).toBe(
            'expected "2" at line 1, column 18 but found "3" at line 6, column 3'
        )
    })

    it('compares characters the lexer does not recognize', () => {
        expect(findTokenMismatch('select a from t $', 'SELECT a FROM t $')).toBeUndefined()
        expect(findTokenMismatch('select a from t $', 'SELECT a FROM t ^')).toBeDefined()
    })

    it('handles incomplete SQL', () => {
        expect(findTokenMismatch("select 'unterminated", "SELECT 'unterminated")).toBeUndefined()
        expect(findTokenMismatch('select a from', 'SELECT\n  a\nFROM')).toBeUndefined()
    })
})

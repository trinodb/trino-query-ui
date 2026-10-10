import { describe, it, expect } from 'vitest'
import { formatSql } from './formatSql'

describe('formatSql', () => {
    // The editor used to pass `uppercase: true`, an option sql-formatter dropped in
    // version 5. Unknown keys are ignored rather than rejected, so keywords stayed
    // lowercase with no error to show for it.
    it('uppercases keywords', () => {
        expect(formatSql('select a from t')).toBe('SELECT\n  a\nFROM\n  t')
    })

    // Same story for `indent: '  '`, replaced by `tabWidth`.
    it('indents with two spaces', () => {
        expect(formatSql('select a, b from t')).toBe('SELECT\n  a,\n  b\nFROM\n  t')
    })

    // Without an explicit language sql-formatter falls back to generic ANSI SQL,
    // which splits the lambda arrow into `x - > x` and produces SQL that no longer
    // parses. The Trino dialect keeps it intact.
    it('keeps lambda arrows intact', () => {
        expect(formatSql('select filter(a, x -> x > 0) from t')).toContain('x -> x > 0')
    })

    // Generic ANSI SQL renders these as `try_cast (…)` and `ROW (…)`.
    it('does not insert a space before Trino function arguments', () => {
        expect(formatSql('select try_cast(x as decimal(10, 2)) from t')).toContain('try_cast(x AS decimal(10, 2))')
        expect(formatSql('select cast(r as row(a bigint)) from t')).toContain('row(a bigint)')
    })

    it('separates consecutive statements with two blank lines', () => {
        expect(formatSql('select 1; select 2')).toBe('SELECT\n  1;\n\n\nSELECT\n  2')
    })

    it('preserves trailing comments', () => {
        expect(formatSql('select a -- keep me\nfrom t')).toContain('a -- keep me')
    })
})

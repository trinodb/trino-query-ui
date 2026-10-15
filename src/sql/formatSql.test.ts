import { describe, it, expect, vi } from 'vitest'
import { format } from 'sql-formatter'
import { formatSql } from './formatSql'

vi.mock('sql-formatter', async (importOriginal) => {
    const original = await importOriginal<typeof import('sql-formatter')>()
    return { ...original, format: vi.fn(original.format) }
})

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

    // Generic ANSI SQL treats WITH as a clause and splits TIMESTAMP WITH TIME ZONE
    // across lines. The Trino dialect recognizes the complete type name.
    it('keeps TIMESTAMP WITH TIME ZONE together', () => {
        expect(formatSql("select cast('2026-10-14 12:00:00 UTC' as timestamp with time zone);")).toContain(
            'TIMESTAMP WITH TIME ZONE'
        )
    })

    it('separates consecutive statements with two blank lines', () => {
        expect(formatSql('select 1; select 2')).toBe('SELECT\n  1;\n\n\nSELECT\n  2')
    })

    it('preserves trailing comments', () => {
        expect(formatSql('select a -- keep me\nfrom t')).toContain('a -- keep me')
    })

    // Reproduces the lambda arrow bug of the generic ANSI SQL dialect, so the check
    // is exercised without depending on a current sql-formatter bug.
    it('rejects formatted SQL that changes the query tokens', () => {
        vi.mocked(format).mockReturnValueOnce('SELECT\n  filter(a, x - > x > 0)\nFROM\n  t')
        expect(() => formatSql('select filter(a, x -> x > 0) from t')).toThrow(
            'Formatting changed the query: expected "->" at line 1, column 20 but found "-" at line 2, column 15'
        )
    })

    // Guards against false positives from the token check on a range of Trino syntax.
    it.each([
        'with t as (select 1 as a) select * from t',
        'select nationkey, rank() over (partition by regionkey order by name desc) from tpch.sf1.nation',
        "select transform(array[1, 2], x -> x * 2), map(array['a'], array[1]), cast(row(1, 'b') as row(x bigint, y varchar))",
        "select json_extract_scalar('{\"a\": 1}', '$.a'), date '2026-10-14', interval '1' day, x'0aFF', u&'\\00E4'",
        'select a[1], b || c, d is distinct from e, case when f then 1 else 2 end from t where g between 1 and 10',
        'select * from unnest(array[1, 2]) as u(x) cross join (values (1, 2)) as v(a, b)',
        'select "Mixed Case", "x""y" from "Catalog"."Schema"."Table" order by 1 offset 5 fetch first 10 rows only',
        "create table memory.default.t (a bigint, b varchar) with (format = 'ORC')",
        "insert into t (a, b) values (1, 'x'), (2, 'y')",
        'select ? from t where a = ?',
        'explain analyze select count(*) from t',
        'show catalogs; show schemas from tpch; use tpch.sf1',
        'select 1.5e10, 0x1F, .5 /* block\n comment */ -- trailing\nfrom t',
        'select * from t match_recognize (partition by a order by b measures last(b) as lb pattern (x+) define x as x.b > 0)',
    ])('keeps the tokens of %s', (sql) => {
        expect(() => formatSql(sql)).not.toThrow()
    })
})

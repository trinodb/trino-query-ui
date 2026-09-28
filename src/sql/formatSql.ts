import { format, type FormatOptionsWithLanguage } from 'sql-formatter'

// sql-formatter replaced `indent` with `tabWidth` and `uppercase` with `keywordCase` in version 5,
// and it ignores unknown keys instead of rejecting them, so obsolete options fail silently.
// Annotating the options catches that at compile time rather than at runtime.
//
// `language` defaults to generic ANSI SQL, which breaks Trino syntax such as
// TIMESTAMP WITH TIME ZONE across several lines. Selecting the Trino dialect keeps it intact.
const formatOptions: FormatOptionsWithLanguage = {
    language: 'trino',
    tabWidth: 2,
    keywordCase: 'upper',
    linesBetweenQueries: 2,
}

// Format a Trino SQL statement, or several separated by semicolons.
export function formatSql(sql: string): string {
    return format(sql, formatOptions)
}

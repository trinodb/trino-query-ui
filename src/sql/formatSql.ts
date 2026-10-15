import { format, type FormatOptionsWithLanguage } from 'sql-formatter'
import { findTokenMismatch } from './sqlTokens'

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
//
// Throws when the formatted SQL lexes to different tokens than the input, so a
// formatter bug cannot silently change the query in the editor.
export function formatSql(sql: string): string {
    const formatted = format(sql, formatOptions)
    const mismatch = findTokenMismatch(sql, formatted)
    if (mismatch) {
        throw new Error(`Formatting changed the query: ${mismatch}`)
    }
    return formatted
}

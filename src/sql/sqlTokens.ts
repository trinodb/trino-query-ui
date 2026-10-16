import { CharStream, Token } from 'antlr4ng'
import { SqlBaseLexer } from '../generated/lexer/SqlBase.g4/SqlBaseLexer'

// Tokens whose text is significant as written. Everything else, keywords and unquoted
// identifiers included, is case-insensitive in Trino.
const EXACT_TOKENS = new Set([SqlBaseLexer.STRING, SqlBaseLexer.QUOTED_IDENTIFIER, SqlBaseLexer.BACKQUOTED_IDENTIFIER])

const COMMENT_TOKENS = new Set([SqlBaseLexer.SIMPLE_COMMENT, SqlBaseLexer.BRACKETED_COMMENT])

interface SqlToken {
    type: number
    text: string
    line: number
    column: number
}

function normalize(token: Token): string {
    const text = token.text ?? ''
    if (EXACT_TOKENS.has(token.type)) {
        return text
    }
    if (token.type === SqlBaseLexer.UNICODE_STRING) {
        // Only the U& prefix is case-insensitive, the string content is not
        return text.slice(0, 2).toUpperCase() + text.slice(2)
    }
    if (COMMENT_TOKENS.has(token.type)) {
        return text.replace(/\s+/g, ' ').trim()
    }
    return text.toUpperCase()
}

function tokenize(sql: string): SqlToken[] {
    const lexer = new SqlBaseLexer(CharStream.fromString(sql))
    lexer.removeErrorListeners()
    return lexer
        .getAllTokens()
        .filter((token) => token.type !== SqlBaseLexer.WS)
        .map((token) => ({
            type: token.type,
            text: normalize(token),
            line: token.line,
            column: token.column + 1,
        }))
}

function describeToken(token: SqlToken | undefined): string {
    return token ? `"${token.text}" at line ${token.line}, column ${token.column}` : 'the end of the query'
}

// Compare two versions of a query token by token, ignoring whitespace, the case of
// keywords and unquoted identifiers, and whitespace inside comments. Returns a
// description of the first difference, or undefined when both are the same query.
export function findTokenMismatch(original: string, formatted: string): string | undefined {
    const expected = tokenize(original)
    const actual = tokenize(formatted)
    const length = Math.max(expected.length, actual.length)
    for (let i = 0; i < length; i++) {
        const a = expected[i]
        const b = actual[i]
        if (!a || !b || a.type !== b.type || a.text !== b.text) {
            return `expected ${describeToken(a)} but found ${describeToken(b)}`
        }
    }
    return undefined
}

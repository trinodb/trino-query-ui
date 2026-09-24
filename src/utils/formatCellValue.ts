// Format a Trino result cell value for display.
//
// React silently ignores boolean children, so rendering a boolean value
// directly produces an empty cell. Trino returns boolean columns as JSON
// booleans, which made those cells invisible in the result grid (issue #20).
// Convert every non-null value to a string so it renders, JSON-encoding
// complex types (arrays, maps, rows) that arrive as objects.
export function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
        return ''
    }
    if (typeof value === 'object') {
        return JSON.stringify(value)
    }
    return String(value)
}

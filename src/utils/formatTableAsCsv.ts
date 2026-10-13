import { formatCellValue } from './formatCellValue'

// Quote a field when it contains a character that would otherwise break the
// record structure, doubling any embedded quotes.
function escapeCsvField(value: unknown): string {
    const str = formatCellValue(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

// Format paged Trino results as a CSV document with a header row.
export function formatTableAsCsv(results: unknown[][][], columns: { name: string }[]): string {
    if (!columns || columns.length === 0) {
        return ''
    }

    const header = columns.map((column) => escapeCsvField(column.name)).join(',')
    const rows = results.flat().map((row) => row.map((cell) => escapeCsvField(cell)).join(','))
    return [header, ...rows].join('\n')
}

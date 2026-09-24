import { describe, it, expect } from 'vitest'
import { formatCellValue } from './formatCellValue'

describe('formatCellValue', () => {
    // Regression test for issue #20: boolean cells rendered as empty because
    // React ignores boolean children.
    it('renders booleans as text instead of dropping them', () => {
        expect(formatCellValue(true)).toBe('true')
        expect(formatCellValue(false)).toBe('false')
    })

    it('renders numbers, including zero', () => {
        expect(formatCellValue(42)).toBe('42')
        expect(formatCellValue(0)).toBe('0')
        expect(formatCellValue(3.14)).toBe('3.14')
    })

    it('passes strings through unchanged', () => {
        expect(formatCellValue('hello')).toBe('hello')
        expect(formatCellValue('')).toBe('')
    })

    it('returns an empty string for null and undefined', () => {
        expect(formatCellValue(null)).toBe('')
        expect(formatCellValue(undefined)).toBe('')
    })

    it('JSON-encodes complex types (arrays, maps, rows)', () => {
        expect(formatCellValue([1, 2, 3])).toBe('[1,2,3]')
        expect(formatCellValue({ a: 1 })).toBe('{"a":1}')
    })
})

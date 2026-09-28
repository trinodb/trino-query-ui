import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Logger, type LogLevel } from './logger'

describe('Logger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'debug').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => vi.restoreAllMocks())

    it.each<[LogLevel | undefined, number[]]>([
        [undefined, [0, 1, 1]],
        ['debug', [1, 1, 1]],
        ['warn', [0, 1, 1]],
        ['error', [0, 0, 1]],
        ['silent', [0, 0, 0]],
    ])('filters messages at level %s', (level, counts) => {
        const logger = new Logger(level)
        logger.debug('query')
        logger.warn('warning')
        logger.error('failure')
        expect(console.debug).toHaveBeenCalledTimes(counts[0])
        expect(console.warn).toHaveBeenCalledTimes(counts[1])
        expect(console.error).toHaveBeenCalledTimes(counts[2])
    })

    it('prefixes messages and preserves error objects', () => {
        const error = new Error('network failure')
        new Logger().error('Query failed', error)
        expect(console.error).toHaveBeenCalledWith('[trino-query-ui]', 'Query failed', error)
    })

    it('applies changes to existing callbacks without affecting another instance', () => {
        const first = new Logger()
        const second = new Logger()
        const callback = () => first.debug('first')
        first.setLevel('debug')
        callback()
        second.debug('second')
        expect(console.debug).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'first')
        first.setLevel('silent')
        callback()
        first.error('hidden')
        second.error('visible')
        expect(console.debug).toHaveBeenCalledTimes(1)
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'visible')
    })
})

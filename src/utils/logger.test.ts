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

    it.each(['info', '', 'toString', '__proto__', null, 1])(
        'falls back to warn for invalid constructor level %s',
        (level) => {
            const logger = new Logger(level as LogLevel)
            expect(console.error).toHaveBeenCalledExactlyOnceWith(
                '[trino-query-ui]',
                'Invalid log level; falling back to warn:',
                level
            )
            vi.mocked(console.error).mockClear()

            logger.debug('hidden')
            logger.warn('warning')
            logger.error('failure')
            expect(console.debug).not.toHaveBeenCalled()
            expect(console.warn).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'warning')
            expect(console.error).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'failure')
        }
    )

    it('falls back to warn when setLevel receives an invalid value', () => {
        const logger = new Logger('silent')
        logger.setLevel('info' as LogLevel)
        expect(console.error).toHaveBeenCalledExactlyOnceWith(
            '[trino-query-ui]',
            'Invalid log level; falling back to warn:',
            'info'
        )
        vi.mocked(console.error).mockClear()

        logger.debug('hidden')
        logger.warn('warning')
        logger.error('failure')
        expect(console.debug).not.toHaveBeenCalled()
        expect(console.warn).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'warning')
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'failure')
    })

    it('reports an invalid level only once per instance and accepts later valid levels', () => {
        const logger = new Logger('info' as LogLevel)
        logger.setLevel('info' as LogLevel)
        logger.setLevel('trace' as LogLevel)
        expect(console.error).toHaveBeenCalledTimes(1)

        logger.setLevel('silent')
        logger.warn('hidden')
        logger.error('hidden')
        expect(console.warn).not.toHaveBeenCalled()
        expect(console.error).toHaveBeenCalledTimes(1)

        logger.setLevel('debug')
        logger.debug('visible')
        expect(console.debug).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'visible')
    })

    it('prefixes messages and preserves error objects', () => {
        const error = new Error('network failure')
        new Logger().error('Query failed', error)
        expect(console.error).toHaveBeenCalledWith('[trino-query-ui]', 'Query failed', error)
    })

    it.each(['debug', 'warn', 'error'] as const)(
        'applies %s level changes to existing callbacks without affecting another instance',
        (level) => {
            const first = new Logger('silent')
            const second = new Logger('silent')
            const callback = () => first[level]('first')
            callback()
            expect(console[level]).not.toHaveBeenCalled()

            first.setLevel(level)
            callback()
            second[level]('second')
            expect(console[level]).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'first')

            first.setLevel('silent')
            callback()
            expect(console[level]).toHaveBeenCalledTimes(1)

            second.setLevel(level)
            second[level]('second')
            expect(console[level]).toHaveBeenCalledTimes(2)
            expect(console[level]).toHaveBeenLastCalledWith('[trino-query-ui]', 'second')
        }
    )
})

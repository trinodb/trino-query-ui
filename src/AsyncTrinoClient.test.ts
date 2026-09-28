import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TrinoQueryRunner from './AsyncTrinoClient'
import SchemaProvider from './sql/SchemaProvider'
import { Logger, type LogLevel } from './utils/logger'

const response = (body: unknown, headers?: Record<string, string>) => new Response(JSON.stringify(body), { headers })

const finished = { stats: { state: 'FINISHED' } }

describe('query logging', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.spyOn(console, 'debug').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllTimers()
        vi.useRealTimers()
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
        SchemaProvider.catalogs.clear()
        SchemaProvider.tables.clear()
        SchemaProvider.lastSchemaFetchError = undefined
    })

    it.each<LogLevel>(['debug', 'warn', 'error', 'silent'])('uses %s for nested metadata queries', async (level) => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(response({ ...finished, data: [['system', 'system']], nextUri: '/catalogs' }))
            .mockResolvedValueOnce(response(finished))
            .mockResolvedValueOnce(
                response({ ...finished, data: [['information_schema', 'tables', 'BASE TABLE']], nextUri: '/tables' })
            )
            .mockResolvedValueOnce(response(finished))
        vi.stubGlobal('fetch', fetchMock)
        const updated = vi.fn()
        SchemaProvider.populateCatalogsAndRefreshTableList(updated, null, new Logger(level))
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchMock).toHaveBeenCalledTimes(4)
        expect(updated).toHaveBeenCalledTimes(1)
        if (level === 'debug') {
            expect(console.debug).toHaveBeenCalledWith(
                '[trino-query-ui]',
                'Starting query: select catalog_name, connector_name from system.metadata.catalogs'
            )
            expect(console.debug).toHaveBeenCalledWith(
                '[trino-query-ui]',
                'Starting query: SELECT table_schema, table_name, table_type FROM system.information_schema.tables'
            )
            expect(console.debug).not.toHaveBeenCalledWith(
                '[trino-query-ui]',
                'Session context updated',
                expect.anything()
            )
        } else {
            expect(console.debug).not.toHaveBeenCalled()
        }
        expect(console.error).not.toHaveBeenCalled()
    })

    it('uses the updated level for an existing runner and logs session headers when present', async () => {
        const logger = new Logger()
        const runner = new TrinoQueryRunner(logger)
        vi.stubGlobal(
            'fetch',
            vi
                .fn()
                .mockResolvedValueOnce(
                    response({ ...finished, nextUri: '/query' }, { 'X-Trino-Set-Catalog': 'system' })
                )
                .mockResolvedValueOnce(response(finished))
        )
        runner.StartQuery('SELECT 1')
        expect(console.debug).not.toHaveBeenCalled()
        logger.setLevel('debug')
        await vi.advanceTimersByTimeAsync(0)
        expect(console.debug).toHaveBeenCalledWith('[trino-query-ui]', 'Session context updated', {
            catalog: 'system',
            schema: undefined,
        })
        expect(console.debug).toHaveBeenCalledWith('[trino-query-ui]', 'Query finished')
    })

    it.each<LogLevel>(['warn', 'silent'])('preserves error callbacks at level %s', async (level) => {
        const error = new Error('request failed')
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
        const onError = vi.fn()
        new TrinoQueryRunner(new Logger(level)).SetErrorMessageCallback(onError).StartQuery('SELECT 1')
        await vi.advanceTimersByTimeAsync(0)
        expect(onError).toHaveBeenCalledWith('request failed')
        expect(console.error).toHaveBeenCalledTimes(level === 'silent' ? 0 : 1)
        if (level === 'warn') {
            expect(console.error).toHaveBeenCalledWith('[trino-query-ui]', 'Failed to start query', error, {
                catalog: null,
                schema: null,
            })
        }
        expect(console.debug).not.toHaveBeenCalled()
    })

    it.each([new TypeError('Failed to fetch'), 'request aborted'])(
        'preserves pagination failure details: %s',
        async (error) => {
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
            const onError = vi.fn()
            const runner = new TrinoQueryRunner().SetErrorMessageCallback(onError)
            await runner.NextPage({ id: 'query-123', nextUri: '/results' })
            expect(console.error).toHaveBeenCalledExactlyOnceWith(
                '[trino-query-ui]',
                'Failed to fetch query results',
                error,
                { queryId: 'query-123' }
            )
            expect(onError).toHaveBeenCalledWith(
                error instanceof Error ? error.message : 'An unexpected error occurred'
            )
        }
    )

    it('identifies the query when cancellation fails and preserves the error', async () => {
        const error = new Error('cancellation failed')
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
        const runner = new TrinoQueryRunner()
        runner.isRunning = true
        runner.CancelQuery('')
        runner.UpdateStatus({ id: 'query-456', nextUri: '/results', stats: { state: 'RUNNING' } })
        await vi.advanceTimersByTimeAsync(0)
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[trino-query-ui]', 'Failed to cancel query', error, {
            queryId: 'query-456',
        })
    })
})

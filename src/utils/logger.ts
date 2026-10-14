export type LogLevel = 'debug' | 'warn' | 'error' | 'silent'

const priorities: Record<LogLevel, number> = { debug: 0, warn: 1, error: 2, silent: 3 }
const noop = (..._args: unknown[]) => {}

export class Logger {
    private level: LogLevel = 'warn'
    private reportedInvalidLevel = false

    constructor(level: LogLevel = 'warn') {
        this.setLevel(level)
    }

    setLevel(level: LogLevel) {
        switch (level) {
            case 'debug':
            case 'warn':
            case 'error':
            case 'silent':
                this.level = level
                return
            default:
                this.level = 'warn'
                if (!this.reportedInvalidLevel) {
                    this.reportedInvalidLevel = true
                    console.error('[trino-query-ui]', 'Invalid log level; falling back to warn:', level)
                }
        }
    }

    // Read the method at each call so callbacks observe changes to the level.
    // Returning bound console methods preserves the caller's location in DevTools.
    get debug(): (...args: unknown[]) => void {
        return priorities[this.level] <= priorities.debug ? console.debug.bind(console, '[trino-query-ui]') : noop
    }

    get warn(): (...args: unknown[]) => void {
        return priorities[this.level] <= priorities.warn ? console.warn.bind(console, '[trino-query-ui]') : noop
    }

    get error(): (...args: unknown[]) => void {
        return priorities[this.level] <= priorities.error ? console.error.bind(console, '[trino-query-ui]') : noop
    }
}

export type LogLevel = 'debug' | 'warn' | 'error' | 'silent'

const priorities: Record<LogLevel, number> = { debug: 0, warn: 1, error: 2, silent: 3 }

export class Logger {
    constructor(private level: LogLevel = 'warn') {}

    setLevel(level: LogLevel) {
        this.level = level
    }

    debug(...args: unknown[]) {
        if (priorities[this.level] <= priorities.debug) {
            console.debug('[trino-query-ui]', ...args)
        }
    }

    warn(...args: unknown[]) {
        if (priorities[this.level] <= priorities.warn) {
            console.warn('[trino-query-ui]', ...args)
        }
    }

    error(...args: unknown[]) {
        if (priorities[this.level] <= priorities.error) {
            console.error('[trino-query-ui]', ...args)
        }
    }
}

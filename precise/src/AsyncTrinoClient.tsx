// class to execute Trino queries
class TrinoQueryRunner {
    private state: any = {}
    private query: string = ''
    private rowsRead: number = 0
    private isRunning: boolean = false
    private cancellationToken: string | null = null
    SetResults = (newResults: any[]) => void {}
    // make this return the TrinoQueryRunner object
    private setAllResults = (allResults: any[], error: boolean) => void {}
    SetColumns = (newColumns: any[]) => {}
    private setStatus = (newStatus: any) => {}
    SetScanStats = (newScanStats: any) => {}
    private setErrorMessage = (newErrorMessage: string) => {}
    SetCancelling = () => {}
    SetStopped = () => {}
    SetStarted = () => {}
    pages: any[] = []
    columns: any[] = []
    backoff_delay_msec = 0
    previous_progress = 0
    cancellationReason: string = ''

    // Add properties to store catalog and schema headers
    private trinoCatalog: string | null = null
    private trinoSchema: string | null = null
    private setHeadersCallback: (catalog: string | null, schema: string | null) => void = () => {}

    // Custom headers injected into every Trino request.
    private requestHeaders: Record<string, string> = {}

    // Hard cap for the cached result set. If the next chunk exceeds this, stop.
    private static readonly MAX_RESULT_SET_BYTES = 5 * 1024 * 1024
    private resultSetBytes = 0

    // Hard cap for the number of rows in the cached result set.
    private static readonly MAX_ROWS = 10_000

    private setTruncationMessage = (_msg: string) => {}

    SetAllResultsCallback(setAllResults: (n: any[], error: boolean) => any): TrinoQueryRunner {
        this.setAllResults = setAllResults
        return this
    }

    SetErrorMessageCallback(setErrorMessage: (n: string) => any): TrinoQueryRunner {
        this.setErrorMessage = setErrorMessage
        return this
    }

    SetStatusCallback(setStatus: (n: any) => any): TrinoQueryRunner {
        this.setStatus = setStatus
        return this
    }

    // Add method to set the headers callback
    SetHeadersCallback(callback: (catalog: string | null, schema: string | null) => void): TrinoQueryRunner {
        this.setHeadersCallback = callback
        return this
    }

    SetTruncationMessageCallback(callback: (msg: string) => void): TrinoQueryRunner {
        this.setTruncationMessage = callback
        return this
    }

    SetRequestHeaders(headers: Record<string, string>): TrinoQueryRunner {
        this.requestHeaders = headers
        return this
    }

    private resolveHeaders(): Record<string, string> {
        return Object.keys(this.requestHeaders).length > 0 ? { ...this.requestHeaders } : { 'X-Trino-User': 'system' }
    }

    GetCatalog(): string | null {
        return this.trinoCatalog
    }

    GetSchema(): string | null {
        return this.trinoSchema
    }

    FirstColumn(): string[] {
        return this.pages.map((page) => page.map((row: any[]) => row[0]))[0]
    }

    UpdateStatus(state: any) {
        this.state = state
        this.setStatus(state)

        if (state?.error) {
            this.setErrorMessage(state.error.message)
        }

        if (!this.cancellationToken) {
            return
        }

        const nextUri = state?.nextUri
        if (!nextUri) {
            return
        }

        const cancelState = {
            ...state,
            stats: {
                ...state.stats,
                state: 'CANCELLING',
            },
        }

        this.state = cancelState
        this.setStatus(cancelState)

        const cancelPath = nextUri.replace(/^https?:\/\/[^/]+/, '')

        fetch(cancelPath, {
            method: 'DELETE',
            headers: this.resolveHeaders(),
        })
            .then(() => {
                const cancelledState = {
                    ...cancelState,
                    stats: {
                        ...cancelState.stats,
                        state: 'CANCELLED',
                    },
                }

                this.state = cancelledState
                this.setStatus(cancelledState)
                this.cancellationToken = null
                this.setErrorMessage(this.cancellationReason || 'Query was cancelled')
                this.HandleStopped()
            })
            .catch((error) => {
                console.error('Error:', error)
                this.setErrorMessage(error.toString())
                this.HandleStopped()
            })
    }

    ClearState() {
        this.pages = []
        this.columns = []
        this.rowsRead = 0
        this.resultSetBytes = 0
    }

    HandleStopped() {
        this.isRunning = false
        this.SetStopped()
    }

    HandleSetAllResults(error: boolean) {
        // combines all pages into one array
        const rows: any[] = []
        this.pages.forEach((page) => {
            page.forEach((row: any) => {
                rows.push(row)
            })
        })

        this.setAllResults(rows, error)
    }

    CancelQuery(cancellationReason: string) {
        if (this.isRunning && !this.cancellationToken) {
            this.cancellationToken = 'cancelling'
            this.cancellationReason = cancellationReason
        }
    }

    StartQuery(statement: string, catalog?: string, schema?: string): TrinoQueryRunner {
        // if running cancel before starting another
        if (this.isRunning) {
            this.CancelQuery('')
            return this
        }

        // Set the catalog and schema if provided
        if (catalog) {
            this.trinoCatalog = catalog
        }

        if (schema) {
            this.trinoSchema = schema
        }

        this.backoff_delay_msec = 0

        this.isRunning = true
        this.SetStarted()
        this.query = statement
        this.rowsRead = 0
        this.ClearState()

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort('Timeout: Trino is not responding'), 15000)

        const headers: Record<string, string> = { ...this.resolveHeaders() }
        if (this.trinoCatalog) {
            headers['X-Trino-Catalog'] = this.trinoCatalog
        }

        if (this.trinoSchema) {
            headers['X-Trino-Schema'] = this.trinoSchema
        }

        fetch('/v1/statement', {
            method: 'POST',
            headers,
            body: statement,
            signal: controller.signal,
        })
            .then((response) => {
                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(`${response.statusText} (${response.status})`)
                }

                this.extractHeaders(response.headers)
                return response.json()
            })
            .then((data) => {
                const shouldContinue = this.HandleResults(data)
                this.UpdateStatus(data)

                if (!shouldContinue) {
                    return
                }

                if (data.nextUri) {
                    if (this.cancellationToken) {
                        return
                    }

                    this.backoff_delay_msec = Math.min(this.backoff_delay_msec + 20, 1000)
                    setTimeout(() => this.NextPage(data), this.backoff_delay_msec)
                } else {
                    this.HandleSetAllResults(data?.stats?.state === 'FAILED')
                    this.HandleStopped()
                    console.log('Query finished')
                }
            })
            .catch((error) => {
                clearTimeout(timeoutId)

                let errorMessage = 'An unexpected error occurred'

                if (error instanceof DOMException && error.name === 'AbortError') {
                    errorMessage = 'Query timed out - Trino server took too long to respond'
                } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    if (navigator.onLine === false) {
                        errorMessage = 'You appear to be offline. Please check your internet connection.'
                    } else {
                        errorMessage =
                            'Failed to connect to Trino server - the server may be down, unreachable, or incorrectly configured'
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                console.error('Error starting query:', errorMessage)
                this.setErrorMessage(errorMessage)
                this.HandleStopped()
            })

        return this
    }

    private extractHeaders(headers: Headers) {
        const headerMap = new Map<string, string>()

        headers.forEach((value, key) => {
            headerMap.set(key.toLowerCase(), value)
        })

        const setCatalog = headerMap.get('x-trino-set-catalog')
        const setSchema = headerMap.get('x-trino-set-schema')

        if (setCatalog) {
            this.trinoCatalog = setCatalog
        }
        if (setSchema) {
            this.trinoSchema = setSchema
        }

        if ((setCatalog || setSchema) && this.setHeadersCallback) {
            this.setHeadersCallback(this.trinoCatalog, this.trinoSchema)
        }
    }

    async NextPage(previous: any) {
        try {
            if (!previous?.nextUri) {
                this.HandleSetAllResults(previous?.stats?.state === 'FAILED')
                this.HandleStopped()
                return
            }

            const nextUri = previous.nextUri.replace(/^https?:\/\/[^/]+/, '')
            const response = await fetch(nextUri, {
                method: 'GET',
                headers: this.resolveHeaders(),
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            this.extractHeaders(response.headers)
            const data = await response.json()

            const shouldContinue = this.HandleResults(data)
            this.UpdateStatus(data)

            if (!shouldContinue) {
                return
            }

            if (data.nextUri) {
                // We want to cancel just after the status is updated, otherwise if the queue is QUEUED we will not be able to cancel
                if (this.cancellationToken) {
                    return
                }

                // backoff delay add 20ms up to 1000ms
                this.backoff_delay_msec = Math.min(this.backoff_delay_msec + 20, 1000)
                setTimeout(() => this.NextPage(data), this.backoff_delay_msec)
            } else {
                this.HandleSetAllResults(data?.stats?.state === 'FAILED')
                this.HandleStopped()
                console.log('Query finished')
            }
        } catch (error) {
            if (error instanceof Error) {
                // handle errors of time net::ERR_CONNECTION_REFUSED
                if (error.message === 'Failed to fetch') {
                    console.error('Error:', error.message + ' - Trino is not running or not reachable')
                    this.setErrorMessage(error.message)
                } else {
                    console.error('Error:', error.message)
                    this.setErrorMessage(error.message)
                }
            } else {
                // Handle cases where the thrown error is not an Error instance
                console.error('An unexpected error occurred:', error)
                this.setErrorMessage('An unexpected error occurred')
            }
            this.HandleStopped()
        }
    }

    HandleResults(data: any): boolean {
        if (data.columns && this.columns !== data.columns) {
            this.columns = data.columns
            this.SetColumns(data.columns)
        }

        if (!data.data || !Array.isArray(data.data)) {
            return true
        }

        // Check row limit first — trim the page if it would push us over.
        if (this.rowsRead + data.data.length > TrinoQueryRunner.MAX_ROWS) {
            const remaining = TrinoQueryRunner.MAX_ROWS - this.rowsRead
            const trimmed = data.data.slice(0, remaining)
            if (trimmed.length > 0) {
                this.pages.push(trimmed)
                this.rowsRead += trimmed.length
                this.resultSetBytes += new TextEncoder().encode(JSON.stringify(trimmed)).length
                this.SetResults([...this.pages])
            }
            this.setTruncationMessage(
                `Showing first ${TrinoQueryRunner.MAX_ROWS.toLocaleString()} rows (result may be incomplete)`
            )
            this.CancelQuery('Row limit reached')
            return false
        }

        const pageBytes = new TextEncoder().encode(JSON.stringify(data.data)).length
        if (this.resultSetBytes + pageBytes > TrinoQueryRunner.MAX_RESULT_SET_BYTES) {
            this.setTruncationMessage(
                `Showing first ${this.rowsRead.toLocaleString()} rows (${Math.floor(TrinoQueryRunner.MAX_RESULT_SET_BYTES / 1024 / 1024)} MB size limit reached — result may be incomplete)`
            )
            this.CancelQuery('Result set exceeded local cache limit')
            return false
        }

        this.pages.push(data.data)
        this.rowsRead += data.data.length
        this.resultSetBytes += pageBytes
        this.SetResults([...this.pages])

        return true
    }
}

export default TrinoQueryRunner

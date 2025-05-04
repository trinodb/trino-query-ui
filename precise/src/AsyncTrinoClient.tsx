// class to execute Trino queries
class TrinoQueryRunner {
    private state: any = {}
    private query: string = ''
    private rowsRead: number = 0
    isRunning: boolean = false
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

    // Add getters for catalog and schema
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
        // If cancelled, handle here because we need state in order to cancel
        if (this.cancellationToken) {
            state.stats.state = 'CANCELLING'
            this.state = state
            this.setStatus(state)
            const nextUri = state.nextUri.replace('http://localhost:8080', '')
            // cancel query
            fetch(nextUri, {
                method: 'DELETE',
                headers: {
                    'X-Trino-User': 'system',
                },
            })
                .then((response) => response)
                .then((data) => {
                    state.stats.state = 'CANCELLED'
                    this.state = state
                    this.setStatus(state)
                    this.cancellationToken = null
                    this.setErrorMessage(this.cancellationReason ? this.cancellationReason : 'Query was cancelled')
                    this.HandleStopped()
                })
                .catch((error) => {
                    console.error('Error:', error)
                    this.setErrorMessage(error.toString())
                    this.HandleStopped()
                })
            return
        }

        this.state = state
        this.setStatus(state)
        if (state.error) {
            this.setErrorMessage(state.error.message)
        }
    }

    ClearState() {
        this.pages = []
        this.columns = []
        this.rowsRead = 0
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
        console.log('Starting query: ' + statement)
        this.rowsRead = 0
        this.ClearState()

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort('Timeout: Trino is not responding'), 15000)

        // Prepare headers for the request
        const headers: Record<string, string> = {
            'X-Trino-User': 'system',
        }

        // Add catalog and schema headers if they exist
        if (this.trinoCatalog) {
            headers['X-Trino-Catalog'] = this.trinoCatalog
        }

        if (this.trinoSchema) {
            headers['X-Trino-Schema'] = this.trinoSchema
        }

        fetch('/v1/statement', {
            method: 'POST',
            headers: headers,
            body: statement,
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText + ' (' + response.status + ')')
                }

                // Extract headers before parsing the JSON response
                this.extractHeaders(response.headers)

                return response.json()
            })
            .then((data) => {
                this.HandleResults(data)
                this.UpdateStatus(data)
                this.NextPage(data)
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

    // Extract and store Trino headers
    private extractHeaders(headers: Headers) {
        const headerEntries: [string, string][] = []

        // Iterate through all headers and log them
        headers.forEach((value, key) => {
            headerEntries.push([key.toLowerCase(), value])
        })

        // Create a map of lowercase header names for case-insensitive lookup
        const headerMap = new Map(headerEntries)

        // Get SET catalog and schema headers if present (case-insensitive)
        const setCatalog = headerMap.get('x-trino-set-catalog')
        const setSchema = headerMap.get('x-trino-set-schema')

        console.log(`Found SET headers - Catalog: ${setCatalog}, Schema: ${setSchema}`)

        // Update our stored values when SET headers are present
        if (setCatalog) {
            this.trinoCatalog = setCatalog
            console.log(`Updated catalog to: ${this.trinoCatalog}`)
        }

        if (setSchema) {
            this.trinoSchema = setSchema
            console.log(`Updated schema to: ${this.trinoSchema}`)
        }

        // Call the callback with the extracted headers
        if ((setCatalog || setSchema) && this.setHeadersCallback) {
            this.setHeadersCallback(this.trinoCatalog, this.trinoSchema)
        }
    }

    async NextPage(previous: any) {
        try {
            // fix cors for testing
            const nextUri = await previous.nextUri.replace('http://localhost:8080', '')
            const response = await fetch(nextUri, {
                method: 'GET',
                headers: {
                    'X-Trino-User': 'system',
                },
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            // Extract headers from each page response
            this.extractHeaders(response.headers)

            const data = await response.json()

            this.HandleResults(data)
            this.UpdateStatus(data)

            if (data.nextUri) {
                // We want to cancel just after the status is updated, otherwise if the queue is QUEUED we will not be able to cancel
                if (this.cancellationToken) {
                    return
                }

                // backoff delay add 20ms up to 1000ms
                this.backoff_delay_msec = Math.min(this.backoff_delay_msec + 20, 1000)
                setTimeout(() => this.NextPage(data), this.backoff_delay_msec)
            } else {
                this.HandleSetAllResults(data['stats']['state'] == 'FAILED')
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

        const maxRows = 10000

        if (data.data) {
            if (data.data.length + this.rowsRead > maxRows) {
                // modify this page so we hit maxRows rows exactly
                const trim = maxRows - this.rowsRead
                this.rowsRead += trim
                const page: any[] = data.data.slice(0, trim)
                this.pages.push(page)

                // set error indicating rows were trimmed formatted using maxRows with commas
                this.setErrorMessage('Results were trimmed to ' + maxRows.toLocaleString() + ' rows')
                this.SetResults(this.pages)
                // cancel
                this.CancelQuery('Results were trimmed to ' + maxRows.toLocaleString() + ' rows')
                return false
            } else {
                this.pages.push(data.data)
                this.rowsRead += data.data.length
            }

            this.SetResults(this.pages)
        }
        return true
    }
}

export default TrinoQueryRunner

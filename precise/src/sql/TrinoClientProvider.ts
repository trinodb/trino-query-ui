import TrinoQueryRunner from '../AsyncTrinoClient'

export interface TrinoClientConfig {
    baseUrl?: string
    requestHeaders?: Record<string, string>
}

export class TrinoClientProvider {
    private static baseUrl?: string
    private static requestHeaders: Record<string, string> = {}

    private constructor() { }

    static configure(config: TrinoClientConfig) {
        if (config.baseUrl !== undefined) {
            TrinoClientProvider.baseUrl = config.baseUrl
        }
        if (config.requestHeaders && Object.keys(config.requestHeaders).length > 0) {
            TrinoClientProvider.requestHeaders = config.requestHeaders
        }
    }

    static getBaseUrl(): string | undefined {
        return TrinoClientProvider.baseUrl
    }

    static getRequestHeaders(): Record<string, string> {
        return { ...TrinoClientProvider.requestHeaders }
    }

    static createClient(): TrinoQueryRunner {
        const client = new TrinoQueryRunner()
        if (TrinoClientProvider.baseUrl) {
            client.SetBaseUrl(TrinoClientProvider.baseUrl)
        }
        client.SetRequestHeaders(TrinoClientProvider.requestHeaders)
        return client
    }
}
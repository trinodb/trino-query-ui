export interface ResultSetSnapshot {
    results: any[][]
    columns: any[]
    response: any
    errorMessage: string
    truncationMessage: string
}

export interface ResultSetStore {
    load(queryId: string): Promise<ResultSetSnapshot | null>
    save(queryId: string, snapshot: ResultSetSnapshot): Promise<void>
    remove(queryId: string): Promise<void>
}

const key = (queryId: string) => `query_result_${queryId}`

export const localStorageResultSetStore: ResultSetStore = {
    async load(queryId) {
        try {
            const raw = localStorage.getItem(key(queryId))
            return raw ? (JSON.parse(raw) as ResultSetSnapshot) : null
        } catch {
            return null
        }
    },
    async save(queryId, snapshot) {
        localStorage.setItem(key(queryId), JSON.stringify(snapshot))
    },
    async remove(queryId) {
        localStorage.removeItem(key(queryId))
    },
}

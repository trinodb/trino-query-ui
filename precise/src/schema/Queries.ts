import QueryInfo from './QueryInfo'
import QueryType from './QueryType'
import { v4 as uuidv4 } from 'uuid'
import Tabs from './../controls/tabs/Tabs'

class Queries extends Tabs<QueryInfo> {
    loadTabs(): QueryInfo[] {
        const queryList: QueryInfo[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('query_')) {
                const value = localStorage.getItem(key)
                if (value) {
                    try {
                        const queryInfo = JSON.parse(value)
                        queryList.push(
                            new QueryInfo(
                                queryInfo.title,
                                queryInfo.type,
                                queryInfo.query,
                                queryInfo.id,
                                queryInfo.isPinned,
                                queryInfo.catalog,
                                queryInfo.schema
                            )
                        )
                    } catch (e) {
                        console.error('Error parsing stored query:', e)
                        localStorage.removeItem(key)
                    }
                }
            }
        }

        // Handle query from URL
        const urlParams = new URLSearchParams(window.location.search)
        const query = urlParams.get('q')
        const title = urlParams.get('n') ?? 'Imported Query'
        if (query) {
            const newQueryId = uuidv4()
            const newQuery = new QueryInfo(title, QueryType.FROM_QUERY_STRING, query, newQueryId, false)
            queryList.push(newQuery)
            this.saveTab(newQuery)
        }

        return queryList
    }

    saveTabs(): void {
        this.tabs.forEach((query) => this.saveTab(query))
    }

    private saveTab(query: QueryInfo): void {
        localStorage.setItem(`query_${query.id}`, JSON.stringify(query))
    }

    deleteTabFromStorage(tabId: string): void {
        localStorage.removeItem(`query_${tabId}`)
    }

    createNewTab(): QueryInfo {
        return new QueryInfo('New Query', QueryType.USER_ADDED, '', uuidv4(), false)
    }

    // Query-specific methods

    getCurrentQuery(): QueryInfo {
        return this.getCurrentTab()
    }

    addQuery(front: boolean = false, title: string = 'New Query'): QueryInfo {
        return this.addTab(front, title)
    }

    updateQuery(queryId: string, updates: Partial<QueryInfo>): void {
        this.updateTab(queryId, updates)
    }

    deleteQuery(queryId: string): void {
        this.deleteTab(queryId)
    }

    setCurrentQuery(queryId: string): void {
        this.setCurrentTab(queryId)
    }

    updateQueryOrder(newOrder: string[]): void {
        this.updateTabOrder(newOrder)
    }

    moveQueryToFront(queryId: string): void {
        this.moveToFront(queryId)
    }

    // Additional query-specific method
    getQueryContent(queryId: string): string {
        const query = this.tabs.find((q) => q.id === queryId)
        return query ? query.query : ''
    }
}

export default Queries

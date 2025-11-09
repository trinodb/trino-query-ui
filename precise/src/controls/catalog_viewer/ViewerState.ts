import Catalog from './../../schema/Catalog'
import TableReference from '../../schema/TableReference'
import SchemaProvider from '../../sql/SchemaProvider'
import Table from '../../schema/Table'

export interface ViewerStateUpdate {
    expandedNodes: Set<string>
    matches: Set<string>
}

export type StateUpdateCallback = (update: ViewerStateUpdate) => void

export const buildPath = {
    catalog: (catalogName: string) => catalogName,
    schema: (catalogName: string, schemaName: string) => `${catalogName}.${schemaName}`,
    table: (catalogName: string, schemaName: string, tableName: string) => `${catalogName}.${schemaName}.${tableName}`,
    column: (catalogName: string, schemaName: string, tableName: string, columnName: string) =>
        `${catalogName}.${schemaName}.${tableName}.${columnName}`,
}

export class ViewerStateManager {
    public userExpanded = new Set<string>()
    private matches = new Set<string>()
    private onStateUpdate: StateUpdateCallback
    private isSearching = false
    private onLoadingChange: (loading: boolean) => void

    constructor(onStateUpdate: StateUpdateCallback, onLoadingChange: (loading: boolean) => void) {
        this.onStateUpdate = onStateUpdate
        this.onLoadingChange = onLoadingChange
    }

    public startSearch(filterText: string, includeColumns: boolean, catalogs: Map<string, Catalog>) {
        this.matches.clear()
        this.isSearching = !!filterText

        if (!filterText) {
            this.notifyStateUpdate()
            return
        }

        const filterItem = (name: string) => name.toLowerCase().includes(filterText.toLowerCase())

        // Queue tables that need column loading
        const tablesToLoad: TableReference[] = []

        // Search through catalogs
        catalogs.forEach((catalog, catalogName) => {
            if (filterItem(catalogName)) {
                this.matches.add(buildPath.catalog(catalogName))
            }

            // Search through schemas
            catalog.getSchemas().forEach((schema) => {
                const schemaPath = buildPath.schema(catalogName, schema.getName())
                if (filterItem(schema.getName())) {
                    this.matches.add(schemaPath)
                }

                // Search through tables
                schema.getTables().forEach((table) => {
                    const tablePath = buildPath.table(catalogName, schema.getName(), table.getName())

                    if (filterItem(table.getName())) {
                        this.matches.add(tablePath)
                    }

                    // Handle column searching
                    if (includeColumns) {
                        if (table.getColumns().length === 0) {
                            tablesToLoad.push(new TableReference(catalogName, schema.getName(), table.getName()))
                        } else {
                            this.searchTableColumns(table, catalogName, schema.getName(), table.getName(), filterItem)
                        }
                    }
                })
            })
        })

        // Process any tables that need column loading
        if (tablesToLoad.length > 0) {
            this.loadTablesSequentially(tablesToLoad, filterItem)
        }

        this.notifyStateUpdate()
    }

    private loadTablesSequentially(tablesToLoad: TableReference[], filterItem: (name: string) => boolean) {
        if (tablesToLoad.length === 0) {
            this.onLoadingChange(false)
            return
        }

        this.onLoadingChange(true)

        const loadNextTable = (index: number) => {
            if (index >= tablesToLoad.length) {
                this.onLoadingChange(false)
                return
            }

            if (index >= tablesToLoad.length) return

            const tableRef = tablesToLoad[index]
            SchemaProvider.getTableWithCache(tableRef, (loadedTable: Table) => {
                this.searchTableColumns(
                    loadedTable,
                    tableRef.catalogName,
                    tableRef.schemaName,
                    tableRef.tableName,
                    filterItem
                )
                this.notifyStateUpdate()

                // Load the next table only after this one is complete
                loadNextTable(index + 1)
            })
        }

        // Start with the first table
        loadNextTable(0)
    }

    private searchTableColumns(
        table: Table,
        catalogName: string,
        schemaName: string,
        tableName: string,
        filterItem: (name: string) => boolean
    ) {
        table.getColumns().forEach((column) => {
            if (filterItem(column.getName())) {
                const columnPath = buildPath.column(catalogName, schemaName, tableName, column.getName())
                this.matches.add(columnPath)
            }
        })
    }

    public toggleExpanded(path: string) {
        if (this.userExpanded.has(path)) {
            this.userExpanded.delete(path)
        } else {
            this.userExpanded.add(path)
        }
        this.notifyStateUpdate()
    }

    public isVisible(path: string): boolean {
        if (!this.isSearching) {
            // In manual mode, must have all parents expanded
            const segments = path.split('.')
            for (let i = 1; i < segments.length; i++) {
                const parentPath = segments.slice(0, i).join('.')
                if (!this.userExpanded.has(parentPath)) {
                    return false
                }
            }
            return true
        }

        return this.matches.has(path) || this.hasMatchingChildren(path)
    }

    public isExpanded(path: string): boolean {
        return this.userExpanded.has(path)
    }

    public hasMatchingChildren(path: string): boolean {
        if (!this.isSearching) return false

        const prefix = path + '.'
        return Array.from(this.matches).some((match) => match.startsWith(prefix))
    }

    private notifyStateUpdate() {
        this.onStateUpdate({
            expandedNodes: new Set(this.userExpanded),
            matches: this.matches,
        })
    }
}

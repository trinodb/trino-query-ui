import Table from './Table'

class Schema {
    private name: string
    private tables: Map<string, Table> = new Map<string, Table>()

    constructor(name: string) {
        this.name = name
    }

    getName() {
        return this.name
    }

    getTables() {
        return this.tables
    }

    addTable(table: Table) {
        this.tables.set(table.getName(), table)
    }
}

export default Schema

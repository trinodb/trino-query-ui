import Catalog from './Catalog'
import Schema from './Schema'
import Table from './Table'
import SchemaProvider from './../sql/SchemaProvider'

// tables may or may not exist in the catalog so we need to maintain a reference to both names and the actual objects
class TableReference {
    catalogName: string
    schemaName: string
    tableName: string
    fullyQualified: string

    constructor(catalogName: string, schemaName: string, tableName: string) {
        this.catalogName = catalogName
        this.schemaName = schemaName
        this.tableName = tableName
        this.fullyQualified = this.getFullyQualified()
    }

    getCatalog(): Catalog | undefined {
        return SchemaProvider.catalogs.get(this.catalogName)
    }

    getSchema(): Schema | undefined {
        return SchemaProvider.catalogs.get(this.catalogName)?.getSchemas().get(this.schemaName)
    }

    getTable(): Table | undefined {
        return SchemaProvider.catalogs
            .get(this.catalogName)
            ?.getSchemas()
            .get(this.schemaName)
            ?.getTables()
            .get(this.tableName)
    }

    static isFullyQualified(proposedName: string) {
        return proposedName.split('.').length === 3
    }

    static fromFullyQualified(fullyQualifiedTableName: string) {
        const parts = fullyQualifiedTableName.split('.')
        return new TableReference(parts[0], parts[1], parts[2])
    }

    private getFullyQualified(): string {
        return this.catalogName + '.' + this.schemaName + '.' + this.tableName
    }
}

export default TableReference

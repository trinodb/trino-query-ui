import Catalog from './Catalog'
import Schema from './Schema'
import Table from './Table'
import SchemaProvider from './../sql/SchemaProvider'

export function cleanIdentifier(id: string): string {
    if (!id) return ''
    return id.replace(/^["'`]|["'`]$/g, '')
}

// Returns true if the identifier needs double-quoting in Trino SQL
// (contains anything other than lowercase letters, digits, and underscores, or starts with a digit)
const SAFE_IDENTIFIER = /^[a-z_][a-z0-9_]*$/

export function quoteIdentifier(id: string): string {
    if (!id) return ''
    if (SAFE_IDENTIFIER.test(id)) return id
    // Escape any embedded double-quotes by doubling them
    return '"' + id.replace(/"/g, '""') + '"'
}

export function quoteFullyQualified(catalog: string, schema: string, table: string): string {
    return quoteIdentifier(catalog) + '.' + quoteIdentifier(schema) + '.' + quoteIdentifier(table)
}

// tables may or may not exist in the catalog so we need to maintain a reference to both names and the actual objects
class TableReference {
    catalogName: string
    schemaName: string
    tableName: string
    fullyQualified: string

    constructor(catalogName: string, schemaName: string, tableName: string) {
        this.catalogName = cleanIdentifier(catalogName)
        this.schemaName = cleanIdentifier(schemaName)
        this.tableName = cleanIdentifier(tableName)
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

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import NamedQuery from './NamedQuery'
import SchemaProvider from './SchemaProvider'
import TableReference from '../schema/TableReference'

// class that describes the type of special highlight, containing the start and end position, and kind of highlight, and ast location
class SpecialHighlight {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
    kind: string
    ast: any
    catalog?: string
    schema?: string

    constructor(
        startLineNumber: number,
        startColumn: number,
        endLineNumber: number,
        endColumn: number,
        kind: string,
        ast: any,
        catalog?: string,
        schema?: string
    ) {
        this.startLineNumber = startLineNumber
        this.startColumn = startColumn
        this.endLineNumber = endLineNumber
        this.endColumn = endColumn
        this.kind = kind
        this.ast = ast
        this.catalog = catalog
        this.schema = schema
    }

    getDecoration(namedQueries: Map<string, NamedQuery>) {
        // check if the highlight is a named query
        let inlineClassName: string = this.kind
        if (namedQueries.has(this.ast.getText())) {
            inlineClassName = 'relationReference'
        }

        // Get the table reference with context awareness
        let tableReference: TableReference | undefined
        const tableName = this.ast.getText()

        if (TableReference.isFullyQualified(tableName)) {
            // If fully qualified, use that directly
            tableReference = TableReference.fromFullyQualified(tableName)
        } else if (this.catalog && this.schema) {
            // If not fully qualified but we have catalog and schema context, use those
            tableReference = new TableReference(this.catalog, this.schema, tableName)
        }

        let hoverMessage = ''
        if (tableReference) {
            const table = SchemaProvider.getTableIfCached(tableReference)
            if (table) {
                hoverMessage = table.getFullSchemaAsString()
            }
        }

        return {
            range: new monaco.Range(this.startLineNumber, this.startColumn + 1, this.endLineNumber, this.endColumn + 2),
            options: {
                inlineClassName: inlineClassName,
                hoverMessage: [
                    {
                        isTrusted: true,
                        supportHtml: true,
                        value: hoverMessage,
                    },
                ],
            },
        }
    }
}

export default SpecialHighlight

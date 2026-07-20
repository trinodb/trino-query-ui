import { SqlBaseListener } from '../generated/lexer/SqlBase.g4/SqlBaseListener'
import SpecialHighlight from './SpecialHighlight'
import {
    IdentifierContext,
    QuerySpecificationContext,
    SelectSingleContext,
    TableNameContext,
    UnquotedIdentifierContext,
} from '../generated/lexer/SqlBase.g4/SqlBaseParser'
import NamedQuery from './NamedQuery'
import StatementDescriptor from './StatementDescriptor'
import SchemaProvider from './SchemaProvider'
import TableReference from '../schema/TableReference'

class SqlBaseListenerImpl extends SqlBaseListener {
    specialHighlights: SpecialHighlight[]
    tableColumns: Map<string, string[]> = new Map<string, string[]>()
    namedQueries: Map<string, NamedQuery> = new Map<string, NamedQuery>()
    currentColumns: string[] = []
    currentTableNameContext: string = ''
    statements: StatementDescriptor[] = []

    // Add properties for current catalog and schema
    currentCatalog?: string
    currentSchema?: string

    constructor(catalog?: string, schema?: string) {
        super()
        this.specialHighlights = []
        this.namedQueries = new Map<string, NamedQuery>()
        this.currentCatalog = catalog
        this.currentSchema = schema
    }

    public enterQualifiedName = (ctx: any) => {}

    public exitQualifiedName = (ctx: any) => {
        if (ctx.parent instanceof TableNameContext) {
            // Create SpecialHighlight with current catalog and schema
            const currentQualifiedName: SpecialHighlight = new SpecialHighlight(
                ctx.start.line,
                ctx.start.column,
                ctx.stop.line,
                ctx.stop.column + (ctx.stop.stop - ctx.stop.start),
                'qualifiedName',
                ctx,
                this.currentCatalog,
                this.currentSchema
            )

            this.specialHighlights.push(currentQualifiedName)
            const name = ctx.getText()

            // Resolve table reference from parts
            const parts = name.split('.')
            let tableRef: TableReference | null = null

            if (parts.length === 3) {
                tableRef = new TableReference(parts[0], parts[1], parts[2])
            } else if (parts.length === 2 && this.currentCatalog) {
                tableRef = new TableReference(this.currentCatalog, parts[0], parts[1])
            } else if (parts.length === 1 && this.currentCatalog && this.currentSchema) {
                tableRef = new TableReference(this.currentCatalog, this.currentSchema, parts[0])
            }

            this.currentTableNameContext = name
            if (tableRef) {
                // Try to populate the cache
                SchemaProvider.getTableIfCached(tableRef)
            }
            this.tableColumns.set(name, this.currentColumns)
            this.currentColumns = []
        }
    }

    public enterQuerySpecification = (ctx: QuerySpecificationContext) => {
        this.currentTableNameContext = ''
    }

    public exitQuerySpecification = (ctx: QuerySpecificationContext) => {
        if (this.currentTableNameContext !== '') {
            const tableName = this.currentTableNameContext
            this.statements.push(new StatementDescriptor(tableName, ctx.start, ctx.stop))
        }
    }

    // The name of a CTE
    public exitNamedQuery = (ctx: any) => {
        if (ctx.children.length > 0 && ctx.children[0] instanceof IdentifierContext) {
            const name = ctx.children[0].getText()
            this.namedQueries.set(name, new NamedQuery(name, ctx))
            this.tableColumns.set(name, this.currentColumns)
            this.currentColumns = []
        }
    }

    // The name of an aliased relation
    public exitAliasedRelation = (ctx: any) => {
        if (ctx.children.length > 2 && ctx.children[2] instanceof IdentifierContext) {
            const name = ctx.children[2].getText()
            this.namedQueries.set(name, new NamedQuery(name, ctx))
            this.tableColumns.set(name, this.currentColumns)
            this.currentColumns = []
        }
    }

    public exitUnquotedIdentifier = (ctx: UnquotedIdentifierContext) => {
        // to know if this is an aliased column we need to go up the tree to the SelectSingleContext
        // if this has an alias, it will have multiple children the last one being the alias, if not it will have only one child
        let current: any = ctx
        while (current && !(current instanceof SelectSingleContext)) {
            current = current.parent
        }

        if (current) {
            if (current.children.length > 1) {
                const alias = current.children[current.children.length - 1].getText()
                this.currentColumns.push(alias)
            } else {
                this.currentColumns.push(ctx.getText())
            }
        }
    }

    public getDecorations() {
        return this.specialHighlights.map((highlight) => highlight.getDecoration(this.namedQueries))
    }
}
export default SqlBaseListenerImpl

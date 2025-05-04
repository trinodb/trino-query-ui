import React from 'react'
import Schema from '../../schema/Schema'
import Table from '../../schema/Table'
import CatalogViewerTable from './CatalogViewerTable'
import TableReference from '../../schema/TableReference'
import { buildPath } from './ViewerState'
import './catalogviewer.css'
import { ChevronRight } from 'lucide-react'

interface SchemaProps {
    catalogName: string
    schema: Schema
    filterText: string
    isExpanded: boolean
    isVisible: (path: string) => boolean
    hasMatchingChildren: (path: string) => boolean
    onToggle: (path: string) => Promise<void>
    onGenerateQuery?: (
        queryType: string,
        tableRef: TableReference | null,
        catalogName?: string,
        schemaName?: string
    ) => void
}

const CatalogViewerSchema: React.FC<SchemaProps> = ({
    catalogName,
    schema,
    filterText,
    isExpanded,
    isVisible,
    hasMatchingChildren,
    onToggle,
    onGenerateQuery,
}) => {
    const schemaPath = buildPath.schema(catalogName, schema.getName())

    // Check visibility using the passed down helper
    if (filterText && !isVisible(schemaPath)) {
        return null
    }

    const handleGenerateQuery = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent toggling expansion
        if (onGenerateQuery) {
            onGenerateQuery('SET_SCHEMA', null, catalogName, schema.getName())
        }
    }

    return (
        <div className="schema-section">
            <div className="viewer_schema" title="Schema" onClick={() => onToggle(schemaPath)}>
                <span className="schema-name">{schema.getName()}</span>
                <span className="helper-text">schema</span>
                <span
                    className={`expand-indicator ${!isExpanded && hasMatchingChildren(schemaPath) ? 'expand-indicator-has-matches' : ''}`}
                >
                    {isExpanded ? '▼' : '▶'}
                </span>

                {onGenerateQuery && (
                    <div
                        className="generate-query-button"
                        onClick={handleGenerateQuery}
                        title="Set this schema as default schema"
                    >
                        <ChevronRight size={16} />
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="viewer-schema-body">
                    {Array.from(schema.getTables().values())
                        .sort((a: Table, b: Table) => a.getName().localeCompare(b.getName()))
                        .map((table: Table) => {
                            const tablePath = buildPath.table(catalogName, schema.getName(), table.getName())

                            // Table visibility is handled within the component
                            return (
                                <CatalogViewerTable
                                    key={tablePath}
                                    tableRef={new TableReference(catalogName, schema.getName(), table.getName())}
                                    filterText={filterText}
                                    isExpanded={isVisible(tablePath)}
                                    isVisible={isVisible}
                                    hasMatchingChildren={hasMatchingChildren}
                                    onToggle={onToggle}
                                    onGenerateQuery={onGenerateQuery}
                                />
                            )
                        })}
                </div>
            )}
        </div>
    )
}

export default CatalogViewerSchema

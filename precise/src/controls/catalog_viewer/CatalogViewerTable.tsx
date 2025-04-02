import React, { useState, useEffect } from 'react';
import Table from '../../schema/Table';
import SchemaProvider from '../../sql/SchemaProvider';
import TableReference from '../../schema/TableReference';
import CatalogViewerColumn from './CatalogViewerColumn';
import { buildPath } from './ViewerState';
import './catalogviewer.css';
import { ChevronRight } from 'lucide-react';

interface CatalogViewerTableProps {
    tableRef: TableReference;
    filterText: string;
    isExpanded: boolean;
    isVisible: (path: string) => boolean;
    hasMatchingChildren: (path: string) => boolean;
    onToggle: (path: string) => Promise<void>;
    onGenerateQuery?: (queryType: string, tableRef: TableReference) => void;
}

const CatalogViewerTable: React.FC<CatalogViewerTableProps> = ({
    tableRef,
    filterText,
    isExpanded,
    isVisible,
    onToggle,
    onGenerateQuery
}) => {
    const [table, setTable] = useState<Table>(() => 
        new Table(tableRef.tableName)
    );

    const [isLoadingColumns, setIsLoadingColumns] = useState(false);

    const tablePath = buildPath.table(
        tableRef.catalogName,
        tableRef.schemaName,
        tableRef.tableName
    );

    // Load columns when expanded OR when there's an active filter
    useEffect(() => {
        if ((isExpanded || filterText) && !table.hasLoadedColumns()) {
            console.log(`Loading table data for ${tableRef.tableName}`, {
                isExpanded,
                filterText,
                hasColumns: table.getColumns().length > 0
            });

            table.setLoading(true);
            SchemaProvider.getTableWithCache(tableRef, (loadedTable: Table) => {
                console.log(`Table data loaded for ${tableRef.tableName}`, {
                    columnCount: loadedTable.getColumns().length
                });
                setTable(loadedTable);
            });
        }
    }, [isExpanded, filterText, tableRef, table]);

    // Check visibility using the passed down helper
    if (!isVisible(tablePath)) {
        return null;
    }

    const handleGenerateQuery = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling expansion
        if (onGenerateQuery) {
            onGenerateQuery('SELECT', tableRef);
        }
    };

    return (
        <div className="table-section">
            <div className="table-header">
                <div 
                    className="viewer_table" 
                    onClick={() => onToggle(tablePath)}
                >
                    <span className="table-name">{table.getName()}</span>
                    <span className="helper-text">table</span>
                    <span className="expand-indicator">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                    
                    {onGenerateQuery && (
                        <div 
                            className="generate-query-button" 
                            onClick={handleGenerateQuery}
                            title="Generate SELECT query for this table"
                        >
                            <ChevronRight size={16} />
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="viewer_table_body">
                    {table.getError() ? (
                        <div className="error-message">{table.getError()}</div>
                    ) : table.getColumns().length === 0 && isExpanded && table.isLoading() ? (
                        <div className="loading-message">Loading columns...</div>
                    ) : table.getColumns().length > 0 && (
                        table.getColumns().map(column => {
                            const columnPath = buildPath.column(
                                tableRef.catalogName,
                                tableRef.schemaName,
                                tableRef.tableName,
                                column.getName()
                            );
                            
                            if (!isVisible(columnPath)) {
                                return null;
                            }

                            return (
                                <CatalogViewerColumn
                                    key={columnPath}
                                    tableRef={tableRef}
                                    column={column}
                                    isExpanded={isExpanded}
                                    isVisible={isVisible}
                                    onToggle={onToggle}
                                />
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default CatalogViewerTable;
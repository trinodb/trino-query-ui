import React, { useState, useEffect } from 'react'
import { Alert, Box, IconButton, Typography } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import TableRowsOutlined from '@mui/icons-material/TableRowsOutlined'
import Table from '../../schema/Table'
import SchemaProvider from '../../sql/SchemaProvider'
import TableReference from '../../schema/TableReference'
import CatalogViewerColumn from './CatalogViewerColumn'
import { buildPath } from './ViewerState'

interface CatalogViewerTableProps {
    tableRef: TableReference
    filterText: string
    isExpanded: boolean
    isVisible: (path: string) => boolean
    isLoading: boolean
    hasMatchingChildren: (path: string) => boolean
    onGenerateQuery?: (queryType: string, tableRef: TableReference) => void
}

const CatalogViewerTable: React.FC<CatalogViewerTableProps> = ({
    tableRef,
    filterText,
    isExpanded,
    isVisible,
    isLoading,
    onGenerateQuery,
}) => {
    const [table, setTable] = useState<Table>(() => new Table(tableRef.tableName))

    const [isLoadingColumns, setIsLoadingColumns] = useState(false)

    const tablePath = buildPath.table(tableRef.catalogName, tableRef.schemaName, tableRef.tableName)

    // Load columns when expanded OR when there's an active filter
    useEffect(() => {
        if ((isExpanded || filterText) && !table.hasLoadedColumns()) {
            console.log(`Loading table data for ${tableRef.tableName}`, {
                isExpanded,
                filterText,
                hasColumns: table.getColumns().length > 0,
            })

            table.setLoading(true)
            SchemaProvider.getTableWithCache(tableRef, (loadedTable: Table) => {
                console.log(`Table data loaded for ${tableRef.tableName}`, {
                    columnCount: loadedTable.getColumns().length,
                })
                setTable(loadedTable)
            })
        }
    }, [isExpanded, filterText, tableRef, table])

    // Check visibility using the passed down helper
    if (!isVisible(tablePath)) {
        return null
    }

    const handleGenerateQuery = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent toggling expansion
        if (onGenerateQuery) {
            onGenerateQuery('SELECT', tableRef)
        }
    }

    return (
        <TreeItem
            key={tablePath}
            itemId={tablePath}
            slots={{
                icon: !table.isLoading() ? TableRowsOutlined : HourglassEmptyOutlinedIcon,
            }}
            label={
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Typography fontSize="small">{table.getName()}</Typography>

                    <IconButton
                        title="Generate SELECT query for this table"
                        size="small"
                        sx={{ ml: 'auto' }}
                        onClick={handleGenerateQuery}
                        disabled={isLoading}
                    >
                        <SearchOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>
            }
            slotProps={{
                label: {
                    style: {
                        overflow: 'visible',
                    },
                },
            }}
        >
            <Box>
                {table.getError() ? (
                    <Alert severity="error">{table.getError()}</Alert>
                ) : table.getColumns().length === 0 && table.isLoading() ? null : (
                    table.getColumns().length > 0 &&
                    table.getColumns().map((column) => {
                        const columnPath = buildPath.column(
                            tableRef.catalogName,
                            tableRef.schemaName,
                            tableRef.tableName,
                            column.getName()
                        )

                        if (!isVisible(columnPath)) {
                            return null
                        }

                        return (
                            <CatalogViewerColumn
                                key={columnPath}
                                tableRef={tableRef}
                                column={column}
                                isVisible={isVisible}
                            />
                        )
                    })
                )}
            </Box>
        </TreeItem>
    )
}

export default CatalogViewerTable

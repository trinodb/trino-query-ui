import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Schema from '../../schema/Schema'
import Table from '../../schema/Table'
import CatalogViewerTable from './CatalogViewerTable'
import TableReference from '../../schema/TableReference'
import { buildPath } from './ViewerState'

interface SchemaProps {
    catalogName: string
    schema: Schema
    filterText: string
    isVisible: (path: string) => boolean
    isLoading: boolean
    hasMatchingChildren: (path: string) => boolean
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
    isVisible,
    isLoading,
    hasMatchingChildren,
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
        <TreeItem
            key={schemaPath}
            itemId={schemaPath}
            slots={{
                icon: AccountTreeOutlinedIcon,
            }}
            label={
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Typography fontSize="small">{schema.getName()}</Typography>

                    <IconButton
                        title="Set this schema as default schema"
                        size="small"
                        sx={{ ml: 'auto' }}
                        onClick={handleGenerateQuery}
                        disabled={isLoading}
                    >
                        <ChevronRightIcon sx={{ fontSize: 14 }} />
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
            {Array.from(schema.getTables().values())
                .sort((a: Table, b: Table) => a.getName().localeCompare(b.getName()))
                .map((table: Table) => {
                    const tablePath = buildPath.table(catalogName, schema.getName(), table.getName())

                    return (
                        <CatalogViewerTable
                            key={tablePath}
                            tableRef={new TableReference(catalogName, schema.getName(), table.getName())}
                            filterText={filterText}
                            isExpanded={isVisible(tablePath)}
                            isVisible={isVisible}
                            isLoading={isLoading}
                            hasMatchingChildren={hasMatchingChildren}
                            onGenerateQuery={onGenerateQuery}
                        />
                    )
                })}
        </TreeItem>
    )
}

export default CatalogViewerSchema

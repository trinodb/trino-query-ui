import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { TreeItem } from '@mui/x-tree-view'
import Column from '../../schema/Column'
import TableReference from './../../schema/TableReference'
import { buildPath } from './ViewerState'

interface CatalogViewerColumnProps {
    tableRef: TableReference
    column: Column
    isVisible: (path: string) => boolean
}

const CatalogViewerColumn: React.FC<CatalogViewerColumnProps> = ({ tableRef, column, isVisible }) => {
    const columnPath = buildPath.column(tableRef.catalogName, tableRef.schemaName, tableRef.tableName, column.getName())

    // Check visibility using the passed down helper
    if (!isVisible(columnPath)) {
        return null
    }

    return (
        <TreeItem
            key={columnPath}
            itemId={columnPath}
            label={
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Stack direction="row">
                        <Typography fontSize="small" noWrap>
                            <Box component="span" sx={{ mr: 1 }}>
                                {column.getName()}
                            </Box>
                            <Box
                                component="span"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontStyle: 'italic',
                                    color: 'text.disabled',
                                }}
                            >
                                {column.getType()}
                            </Box>
                        </Typography>
                    </Stack>
                </Box>
            }
            slotProps={{
                label: {
                    style: {
                        overflow: 'visible',
                    },
                },
            }}
        />
    )
}

export default CatalogViewerColumn

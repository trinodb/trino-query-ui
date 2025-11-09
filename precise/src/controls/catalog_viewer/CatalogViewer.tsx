import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
    Alert,
    AlertTitle,
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    Grid,
    FormControlLabel,
    IconButton,
    LinearProgress,
    TextField,
    Typography,
    Divider,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RefreshIcon from '@mui/icons-material/Refresh'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import CatalogViewerSchema from './CatalogViewerSchema'
import SchemaProvider from './../../sql/SchemaProvider'
import Catalog from './../../schema/Catalog'
import TableReference from '../../schema/TableReference'
import { ViewerStateManager, buildPath } from './ViewerState'

interface CatalogViewerProps {
    initialFilterText?: string
    onGenerateQuery?: (query: string, catalog?: string, schema?: string) => void
    onAppendQuery?: (query: string, catalog?: string, schema?: string) => void
    onDrawerToggle?: () => void
    enableSearchColumns?: boolean
}

const CatalogViewer: React.FC<CatalogViewerProps> = ({
    initialFilterText = '',
    onGenerateQuery,
    onAppendQuery,
    onDrawerToggle,
    enableSearchColumns,
}) => {
    // Basic state
    const [catalogs, setCatalogs] = useState<Map<string, Catalog>>(new Map())
    const [errorMessage, setErrorMessage] = useState<string>()
    const [filterText, setFilterText] = useState(initialFilterText)
    const [debouncedFilterText, setDebouncedFilterText] = useState(initialFilterText)
    const [isLoading, setIsLoading] = useState(false)
    const [searchColumns, setSearchColumns] = useState(false)

    // View state
    const [matches, setMatches] = useState<Set<string>>(new Set())
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const viewerState = useRef<ViewerStateManager | null>(null)

    const [isLoadingColumns, setIsLoadingColumns] = useState(false)

    // Initialize viewer state manager
    useEffect(() => {
        viewerState.current = new ViewerStateManager((update) => {
            console.log('State update received:', {
                matches: update.matches.size,
                expanded: update.expandedNodes.size,
            })
            setMatches(update.matches)
            setExpandedNodes(update.expandedNodes)
        }, setIsLoadingColumns)
    }, [])

    // Handle filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilterText(filterText)
        }, 300)

        return () => clearTimeout(timer)
    }, [filterText])

    // Apply search when filter or search options change
    useEffect(() => {
        if (viewerState.current) {
            console.log('Starting new search:', {
                filter: debouncedFilterText,
                searchColumns,
                catalogCount: catalogs.size,
            })
            viewerState.current.startSearch(debouncedFilterText, searchColumns, catalogs)
        }
    }, [debouncedFilterText, searchColumns, catalogs])

    const loadCatalogs = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage(undefined)

        try {
            await SchemaProvider.populateCatalogsAndRefreshTableList(
                (nextCatalogs) => {
                    setCatalogs(nextCatalogs)
                    setIsLoading(false)
                },
                (error: string) => {
                    setErrorMessage(error)
                    setIsLoading(false)
                }
            )
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
            setIsLoading(false)
        }
    }, [])

    const handleToggle = async (path: string) => {
        if (!viewerState.current) return

        // Toggle the expansion state
        viewerState.current.toggleExpanded(path)

        // If it's a table path, ensure data is loaded
        const pathParts = path.split('.')
        if (pathParts.length === 3) {
            const tableRef = new TableReference(pathParts[0], pathParts[1], pathParts[2])

            await new Promise<void>((resolve) => {
                SchemaProvider.getTableWithCache(tableRef, () => {
                    resolve()
                })
            })
        }
    }

    useEffect(() => {
        loadCatalogs()
    }, [loadCatalogs])

    const isVisible = (path: string): boolean => viewerState.current?.isVisible(path) ?? true

    const isExpanded = (path: string): boolean => viewerState.current?.isExpanded(path) ?? false

    const hasMatchingChildren = (path: string): boolean => viewerState.current?.hasMatchingChildren(path) ?? false

    // Generate query handler
    const handleGenerateQuery = (
        queryType: string,
        tableRef: TableReference | null,
        catalogName?: string,
        schemaName?: string
    ) => {
        if (!onAppendQuery) {
            console.warn('No query handler available')
            return
        }

        if (queryType === 'SELECT' && tableRef) {
            // Load table first to get columns
            SchemaProvider.getTableWithCache(tableRef, (table: any) => {
                const columns = table
                    .getColumns()
                    .map((col: { getName: () => string }) => col.getName())
                    .join(',\n    ')
                const query = `SELECT\n    ${columns}\nFROM ${tableRef.catalogName}.${tableRef.schemaName}.${tableRef.tableName}\nlimit 100`
                onAppendQuery(query, tableRef.catalogName, tableRef.schemaName)
            })
        } else if (queryType === 'SET_SCHEMA' && catalogName && schemaName) {
            // Just set the catalog and schema
            onAppendQuery('', catalogName, schemaName)
        }
    }

    const handleGenerateCatalogQuery = (e: React.MouseEvent, catalogName: string) => {
        e.stopPropagation() // Prevent toggling expansion

        if (onGenerateQuery) {
            onGenerateQuery('', catalogName, '')
        } else {
            console.warn('No query handler available')
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: (theme) => `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(1)})`,
                    px: 0,
                    py: 0,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 0,
                        width: '100%',
                        px: 1,
                        py: 0,
                    }}
                >
                    <TextField
                        label="Find objects"
                        placeholder="Catalog, schema or table name..."
                        size="small"
                        variant="outlined"
                        type="search"
                        sx={{
                            flex: 1,
                            mr: 0,
                            '& .MuiInputBase-input': { fontSize: '0.6rem' },
                            '& .MuiInputBase-input::placeholder': { fontSize: '0.6rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.6rem' },
                        }}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        fullWidth
                    />
                    <IconButton title="Refresh" size="small" onClick={loadCatalogs} disabled={isLoading}>
                        <RefreshIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                    <IconButton title="Close drawer" size="small" onClick={onDrawerToggle}>
                        <ChevronLeftIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                </Box>
                {enableSearchColumns && (
                    <Box
                        sx={{
                            '& .MuiInputBase-input': { fontSize: '0.6rem' },
                            '& .MuiInputBase-input::placeholder': { fontSize: '0.6rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.6rem' },
                            width: '100%',
                            px: 1,
                        }}
                    >
                        <FormControlLabel
                            title="Enabling will fetch table columns for search which may take additional time."
                            control={
                                <Checkbox
                                    size="small"
                                    sx={{ py: 0, '& .MuiSvgIcon-root': { fontSize: 'inherit' } }}
                                    checked={searchColumns}
                                    onChange={(e) => setSearchColumns(e.target.checked)}
                                />
                            }
                            label={
                                <Grid container alignItems="center" columnGap={1}>
                                    <Typography
                                        sx={{
                                            px: 0.1,
                                            pt: 0.1,
                                            fontSize: '0.5rem',
                                        }}
                                    >
                                        Search columns
                                    </Typography>
                                    {isLoadingColumns && <CircularProgress size={22} />}
                                </Grid>
                            }
                        />
                    </Box>
                )}
            </Box>
            <Divider />
            <LinearProgress color="info" sx={{ visibility: isLoading ? 'visible' : 'hidden' }} />
            {errorMessage && (
                <Alert severity="error">
                    <AlertTitle>Catalog Viewer</AlertTitle>
                    {errorMessage}
                </Alert>
            )}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: 0,
                }}
            >
                <SimpleTreeView
                    sx={{
                        '& .MuiTreeItem-content': {
                            minHeight: 24,
                            py: 0.2,
                            my: 0,
                            gap: 0.5,
                        },
                    }}
                    onItemExpansionToggle={(_, itemId) => {
                        handleToggle(itemId)
                    }}
                >
                    {Array.from(catalogs.values())
                        .sort((a, b) => a.getName().localeCompare(b.getName()))
                        .map((catalog: Catalog) => {
                            const catalogName = catalog.getName()
                            const catalogPath = buildPath.catalog(catalogName)

                            if (filterText && !isVisible(catalogPath)) {
                                return null
                            }

                            return (
                                <TreeItem
                                    key={catalogPath}
                                    itemId={catalogPath}
                                    slots={{
                                        icon: StorageOutlinedIcon,
                                    }}
                                    label={
                                        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Typography fontSize="small">{catalogName}</Typography>
                                            {catalog.getType() === 'system' && (
                                                <Chip size="small" label="system catalog" />
                                            )}

                                            <IconButton
                                                title="Set this catalog as default catalog"
                                                size="small"
                                                sx={{ ml: 'auto' }}
                                                onClick={(e) => handleGenerateCatalogQuery(e, catalogName)}
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
                                    <Box>
                                        {catalog.getError() && (
                                            <Alert severity="error">
                                                <AlertTitle>Catalog Viewer</AlertTitle>
                                                {catalog.getError()}
                                            </Alert>
                                        )}

                                        {Array.from(catalog.getSchemas().values())
                                            .sort((a, b) => a.getName().localeCompare(b.getName()))
                                            .map((schema) => {
                                                const schemaName = schema.getName()
                                                const schemaPath = buildPath.schema(catalogName, schemaName)

                                                return (
                                                    <CatalogViewerSchema
                                                        key={schemaPath}
                                                        catalogName={catalogName}
                                                        schema={schema}
                                                        filterText={filterText}
                                                        isVisible={isVisible}
                                                        isLoading={isLoading}
                                                        hasMatchingChildren={hasMatchingChildren}
                                                        onGenerateQuery={handleGenerateQuery}
                                                    />
                                                )
                                            })}
                                    </Box>
                                </TreeItem>
                            )
                        })}
                </SimpleTreeView>
            </Box>
        </Box>
    )
}

export default CatalogViewer

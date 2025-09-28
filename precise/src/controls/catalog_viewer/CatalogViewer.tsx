import React, { useState, useEffect, useCallback, useRef } from 'react'
import SchemaProvider from './../../sql/SchemaProvider'
import Catalog from './../../schema/Catalog'
import TableReference from '../../schema/TableReference'
import CatalogViewerSchema from './CatalogViewerSchema'
import ErrorBox from './../../utils/ErrorBoxProvider'
import CloseIcon from '../../assets/close.png'
import { ViewerStateManager, buildPath } from './ViewerState'
import './catalogviewer.css'
import { Loader2, ChevronRight } from 'lucide-react'

interface CatalogViewerProps {
    initialFilterText?: string
    onGenerateQuery?: (query: string, catalog?: string, schema?: string) => void
    onAppendQuery?: (query: string, catalog?: string, schema?: string) => void
}

const CatalogViewer: React.FC<CatalogViewerProps> = ({ initialFilterText = '', onGenerateQuery, onAppendQuery }) => {
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
                () => {
                    setCatalogs(SchemaProvider.catalogs)
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
        <div className="catalog-viewer">
            <div className="catalog-viewer-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Filter schemas, tables, and columns..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filter-input"
                    />
                    {filterText && (
                        <div
                            className="clear-search"
                            onClick={() => setFilterText('')}
                            role="button"
                            aria-label="Clear search"
                        >
                            <img src={CloseIcon} alt="Clear" width="12" height="12" />
                        </div>
                    )}
                </div>

                <button className="reload-button" title="Reload Catalogs" onClick={loadCatalogs} disabled={isLoading}>
                    &#x27F3;
                </button>
                <label
                    className="search-columns-toggle"
                    title="Enabling will fetch table columns for search which may take additional time."
                >
                    <input
                        type="checkbox"
                        checked={searchColumns}
                        onChange={(e) => setSearchColumns(e.target.checked)}
                    />
                    Search Columns
                    {isLoadingColumns && <Loader2 size={12} className="ml-4 animate-spin" />}
                </label>
            </div>

            {isLoading && <div className="loading-indicator">Loading catalogs...</div>}

            {errorMessage && <ErrorBox errorMessage={errorMessage} errorContext="Catalog Viewer" />}

            <div className="catalogs-container">
                {Array.from(catalogs.values())
                    .sort((a, b) => a.getName().localeCompare(b.getName()))
                    .map((catalog: Catalog) => {
                        const catalogName = catalog.getName()
                        const catalogPath = buildPath.catalog(catalogName)

                        if (filterText && !isVisible(catalogPath)) {
                            return null
                        }

                        return (
                            <div key={catalogName} className="catalog-section">
                                <div className="viewer_catalog" onClick={() => handleToggle(catalogPath)}>
                                    <div className="catalog-content">
                                        <span className="catalog-name">{catalogName}</span>
                                        <span className="helper-text">{catalog.getType()} catalog</span>
                                    </div>
                                    <span
                                        className={`expand-indicator ${!isExpanded(catalogPath) && hasMatchingChildren(catalogPath) ? 'expand-indicator-has-matches' : ''}`}
                                    >
                                        {isExpanded(catalogPath) ? '▼' : '▶'}
                                    </span>
                                    <div
                                        className="generate-query-button"
                                        onClick={(e) => handleGenerateCatalogQuery(e, catalogName)}
                                        title="Set this catalog as default catalog"
                                    >
                                        <ChevronRight size={16} />
                                    </div>
                                </div>

                                {isExpanded(catalogPath) && (
                                    <div className="viewer_catalog_body">
                                        {catalog.getError() && (
                                            <ErrorBox errorMessage={catalog.getError()} errorContext="Catalog Viewer" />
                                        )}

                                        {Array.from(catalog.getSchemas().values())
                                            .sort((a, b) => a.getName().localeCompare(b.getName()))
                                            .map((schema) => {
                                                const schemaPath = buildPath.schema(catalogName, schema.getName())

                                                return (
                                                    <CatalogViewerSchema
                                                        key={schemaPath}
                                                        catalogName={catalogName}
                                                        schema={schema}
                                                        filterText={filterText}
                                                        isExpanded={isExpanded(schemaPath)}
                                                        isVisible={isVisible}
                                                        hasMatchingChildren={hasMatchingChildren}
                                                        onToggle={handleToggle}
                                                        onGenerateQuery={handleGenerateQuery}
                                                    />
                                                )
                                            })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

export default CatalogViewer

import React, { useRef, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Drawer, useMediaQuery } from '@mui/material'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import { ThemeProvider } from '@mui/material/styles'
import QueryCell from './QueryCell'
import { darkTheme, lightTheme } from './theme'
import Queries from './schema/Queries'
import QueryInfo from './schema/QueryInfo'
import CatalogViewer from './controls/catalog_viewer/CatalogViewer'
import SchemaProvider from './sql/SchemaProvider'
import { TrinoClientProvider } from './sql/TrinoClientProvider'
import { ResultSetStore } from './utils/resultSetStore'

import { Theme } from '@mui/material/styles'

interface IQueryEditor {
    height: number
    theme?: 'dark' | 'light' | Theme
    enableCatalogSearchColumns?: boolean
    requestHeaders?: Record<string, string>
    resultSetStore?: ResultSetStore
    baseUrl?: string
}

const DRAWER_WIDTH = 260

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean
}>(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    width: '100%',
    boxSizing: 'border-box',
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    variants: [
        {
            props: ({ open }) => open,
            style: {
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                marginLeft: `${DRAWER_WIDTH}px`,
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}))

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
    position: 'absolute',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                marginLeft: `${DRAWER_WIDTH}px`,
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}))

export const QueryEditor = ({
    height,
    theme,
    enableCatalogSearchColumns,
    requestHeaders,
    resultSetStore,
    baseUrl,
}: IQueryEditor) => {
    const [queries, setQueries] = useState<Queries>(() => new Queries())
    const [drawerOpen, setDrawerOpen] = useState<boolean>(true)
    const [queryRunning, setQueryRunning] = useState<boolean>(false)
    const [currentQuery, setCurrentQuery] = useState<QueryInfo>(queries.getCurrentQuery())
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const containerRef = useRef(null)


    TrinoClientProvider.configure({
        baseUrl,
        requestHeaders,
    })

    const catalogViewerKey = React.useMemo(() => {
        if (!requestHeaders) return 'no-headers'
        const entries = Object.entries(requestHeaders)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k]) => k.toLowerCase())
            .sort()
        return entries.length > 0 ? entries.join('|') : 'no-headers'
    }, [requestHeaders])

    const muiThemeToUse = () => {
        if (typeof theme === 'object' && theme !== null) {
            return theme
        } else if (theme === 'dark') {
            return darkTheme
        } else if (theme === 'light') {
            return lightTheme
        } else if (prefersDarkMode) {
            return darkTheme
        } else {
            return lightTheme
        }
    }

    const applyQueryUpdates = (updates: Partial<QueryInfo>) => {
        const activeQuery = queries.getCurrentQuery()

        if (!activeQuery) {
            return
        }

        queries.updateQuery(activeQuery.id, updates)
        setCurrentQuery((prev) => ({ ...prev, ...updates }))
    }

    const setQueryContent = (query: string, catalog?: string, schema?: string) => {
        const updates: Partial<QueryInfo> = {}

        if (query) {
            updates.query = query
        }

        if (catalog) {
            updates.catalog = catalog
        }

        if (schema) {
            updates.schema = schema
        }

        applyQueryUpdates(updates)
    }

    const appendQueryContent = (query: string, catalog?: string, schema?: string) => {
        const activeQuery = queries.getCurrentQuery()
        const updates: Partial<QueryInfo> = {}

        if (query !== undefined) {
            const existingQuery = activeQuery.query || ''
            const separator = existingQuery.trim() === '' || query.trim() === '' ? '' : '\n\n'
            updates.query = existingQuery + separator + query
        }

        if (catalog !== undefined) {
            updates.catalog = catalog
        }

        if (schema !== undefined) {
            updates.schema = schema
        }

        applyQueryUpdates(updates)
    }

    return (
        <ThemeProvider theme={muiThemeToUse()}>
            <ScopedCssBaseline className="trino-query-ui">
                <Box
                    ref={containerRef}
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'hidden',
                        height: height,
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <AppBar color="transparent" open={drawerOpen} />

                    <Drawer
                        sx={{
                            width: DRAWER_WIDTH,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: DRAWER_WIDTH,
                                boxSizing: 'border-box',
                            },
                        }}
                        variant="persistent"
                        anchor="left"
                        open={drawerOpen}
                        ModalProps={{
                            container: containerRef.current,
                            disablePortal: true,
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    position: 'absolute',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }
                            }
                        }}
                    >
                        <CatalogViewer
                            key={catalogViewerKey}
                            onGenerateQuery={setQueryContent}
                            onAppendQuery={appendQueryContent}
                            onDrawerToggle={() => setDrawerOpen(false)}
                            enableSearchColumns={enableCatalogSearchColumns}
                        />
                    </Drawer>

                    <Main open={drawerOpen} sx={{ p: 0 }}>
                        <QueryCell
                            queries={queries}
                            drawerOpen={drawerOpen}
                            height={height}
                            onDrawerToggle={() => setDrawerOpen(true)}
                            theme={theme}
                            baseUrl={baseUrl}
                            requestHeaders={requestHeaders}
                            resultSetStore={resultSetStore}
                        />
                    </Main>
                </Box>
            </ScopedCssBaseline>
        </ThemeProvider>
    )
}

export default QueryEditor

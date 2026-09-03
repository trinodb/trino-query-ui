import React, { useRef, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Drawer, useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import { ThemeProvider } from '@mui/material/styles'
import QueryCell from './QueryCell'
import { darkTheme, lightTheme } from './theme'
import Queries from './schema/Queries'
import QueryInfo from './schema/QueryInfo'
import CatalogViewer from './controls/catalog_viewer/CatalogViewer'

interface IQueryEditor {
    height: number
    theme?: 'dark' | 'light'
    enableCatalogSearchColumns?: boolean
}

const DRAWER_WIDTH = 260

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean
}>(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    variants: [
        {
            props: ({ open }) => open,
            style: {
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                marginLeft: `${DRAWER_WIDTH}px`,
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

export const QueryEditor = ({ height, theme, enableCatalogSearchColumns }: IQueryEditor) => {
    const [queries, setQueries] = useState<Queries>(() => new Queries())
    const [drawerOpen, setDrawerOpen] = useState<boolean>(true)
    const [queryRunning, setQueryRunning] = useState<boolean>(false)
    const [currentQuery, setCurrentQuery] = useState<QueryInfo>(queries.getCurrentQuery())
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const containerRef = useRef(null)

    const muiThemeToUse = () => {
        if (theme === 'dark') {
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
            <CssBaseline />
            <Box
                ref={containerRef}
                sx={{
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    height: height,
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
                            },
                        },
                    }}
                >
                    <CatalogViewer
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
                    />
                </Main>
            </Box>
        </ThemeProvider>
    )
}

export default QueryEditor

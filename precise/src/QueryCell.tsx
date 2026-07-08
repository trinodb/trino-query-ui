import React, { ReactNode } from 'react'
import { Box, Divider, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material'
import type { TextFieldProps } from '@mui/material/TextField'
import type { TypographyProps } from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import QueryEditorPane from './QueryEditorPane'
import ResultSet from './ResultSet'
import Queries from './schema/Queries'
import QueryInfo from './schema/QueryInfo'
import AsyncTrinoClient from './AsyncTrinoClient'
import { TrinoClientProvider } from './sql/TrinoClientProvider'
import { localStorageResultSetStore, type ResultSetSnapshot, type ResultSetStore } from './utils/resultSetStore'

const TOOLBAR_HEIGHT = 64

interface QueryCellState {
    results: any[]
    columns: any[]
    response: any
    errorMessage: string
    truncationMessage: string
    currentQuery: QueryInfo
    runningQuery: QueryInfo | undefined
    editingTitle: boolean
    editingCatalog: boolean
    editingSchema: boolean
    editorCollapsed: boolean
}

interface QueryCellProps {
    queries: Queries
    drawerOpen: boolean
    height: number
    onDrawerToggle: () => void
    theme?: string
    baseUrl?: string
    requestHeaders?: Record<string, string>
    resultSetStore?: ResultSetStore
}

class QueryCell extends React.Component<QueryCellProps, QueryCellState> {
    private queryRunner: AsyncTrinoClient
    private readonly resultStore: ResultSetStore
    private readonly snapshots = new Map<string, ResultSetSnapshot>()

    private readonly emptySnapshot: ResultSetSnapshot = {
        results: [],
        columns: [],
        response: {},
        errorMessage: '',
        truncationMessage: '',
    }

    constructor(props: QueryCellProps) {
        super(props)
        this.resultStore = props.resultSetStore ?? localStorageResultSetStore

        this.state = {
            results: [],
            columns: [],
            response: {},
            errorMessage: '',
            truncationMessage: '',
            currentQuery: this.props.queries.getCurrentQuery(),
            runningQuery: undefined,
            editingTitle: false,
            editingCatalog: false,
            editingSchema: false,
            editorCollapsed: false,
        }
        this.queryRunner = TrinoClientProvider.createClient()
        this.setupQueryRunner()
    }

    componentDidMount() {
        this.props.queries.addChangeListener(this.handleQueriesChange)
        void this.restoreResultSet(this.state.currentQuery.id)
    }

    componentWillUnmount() {
        this.props.queries.removeChangeListener(this.handleQueriesChange)
    }

    shouldComponentUpdate(nextProps: QueryCellProps, nextState: QueryCellState) {
        // Only update if the ResultSet-related props have changed
        return (
            this.props.drawerOpen !== nextProps.drawerOpen ||
            this.props.height !== nextProps.height ||
            this.props.baseUrl !== nextProps.baseUrl ||
            this.props.requestHeaders !== nextProps.requestHeaders ||
            this.state.results !== nextState.results ||
            this.state.columns !== nextState.columns ||
            this.state.response !== nextState.response ||
            this.state.errorMessage !== nextState.errorMessage ||
            this.state.runningQuery !== nextState.runningQuery ||
            this.state.currentQuery !== nextState.currentQuery ||
            this.state.currentQuery.title !== nextState.currentQuery.title ||
            this.state.editingTitle !== nextState.editingTitle ||
            this.state.editingCatalog !== nextState.editingCatalog ||
            this.state.editingSchema !== nextState.editingSchema ||
            this.state.editorCollapsed !== nextState.editorCollapsed
        )
    }

    componentDidUpdate(prevProps: QueryCellProps) {
        if (prevProps.baseUrl !== this.props.baseUrl && this.props.baseUrl) {
            this.queryRunner.SetBaseUrl(this.props.baseUrl)
        }
        if (prevProps.requestHeaders !== this.props.requestHeaders && this.props.requestHeaders) {
            this.queryRunner.SetRequestHeaders(this.props.requestHeaders)
        }
    }

    handleQueriesChange = () => {
        const currentQuery = this.props.queries.getCurrentQuery()
        this.setState({ currentQuery }, () => {
            void this.restoreResultSet(currentQuery.id)
        })
    }
    private activeQueryId = () => this.state.runningQuery?.id ?? this.state.currentQuery.id

    private applySnapshotToView = (snapshot: ResultSetSnapshot) => {
        this.setState({
            results: snapshot.results,
            columns: snapshot.columns,
            response: snapshot.response,
            errorMessage: snapshot.errorMessage,
            truncationMessage: snapshot.truncationMessage ?? '',
        })
    }

    private persistSnapshot = (queryId: string, patch: Partial<ResultSetSnapshot>) => {
        const next = { ...(this.snapshots.get(queryId) ?? this.emptySnapshot), ...patch }
        this.snapshots.set(queryId, next)
        void this.resultStore.save(queryId, next)

        if (this.state.currentQuery.id === queryId) {
            this.applySnapshotToView(next)
        }
    }

    private async restoreResultSet(queryId: string) {
        const snapshot = this.snapshots.get(queryId) ?? (await this.resultStore.load(queryId))
        if (snapshot) {
            this.snapshots.set(queryId, snapshot)
            if (this.state.currentQuery.id === queryId) {
                this.applySnapshotToView(snapshot)
            }
            return
        }

        if (this.state.currentQuery.id === queryId) {
            this.applySnapshotToView(this.emptySnapshot)
        }
    }

    setupQueryRunner() {
        this.queryRunner.SetResults = (newResults: any[]) => {
            this.persistSnapshot(this.activeQueryId(), { results: newResults })
        }

        this.queryRunner.SetColumns = (newColumns: any[]) => {
            this.persistSnapshot(this.activeQueryId(), { columns: newColumns })
        }

        this.queryRunner.SetStatusCallback((newStatus: any) => {
            this.persistSnapshot(this.activeQueryId(), { response: newStatus })
        })

        this.queryRunner.SetErrorMessageCallback((newErrorMessage: string) => {
            this.persistSnapshot(this.activeQueryId(), { errorMessage: newErrorMessage })
        })

        this.queryRunner.SetTruncationMessageCallback((msg: string) => {
            this.persistSnapshot(this.activeQueryId(), { truncationMessage: msg })
        })

        this.queryRunner.SetStopped = () => {
            this.setState({ runningQuery: undefined })
            this.SetStoppedState()
        }

        this.queryRunner.SetStarted = () => {
            this.QueryStarted()
        }

        this.queryRunner.SetHeadersCallback((catalog: string | null, schema: string | null) => {
            this.props.queries.updateQuery(this.state.currentQuery.id, {
                catalog: catalog ?? undefined,
                schema: schema ?? undefined,
            })
        })

        if (this.props.requestHeaders) {
            this.queryRunner.SetRequestHeaders(this.props.requestHeaders)
        }
    }

    setRunningQueryId = (queryId: string | null) => {
        this.setState({ runningQuery: this.state.currentQuery })
    }

    handleQueryChange = (newQuery: string) => {
        //this.props.queries.updateQuery(this.state.currentQuery.id, { query: newQuery });
    }

    handleTitleChange = (title: string) => {
        this.props.queries.updateQuery(this.state.currentQuery.id, { title: title })
    }

    handleCatalogChange = (catalog: string) => {
        this.props.queries.updateQuery(this.state.currentQuery.id, { catalog: catalog })
    }

    handleSchemaChange = (schema: string) => {
        this.props.queries.updateQuery(this.state.currentQuery.id, { schema: schema })
    }

    ClearResults(queryId = this.state.currentQuery.id) {
        this.snapshots.delete(queryId)
        void this.resultStore.remove(queryId)

        if (this.state.currentQuery.id === queryId) {
            this.applySnapshotToView(this.emptySnapshot)
        }
    }

    QueryStarted() {
        this.ClearResults(this.state.currentQuery.id)
        this.setState({ runningQuery: this.state.currentQuery })
        this.forceUpdate()
    }
    SetStoppedState() {
        this.forceUpdate() // To ensure the play/stop icon updates
    }

    Execute() {
        this.queryRunner.StartQuery(
            this.state.currentQuery.query,
            this.state.currentQuery.catalog,
            this.state.currentQuery.schema
        )
    }

    toggleQueryCollapse = () => {
        this.setState({ editorCollapsed: !this.state.editorCollapsed })
    }

    private renderEditableTextField(
        key: 'editingTitle' | 'editingCatalog' | 'editingSchema',
        value: string | undefined,
        options: {
            typographyProps?: TypographyProps
            textFieldProps?: TextFieldProps
            displayContent?: ReactNode
        } = {}
    ) {
        const { typographyProps = {}, textFieldProps = {}, displayContent } = options
        const isEditing = this.state[key]

        if (isEditing) {
            const { onChange, onKeyDown, onBlur, autoFocus, ...restTextFieldProps } = textFieldProps

            return (
                <TextField
                    size="small"
                    variant="standard"
                    {...restTextFieldProps}
                    value={value ?? ''}
                    onChange={(event) => {
                        onChange?.(event)
                    }}
                    onKeyDown={(event) => {
                        onKeyDown?.(event)
                        if (!event.defaultPrevented && (event.key === 'Enter' || event.key === 'Escape')) {
                            this.setState({ [key]: false } as Pick<QueryCellState, typeof key>)
                        }
                    }}
                    onBlur={(event) => {
                        onBlur?.(event)
                        this.setState({ [key]: false } as Pick<QueryCellState, typeof key>)
                    }}
                    autoFocus={autoFocus ?? true}
                />
            )
        }

        const { onClick, ...restTypographyProps } = typographyProps

        return (
            <Typography
                {...restTypographyProps}
                onClick={(event) => {
                    onClick?.(event)
                    if (!event.defaultPrevented) {
                        this.setState({ [key]: true } as Pick<QueryCellState, typeof key>)
                    }
                }}
            >
                {displayContent ?? value}
            </Typography>
        )
    }

    render() {
        const { results, columns, response, errorMessage, truncationMessage, currentQuery, runningQuery } = this.state
        const isQueryRunning =
            runningQuery !== undefined &&
            response.stats !== undefined &&
            (response.stats.state === 'RUNNING' || response.stats.state === 'QUEUED')

        const availablePanelHeight = Math.max(this.props.height - TOOLBAR_HEIGHT, 0)
        const resultSetHeight = this.state.editorCollapsed ? availablePanelHeight : availablePanelHeight / 2

        return (
            <Box>
                <Toolbar sx={{ pl: 1, pr: 0.25, py: 0 }} disableGutters>
                    <IconButton
                        color="inherit"
                        title="Catalogs"
                        edge="start"
                        onClick={this.props.onDrawerToggle}
                        sx={[{ mx: 0 }, this.props.drawerOpen && { display: 'none' }]}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color={!isQueryRunning ? 'success' : 'error'}
                        title={!isQueryRunning ? 'Run query' : 'Stop query'}
                        onClick={() => this.Execute()}
                    >
                        {!isQueryRunning ? <PlayCircleOutlinedIcon /> : <StopCircleOutlinedIcon />}
                    </IconButton>
                    {this.renderEditableTextField('editingTitle', currentQuery.title, {
                        typographyProps: {
                            variant: 'h6',
                            sx: { ml: 2 },
                        },
                        textFieldProps: {
                            sx: { maxWidth: 200 },
                            onChange: (event) => this.handleTitleChange(event.target.value),
                        },
                    })}
                    <Box sx={{ flexGrow: 1 }} />
                    <Stack direction="row" spacing={3} sx={{ mr: 2 }} alignItems="baseline">
                        <Stack direction="row" spacing={1}>
                            <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
                                Catalog:
                            </Box>
                            {this.renderEditableTextField('editingCatalog', currentQuery.catalog ?? '', {
                                typographyProps: {
                                    sx: { ml: 2, maxWidth: 200, fontFamily: 'monospace' },
                                    noWrap: true,
                                },
                                textFieldProps: {
                                    sx: {
                                        maxWidth: 200,
                                        '& .MuiInputBase-input': { fontFamily: 'monospace' },
                                    },
                                    onChange: (event) => this.handleCatalogChange(event.target.value),
                                },
                                displayContent:
                                    currentQuery.catalog && currentQuery.catalog.length > 0 ? (
                                        currentQuery.catalog
                                    ) : (
                                        <Box component="span" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                                            &lt;no-catalog&gt;
                                        </Box>
                                    ),
                            })}
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
                                Schema:
                            </Box>
                            {this.renderEditableTextField('editingSchema', currentQuery.schema ?? '', {
                                typographyProps: {
                                    sx: { ml: 2, maxWidth: 200, fontFamily: 'monospace' },
                                    noWrap: true,
                                },
                                textFieldProps: {
                                    sx: {
                                        maxWidth: 200,
                                        '& .MuiInputBase-input': { fontFamily: 'monospace' },
                                    },
                                    onChange: (event) => this.handleSchemaChange(event.target.value),
                                },
                                displayContent:
                                    currentQuery.schema && currentQuery.schema.length > 0 ? (
                                        currentQuery.schema
                                    ) : (
                                        <Box component="span" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                                            &lt;no-schema&gt;
                                        </Box>
                                    ),
                            })}
                        </Stack>
                    </Stack>
                    <IconButton color="inherit" title="Collapse query" onClick={this.toggleQueryCollapse}>
                        {this.state.editorCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
                    </IconButton>
                </Toolbar>
                <Divider />
                <Box sx={{ display: this.state.editorCollapsed ? 'none' : 'block' }}>
                    <QueryEditorPane
                        onQueryChange={this.handleQueryChange}
                        onSelectChange={() => { }}
                        onExecute={() => this.Execute()}
                        queries={this.props.queries}
                        catalog={currentQuery.catalog}
                        schema={currentQuery.schema}
                        theme={this.props.theme}
                        maxHeight={availablePanelHeight}
                    />
                    {this.props.theme != 'dark' && <Divider />}
                </Box>
                <ResultSet
                    columns={columns}
                    results={results}
                    response={response}
                    height={resultSetHeight}
                    errorMessage={errorMessage}
                    truncationMessage={truncationMessage}
                    queryId={runningQuery?.id}
                    onClearResults={() => this.ClearResults()}
                />
            </Box>
        )
    }
}

export default QueryCell

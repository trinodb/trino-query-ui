import React from 'react'
import QueryEditorPane from './QueryEditorPane'
import ResultSet from './ResultSet'
import Queries from './schema/Queries'
import QueryInfo from './schema/QueryInfo'
import AsyncTrinoClient from './AsyncTrinoClient'
import { Play, StopCircle, Link, Plus, FileEdit, MinusSquare, PlusSquare } from 'lucide-react'
import './style/components.css'
import './style/query-editor.css'

interface QueryCellState {
    results: any[]
    columns: any[]
    response: any
    errorMessage: string
    currentQuery: QueryInfo
    runningQuery: QueryInfo | undefined
}

interface QueryCellProps {
    queries: Queries
}

class QueryCell extends React.Component<QueryCellProps, QueryCellState> {
    private queryRunner: AsyncTrinoClient
    private isQueryCollapsed: boolean = false

    constructor(props: QueryCellProps) {
        super(props)
        this.state = {
            results: [],
            columns: [],
            response: {},
            errorMessage: '',
            currentQuery: this.props.queries.getCurrentQuery(),
            runningQuery: undefined,
        }
        this.queryRunner = new AsyncTrinoClient()
        this.setupQueryRunner()
    }

    componentDidMount() {
        this.props.queries.addChangeListener(this.handleQueriesChange)
    }

    componentWillUnmount() {
        this.props.queries.removeChangeListener(this.handleQueriesChange)
    }

    shouldComponentUpdate(nextProps: QueryCellProps, nextState: QueryCellState) {
        // Only update if the ResultSet-related props have changed
        return (
            this.state.results !== nextState.results ||
            this.state.columns !== nextState.columns ||
            this.state.response !== nextState.response ||
            this.state.errorMessage !== nextState.errorMessage ||
            this.state.runningQuery !== nextState.runningQuery ||
            this.state.currentQuery !== nextState.currentQuery ||
            this.state.currentQuery.title !== nextState.currentQuery.title
        )
    }

    handleQueriesChange = () => {
        this.setState({ currentQuery: this.props.queries.getCurrentQuery() })
    }

    setupQueryRunner() {
        this.queryRunner.SetResults = (newResults: any[]) => {
            this.setState({ results: newResults })
        }

        this.queryRunner.SetColumns = (newColumns: any[]) => {
            this.setState({ columns: newColumns })
        }

        this.queryRunner.SetStatusCallback((setStatus: (newStatus: any) => any) => {
            this.setState({ response: setStatus })
        })

        this.queryRunner.SetErrorMessageCallback((newErrorMessage: string) => {
            this.setState({ errorMessage: newErrorMessage })
        })

        this.queryRunner.SetStopped = () => {
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

    ClearResults() {
        this.setState({ results: [], columns: [], errorMessage: '' })
    }

    QueryStarted() {
        this.ClearResults()
        this.setRunningQueryId(this.state.currentQuery.id)
        this.forceUpdate() // To ensure the play/stop icon updates
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
        const queryEditor = document.getElementById('query-editor')
        if (queryEditor) {
            this.isQueryCollapsed = !this.isQueryCollapsed
            queryEditor.style.display = this.isQueryCollapsed ? 'none' : 'block'
        }
    }

    render() {
        const { results, columns, response, errorMessage, currentQuery, runningQuery } = this.state
        const isQueryRunning =
            runningQuery !== undefined &&
            response.stats !== undefined &&
            (response.stats.state === 'RUNNING' || response.stats.state === 'QUEUED')

        return (
            <>
                <div className="card-header" id="query-header">
                    <div className="card-header-grid">
                        <button
                            className="query-run-button flex items-center justify-center"
                            onClick={() => this.Execute()}
                            title="Run Query"
                            id="execute-button"
                        >
                            {isQueryRunning ? (
                                <StopCircle className="w-5 h-5" strokeWidth={1.5} />
                            ) : (
                                <Play className="w-5 h-5" strokeWidth={1.5} />
                            )}
                        </button>
                        <input
                            type="text"
                            placeholder="Query Title"
                            className="query-title"
                            id="query-title"
                            onChange={(e) => this.handleTitleChange(e.target.value)}
                            value={currentQuery.title}
                        />
                        <input
                            type="text"
                            placeholder="<no-catalog>"
                            className="catalog-setting"
                            title="Catalog"
                            id="catalog-text"
                            onChange={(e) =>
                                this.props.queries.updateQuery(this.state.currentQuery.id, { catalog: e.target.value })
                            }
                            value={currentQuery.catalog ?? ''}
                        />
                        <input
                            type="text"
                            placeholder="<no-schema>"
                            className="schema-setting"
                            title="Schema"
                            id="schema-text"
                            onChange={(e) =>
                                this.props.queries.updateQuery(this.state.currentQuery.id, { schema: e.target.value })
                            }
                            value={currentQuery.schema ?? ''}
                        />
                        <button
                            className="query-control-button flex items-center justify-center"
                            onClick={() => {
                                const url =
                                    window.location.href.split('?')[0] +
                                    `?n=${encodeURIComponent(currentQuery.title)}&q=${encodeURIComponent(currentQuery.query)}`
                                if (url.length > 8000) {
                                    alert('The URL is too long to copy. Please copy and paste the query manually.')
                                } else {
                                    navigator.clipboard.writeText(url)
                                }
                            }}
                            title="Copy Query Link"
                        >
                            <Link className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div></div>
                        <button
                            className="query-control-button flex items-center justify-center"
                            onClick={() => {
                                const addedQuery: QueryInfo = this.props.queries.addQuery(true)
                            }}
                            title="Add Query"
                        >
                            <Plus className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div></div>
                        <button
                            className="query-control-button flex items-center justify-center"
                            onClick={() => {
                                alert('Not implemented')
                            }}
                            title="Add Parameters"
                        >
                            <FileEdit className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div></div>
                        <button
                            className="query-control-button flex items-center justify-center"
                            onClick={this.toggleQueryCollapse}
                            title="Collapse Query"
                        >
                            {this.isQueryCollapsed ? (
                                <PlusSquare className="w-5 h-5" strokeWidth={1.5} />
                            ) : (
                                <MinusSquare className="w-5 h-5" strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>
                <div className="editorspace" id="query-editor">
                    <QueryEditorPane
                        onQueryChange={this.handleQueryChange}
                        onSelectChange={() => {}}
                        onExecute={() => this.Execute()}
                        queries={this.props.queries}
                        catalog={currentQuery.catalog}
                        schema={currentQuery.schema}
                    />
                </div>
                <div className="resultSetPort">
                    <ResultSet
                        columns={columns}
                        results={results}
                        response={response}
                        errorMessage={errorMessage}
                        queryInfo={runningQuery}
                        onClearResults={() => this.ClearResults()}
                    />
                </div>
            </>
        )
    }
}

export default QueryCell

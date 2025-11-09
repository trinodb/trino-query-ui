import React from 'react'
import {
    Alert,
    Box,
    CircularProgress,
    LinearProgress,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Chip, { ChipProps } from '@mui/material/Chip'
import ReactDOMServer from 'react-dom/server'
import CopyLink from './utils/CopyLink'
import ClearButton from './utils/ClearButton'

interface ResultSetProps {
    queryId: string | undefined
    results: any[]
    columns: any[]
    response: any
    height: number
    errorMessage: string
    onClearResults: (queryId: string | undefined) => void
}

class ResultSet extends React.Component<ResultSetProps> {
    previousRunningPercentage: number = 0
    statsHistory: any[] = []
    lastQueryId: string | undefined = undefined

    static readonly STATE_COLOR_MAP: Record<string, ChipProps['color']> = {
        QUEUED: 'default',
        RUNNING: 'info',
        PLANNING: 'info',
        FINISHED: 'success',
        BLOCKED: 'secondary',
        USER_ERROR: 'error',
        CANCELED: 'warning',
        INSUFFICIENT_RESOURCES: 'error',
        EXTERNAL_ERROR: 'error',
        UNKNOWN_ERROR: 'error',
    }

    getQueryStateColor(queryState: string): ChipProps['color'] {
        switch (queryState) {
            case 'QUEUED':
                return ResultSet.STATE_COLOR_MAP.QUEUED
            case 'PLANNING':
                return ResultSet.STATE_COLOR_MAP.PLANNING
            case 'STARTING':
            case 'FINISHING':
            case 'RUNNING':
                return ResultSet.STATE_COLOR_MAP.RUNNING
            case 'FAILED':
                return ResultSet.STATE_COLOR_MAP.UNKNOWN_ERROR
            case 'FINISHED':
                return ResultSet.STATE_COLOR_MAP.FINISHED
            default:
                return ResultSet.STATE_COLOR_MAP.QUEUED
        }
    }

    renderHeader(columns: any) {
        return (
            <thead>
                <tr>
                    {columns.map((column: any, index: any) => (
                        <th key={column.name + index} title={column.type}>
                            {column.name}
                        </th>
                    ))}
                </tr>
            </thead>
        )
    }

    renderCell(cellData: any, cellIndex: any) {
        return (
            <td key={cellIndex} className={cellData == null ? 'result-cell-null' : ''}>
                {cellData == null ? 'null' : cellData}
            </td>
        )
    }

    renderRow(rowData: any, rowIndex: any) {
        return (
            <tr key={rowIndex}>
                {rowData.map((cellData: any, cellIndex: any) => this.renderCell(cellData, cellIndex))}
            </tr>
        )
    }

    renderPage(pageData: any, pageIndex: any) {
        // Add the 'page' class to each table for styling
        return (
            <tbody key={pageIndex}>
                {pageData.map((rowData: any, rowIndex: any) => this.renderRow(rowData, rowIndex))}
            </tbody>
        )
    }

    renderTable = (results: any[], columns: any) => {
        const muiColumns: GridColDef[] = columns.map((column: any) => ({ field: column.name, minWidth: 150 }))
        const muiRows = results
            .flat()
            .map((row: any[], i: number) =>
                Object.fromEntries([
                    ['mui-row-id', `row-${i + 1}`],
                    ...columns.map((c: any, j: number) => [c.name, row[j]]),
                ])
            )

        return (
            <DataGrid
                rows={muiRows}
                columns={muiColumns}
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
                }}
                getRowId={(row) => String(row['mui-row-id'])}
                density="compact"
            />
        )
    }

    renderInnerTable = (results: any[], response: any, columns: any) => {
        return (
            <table className="page result-table" key={response.id}>
                {columns ? this.renderHeader(columns) : null}
                {results && results.length
                    ? results.map((pageData, pageIndex) => this.renderPage(pageData, pageIndex))
                    : null}
            </table>
        )
    }

    isFinishedFailedOrCancelled(state: string) {
        return state === 'FINISHED' || state === 'FAILED' || state === 'CANCELLED'
    }

    getRowCount() {
        const { results } = this.props
        if (!results) {
            return 0
        }
        return results.reduce((sum, page) => sum + page.length, 0)
    }

    formatMillisAsHHMMSS(millis: number) {
        const seconds = Math.floor(millis / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    }

    bytesToCorrectScale(bytes: number) {
        if (isNaN(bytes)) {
            return ``
        }

        if (bytes < 128) {
            return `${bytes.toFixed(0)} B`
        }
        const kb = bytes / 1024
        if (kb < 128) {
            return `${kb.toFixed(2)} KB`
        }
        const mb = kb / 1024
        if (mb < 128) {
            return `${mb.toFixed(2)} MB`
        }
        const gb = mb / 1024
        return `${gb.toFixed(2)} GB`
    }

    unpackSubstages(subStages: any, stages: any[], depth: number): any[] {
        if (subStages) {
            for (let i = 0; i < subStages.length; i++) {
                const subStage = subStages[i]
                stages.push({ stage: subStage, depth: depth })
                if (subStage.subStages) {
                    this.unpackSubstages(subStage.subStages, stages, depth + 1)
                }
            }
        }
        return stages
    }

    rowCountToCorrectScale(rowCount: number) {
        // if not a number return 0
        if (isNaN(rowCount)) {
            return 0
        }

        if (rowCount < 1000) {
            return rowCount.toFixed(0)
        }
        const k = rowCount / 1000
        if (k < 1000) {
            return `${k.toFixed(1)}K`
        }
        const m = k / 1000
        if (m < 1000) {
            return `${m.toFixed(1)}M`
        }
        const b = m / 1000
        return `${b.toFixed(1)}B`
    }

    // reset function
    reset() {
        this.statsHistory = []
    }

    formatTableAsPlainText(results: any[], columns: any[]): string {
        if (!columns || columns.length === 0) {
            return ''
        }

        // Calculate the maximum width for each column
        const columnWidths = columns.map((column: any) =>
            Math.max(
                column.name.length,
                ...results.flat().map((row: any[]) => row[columns.indexOf(column)]?.toString().length || 0)
            )
        )

        // Create the header
        let tableText =
            columns.map((column: any, index: number) => column.name.padEnd(columnWidths[index])).join(' | ') + '\n'

        // Add a separator line
        tableText += columnWidths.map((width) => '-'.repeat(width)).join('-+-') + '\n'

        // Add the data rows
        results.forEach((page: any[]) => {
            page.forEach((row: any[]) => {
                tableText +=
                    row
                        .map((cell: any, index: number) => (cell?.toString() || '').padEnd(columnWidths[index]))
                        .join(' | ') + '\n'
            })
        })

        return tableText
    }

    copy() {
        const { results, columns } = this.props
        const htmlContent = ReactDOMServer.renderToString(this.renderInnerTable(results, this.props.response, columns))
        const plainTextContent = this.formatTableAsPlainText(results, columns)

        const blobHtml = new Blob([htmlContent], { type: 'text/html' })
        const blobText = new Blob([plainTextContent], { type: 'text/plain' })

        navigator.clipboard
            .write([
                new ClipboardItem({
                    'text/html': blobHtml,
                    'text/plain': blobText,
                }),
            ])
            .then(() => {
                console.log('Table copied successfully')
            })
            .catch((err) => {
                console.error('Failed to copy table:', err)
            })
    }

    render() {
        const { queryId, results, columns, response, height, errorMessage } = this.props

        // if the query ID has changed, reset the last processed rows and elapsed time
        if (this.lastQueryId !== queryId) {
            this.reset()
        }

        this.lastQueryId = queryId

        // new implementation, look over 10 second window in stats history
        let processedRowsSinceLast = 0
        if (response.stats && response.stats.processedRows) {
            const stat = response.stats
            this.statsHistory.push(stat)
            if (this.statsHistory.length > 2) {
                const lastStat = this.statsHistory[this.statsHistory.length - 1]
                const tenSecondsAgo = lastStat.elapsedTimeMillis - 10000
                // walk backwards to find stat that is 10 seconds ago
                let indexOfFirstStatInWindow = 0
                for (let i = this.statsHistory.length - 2; i >= 0; i--) {
                    if (this.statsHistory[i].elapsedTimeMillis < tenSecondsAgo) {
                        indexOfFirstStatInWindow = i
                        break
                    }
                }

                const firstStatInWindow = this.statsHistory[indexOfFirstStatInWindow]
                processedRowsSinceLast =
                    (lastStat.processedRows - firstStatInWindow.processedRows) /
                    ((lastStat.elapsedTimeMillis - firstStatInWindow.elapsedTimeMillis) / 1000.0)
            }
        }

        // unpack substages into a list of stages with nest depth
        const stages: any[] = []
        this.unpackSubstages(
            response.stats && response.stats.rootStage && response.stats.rootStage.subStages,
            stages,
            1
        )

        // get min and max throughput
        let minThroughput = Number.MAX_VALUE
        let maxThroughput = 0
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i].stage
            const throughput = stage.processedRows / (stage.wallTimeMillis / 1000)
            if (throughput < minThroughput) {
                minThroughput = throughput
            }
            if (throughput > maxThroughput) {
                maxThroughput = throughput
            }
        }

        // Ensure the 'result-set' class is applied to the container
        return (
            <Box>
                {response && response.id ? (
                    <Box display="flex" alignItems="center" gap={1} fontSize="0.8rem" sx={{ p: 1 }}>
                        {errorMessage ? (
                            <Alert severity="error" sx={{ py: 0 }}>
                                {errorMessage}
                            </Alert>
                        ) : null}
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem' }}>
                            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                                {this.getRowCount()} rows:
                            </Typography>
                            <Typography variant="caption">
                                <Link href={`/ui/query.html?${response.id}`}>{response.id}</Link>
                            </Typography>
                            {columns && columns.length ? (
                                response.stats && this.isFinishedFailedOrCancelled(response.stats.state) ? (
                                    <>
                                        <ClearButton onClear={() => this.props.onClearResults(queryId)} />
                                        <CopyLink copy={() => this.copy()} />
                                    </>
                                ) : null
                            ) : null}
                        </Box>
                    </Box>
                ) : null}
                {/* if the status is not finished, show spinner */}
                {response &&
                response.stats &&
                response.stats.state !== 'FINISHED' &&
                response.stats.state !== 'FAILED' &&
                response.stats.state !== 'CANCELLED' ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
                            <CircularProgress size={25} />
                            <Typography variant="h6">
                                {response && response.stats && response.stats.progressPercentage
                                    ? Math.floor(response.stats.progressPercentage)
                                    : 0}
                                %
                            </Typography>
                            <Stack alignItems="flex-start">
                                <Chip
                                    size="small"
                                    label={response.stats.state}
                                    color={this.getQueryStateColor(response.stats.state)}
                                />
                                <Typography variant="caption">
                                    Workers: {response.stats.nodes}, Running splits: {response.stats.runningSplits},
                                    Total splits: {response.stats.totalSplits}, Run time:{' '}
                                    {Math.floor(response.stats.elapsedTimeMillis / 1000)}s
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
                            <LinearProgress
                                sx={{ flexGrow: 1 }}
                                variant="determinate"
                                color="info"
                                value={
                                    response && response.stats && response.stats.progressPercentage
                                        ? Math.floor(response.stats.progressPercentage)
                                        : 0
                                }
                            />
                            <Typography variant="caption">
                                {this.formatMillisAsHHMMSS(response.stats.elapsedTimeMillis)}
                            </Typography>
                        </Box>
                        <Box>
                            {response.stats.rootStage && response.stats.rootStage.subStages ? (
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        // decrease the resultset size by the header size
                                        height: height - 42,
                                        overflowY: 'auto',
                                    }}
                                >
                                    <Table
                                        sx={{
                                            '& .MuiTableRow-root > *': {
                                                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                                            },
                                            '& .MuiTableRow-root > *:last-of-type': {
                                                borderRight: 'none',
                                            },
                                        }}
                                        size="small"
                                        stickyHeader
                                    >
                                        <TableHead>
                                            <TableRow sx={{ '& th': { fontWeight: 600 } }}>
                                                <TableCell align="left" colSpan={3}>
                                                    Query run metrics
                                                </TableCell>
                                                <TableCell align="center" colSpan={3}>
                                                    Rows
                                                </TableCell>
                                                <TableCell align="center" colSpan={4}>
                                                    Bytes
                                                </TableCell>
                                                <TableCell align="center" colSpan={3}>
                                                    Splits
                                                </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ '& th': { fontWeight: 600 } }}>
                                                <TableCell>Stage</TableCell>
                                                <TableCell>Nodes</TableCell>
                                                <TableCell align="right">Processed</TableCell>
                                                <TableCell align="right">Rate</TableCell>
                                                <TableCell align="right">Current Rate</TableCell>
                                                <TableCell align="right">Processed</TableCell>
                                                <TableCell align="right">Rate</TableCell>
                                                <TableCell align="right">Current Rate</TableCell>
                                                <TableCell align="right">Input Processed</TableCell>
                                                <TableCell align="right">Queued</TableCell>
                                                <TableCell align="right">Running</TableCell>
                                                <TableCell align="right">Done</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow
                                                sx={{
                                                    '& td, & th': {
                                                        color:
                                                            response.stats.rootStage.state === 'RUNNING'
                                                                ? 'text.primary'
                                                                : 'text.disabled',
                                                    },
                                                }}
                                                key="root_stage_stages"
                                            >
                                                <TableCell>0 (root)</TableCell>
                                                <TableCell>{response.stats.rootStage.nodes}</TableCell>
                                                <TableCell align="right">
                                                    {this.rowCountToCorrectScale(
                                                        response.stats.rootStage.processedRows
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.rowCountToCorrectScale(
                                                        response.stats.rootStage.processedRows /
                                                            (response.stats.rootStage.wallTimeMillis / 1000)
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" />
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(response.stats.rootStage.processedBytes)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(
                                                        response.stats.rootStage.processedBytes /
                                                            (response.stats.wallTimeMillis / 1000)
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" />
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(
                                                        response.stats.rootStage.physicalInputBytes
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {response.stats.rootStage.queuedSplits}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {response.stats.rootStage.runningSplits}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {response.stats.rootStage.completedSplits}
                                                </TableCell>
                                            </TableRow>

                                            {/* Sub-stages */}
                                            {stages.map((subStageInfo: any) => (
                                                <TableRow
                                                    sx={{
                                                        '& td, & th': {
                                                            color:
                                                                subStageInfo.stage.state === 'RUNNING'
                                                                    ? 'text.primary'
                                                                    : 'text.disabled',
                                                        },
                                                    }}
                                                    key={`${response.id}-${subStageInfo.stage.stageId}`}
                                                >
                                                    <TableCell>{subStageInfo.stage.stageId}</TableCell>
                                                    <TableCell>{subStageInfo.stage.nodes}</TableCell>
                                                    <TableCell align="right">
                                                        {this.rowCountToCorrectScale(subStageInfo.stage.processedRows)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {this.rowCountToCorrectScale(
                                                            subStageInfo.stage.processedRows /
                                                                (subStageInfo.stage.wallTimeMillis / 1000)
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right" />
                                                    <TableCell align="right">
                                                        {this.bytesToCorrectScale(response.stats.processedBytes)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {this.bytesToCorrectScale(
                                                            subStageInfo.stage.processedBytes /
                                                                (subStageInfo.stage.wallTimeMillis / 1000)
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right" />
                                                    <TableCell align="right">
                                                        {this.bytesToCorrectScale(response.stats.physicalInputBytes)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {subStageInfo.stage.queuedSplits}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {subStageInfo.stage.runningSplits}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {subStageInfo.stage.completedSplits}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>

                                        <TableFooter
                                            sx={{
                                                '& .MuiTableCell-footer': {
                                                    fontWeight: (theme) => theme.typography.fontWeightBold,
                                                    color: 'text.primary',
                                                },
                                            }}
                                        >
                                            {/* Totals */}
                                            <TableRow key="results_all_stages">
                                                <TableCell>Total</TableCell>
                                                <TableCell>{response.stats.nodes}</TableCell>
                                                <TableCell align="right">
                                                    {this.rowCountToCorrectScale(response.stats.processedRows)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.rowCountToCorrectScale(
                                                        response.stats.processedRows /
                                                            (response.stats.elapsedTimeMillis / 1000)
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.rowCountToCorrectScale(processedRowsSinceLast)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(response.stats.processedBytes)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(
                                                        response.stats.processedBytes /
                                                            (response.stats.elapsedTimeMillis / 1000)
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" />
                                                <TableCell align="right">
                                                    {this.bytesToCorrectScale(response.stats.physicalInputBytes)}
                                                </TableCell>
                                                <TableCell align="right">{response.stats.queuedSplits}</TableCell>
                                                <TableCell align="right">{response.stats.runningSplits}</TableCell>
                                                <TableCell align="right">{response.stats.completedSplits}</TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            ) : null}
                        </Box>
                    </>
                ) : columns && columns.length ? (
                    <Box
                        sx={{
                            // decrease the resultset size by the header size
                            height: height - 42,
                            overflowY: 'auto',
                        }}
                    >
                        {this.renderTable(results, columns)}
                    </Box>
                ) : null}
            </Box>
        )
    }
}

export default ResultSet

import React from 'react'
import QueryInfo from './schema/QueryInfo';
import ReactDOMServer from 'react-dom/server';
import ErrorBox from './utils/ErrorBoxProvider';
import ProgressBar from './utils/ProgressBar';
import CopyLink from './utils/CopyLink';
import ClearButton from './utils/ClearButton';
import './style/results.css';

interface ResultSetProps {
    queryInfo: QueryInfo | undefined;
    results: any[];
    columns: any[];
    response: any;
    errorMessage: string;
    onClearResults: (queryId: string | undefined) => void;
}

class ResultSet extends React.Component<ResultSetProps> {

    previousRunningPercentage: number = 0;
    statsHistory : any[] = [];
    lastQueryId : string | undefined = undefined

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
        );
    }

    renderCell(cellData: any, cellIndex: any) {
        return (
            <td key={cellIndex} className={cellData == null ? "result-cell-null" : ""}>
                {cellData == null ? "null" : cellData}
            </td>
        );
    }

    renderRow(rowData: any, rowIndex: any) {
        return (
            <tr key={rowIndex}>
                {rowData.map((cellData : any, cellIndex: any) => this.renderCell(cellData, cellIndex))}
            </tr>
        );
    }

    renderPage(pageData: any, pageIndex: any) {
        // Add the 'page' class to each table for styling
        return (
            <tbody key={pageIndex}>
                {pageData.map((rowData: any, rowIndex: any) => this.renderRow(rowData, rowIndex))}
            </tbody>
        );
    }

    renderTable = (results: any[], response : any, columns : any) => {
        return (
            <div className={this.getRowCount() > 30 ? "scrollable" : "result-table-container"}>
                {this.renderInnerTable(results, response, columns)}
            </div>
        );
    }
    
    renderInnerTable = (results: any[], response : any, columns : any) => {
        return (
            <table className="page result-table" key={response.id}>
                {columns ? this.renderHeader(columns) : null}
                {results && results.length ? (
                    results.map((pageData, pageIndex) => this.renderPage(pageData, pageIndex))
                ) : null}
            </table>
        )
    }

    isFinishedFailedOrCancelled(state: string) {
        return state === 'FINISHED' || state === 'FAILED' || state === 'CANCELLED';
    }

    getRowCount() {
        const { results } = this.props;
        if (!results) {
            return 0;
        }
        return results.reduce((sum, page) => sum + page.length, 0);
    }

    formatMillisAsHHMMSS(millis: number) {
        const seconds = Math.floor(millis / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    bytesToCorrectScale(bytes: number) {

        if (isNaN(bytes)) {
            return ``;
        }

        if (bytes < 128) {
            return `${bytes.toFixed(0)} B`;
        }
        const kb = bytes / 1024;
        if (kb < 128) {
            return `${kb.toFixed(2)} KB`;
        }
        const mb = kb / 1024;
        if (mb < 128) {
            return `${mb.toFixed(2)} MB`;
        }
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    }

    unpackSubstages(subStages: any, stages : any[], depth: number) : any[] {
        if (subStages) {
            for (let i = 0; i < subStages.length; i++) {
                const subStage = subStages[i];
                stages.push({ stage: subStage, depth: depth });
                if (subStage.subStages) {
                    this.unpackSubstages(subStage.subStages, stages, depth + 1);
                }
            }
        }
        return stages;
    }

    rowCountToCorrectScale(rowCount: number) {

        // if not a number return 0
        if (isNaN(rowCount)) {
            return 0;
        }

        if (rowCount < 1000) {
            return rowCount.toFixed(0);
        }
        const k = rowCount / 1000;
        if (k < 1000) {
            return `${k.toFixed(1)}K`;
        }
        const m = k / 1000;
        if (m < 1000) {
            return `${m.toFixed(1)}M`;
        }
        const b = m / 1000;
        return `${b.toFixed(1)}B`;
    }

    // reset function
    reset() {
        this.statsHistory = [];
    }

    formatTableAsPlainText(results: any[], columns: any[]): string {
        if (!columns || columns.length === 0) {
            return '';
        }

        // Calculate the maximum width for each column
        const columnWidths = columns.map((column: any) => 
            Math.max(column.name.length, ...results.flat().map((row: any[]) => 
                row[columns.indexOf(column)]?.toString().length || 0
            ))
        );

        // Create the header
        let tableText = columns.map((column: any, index: number) => 
            column.name.padEnd(columnWidths[index])
        ).join(' | ') + '\n';

        // Add a separator line
        tableText += columnWidths.map(width => '-'.repeat(width)).join('-+-') + '\n';

        // Add the data rows
        results.forEach((page: any[]) => {
            page.forEach((row: any[]) => {
                tableText += row.map((cell: any, index: number) => 
                    (cell?.toString() || '').padEnd(columnWidths[index])
                ).join(' | ') + '\n';
            });
        });

        return tableText;
    }

    copy() {
        const { results, columns } = this.props;
        const htmlContent = ReactDOMServer.renderToString(
            this.renderInnerTable(results, this.props.response, columns)
        );
        const plainTextContent = this.formatTableAsPlainText(results, columns);

        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([plainTextContent], { type: 'text/plain' });

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText,
            })
        ]).then(() => {
            console.log('Table copied successfully');
        }).catch(err => {
            console.error('Failed to copy table:', err);
        });
    }

    render() {
        const { queryInfo, results, columns, response, errorMessage } = this.props;

        // if the query ID has changed, reset the last processed rows and elapsed time
        if (queryInfo == null || this.lastQueryId !== queryInfo.id) {
            this.reset();
        }
        
        this.lastQueryId = queryInfo?.id;

        // new implementation, look over 10 second window in stats history
        var processedRowsSinceLast = 0;
        if (response.stats && response.stats.processedRows) {
            const stat = response.stats;
            this.statsHistory.push(stat);
            if (this.statsHistory.length > 2) {
                const lastStat = this.statsHistory[this.statsHistory.length - 1];
                const tenSecondsAgo = lastStat.elapsedTimeMillis - 10000;
                // walk backwards to find stat that is 10 seconds ago
                let indexOfFirstStatInWindow = 0;
                for (let i = this.statsHistory.length - 2; i >= 0; i--) {
                    if (this.statsHistory[i].elapsedTimeMillis < tenSecondsAgo) {
                        indexOfFirstStatInWindow = i;
                        break;
                    }
                }

                const firstStatInWindow = this.statsHistory[indexOfFirstStatInWindow];
                processedRowsSinceLast = (lastStat.processedRows - firstStatInWindow.processedRows) / ((lastStat.elapsedTimeMillis - firstStatInWindow.elapsedTimeMillis) / 1000.0);
            }
        }

        // unpack substages into a list of stages with nest depth
        var stages : any[] = [];
        this.unpackSubstages(response.stats && response.stats.rootStage && response.stats.rootStage.subStages, stages, 1);

        // get min and max throughput
        var minThroughput = Number.MAX_VALUE;
        var maxThroughput = 0;
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i].stage;
            const throughput = stage.processedRows / (stage.wallTimeMillis / 1000);
            if (throughput < minThroughput) {
                minThroughput = throughput;
            }
            if (throughput > maxThroughput) {
                maxThroughput = throughput;
            }
        }

        // Ensure the 'result-set' class is applied to the container
        return (
            <div>
                {
                    // only return if there are columns
                    (columns && columns.length ? (
                        <div className="result-set">
                            {response.stats && this.isFinishedFailedOrCancelled(response.stats.state) && (
                                <ClearButton onClear={() => this.props.onClearResults(queryInfo?.id)} />
                            )}
                            <CopyLink copy={() => this.copy()} />
                            {/* if row count > 30 place in scrollable div */}
                            { this.renderTable(results, response, columns) }
                        </div>
                    ) : null)
                }
                {
                    (response && response.id ? (
                        <div className="link-to-query">
                            {this.getRowCount()} rows: <a href={`/ui/query.html?${response.id}`} target="_blank">
                                {response.id}
                            </a>
                        </div>
                    ) : null)
                }
                {
                    (errorMessage ? (
                        <ErrorBox errorMessage={errorMessage} errorContext="Results Viewer" />
                    ) : null)
                }
                {/* if the status is not finished, show spinner */}
                {response && response.stats && response.stats.state !== 'FINISHED' && response.stats.state !== 'FAILED' && response.stats.state !== 'CANCELLED' ? (
                    <div className="stats">
                        <div className="spacer">
                            <div className="status">
                                <div className="spinner"></div>
                                <div className="progress-percent">{response && response.stats && response.stats.runningPercentage ? Math.floor(response.stats.runningPercentage) : 0}%</div>
                                <div className="status-text">{response.stats.state}<br />Workers: {response.stats.nodes}, Running splits: {response.stats.runningSplits}, Total splits: {response.stats.totalSplits}, Run time: {Math.floor(response.stats.elapsedTimeMillis / 1000)}s</div>
                            </div>
                        </div>
                        <div className="spacer">
                            <div className="progress-bar-grid">
                                <ProgressBar progress={response && response.stats && response.stats.progressPercentage ? Math.floor(response.stats.progressPercentage) : 0} state={response && response.stats && response.stats.state ? response.stats.state : ''} />
                                <div className="progress-bar-timer">{this.formatMillisAsHHMMSS(response.stats.elapsedTimeMillis)}</div>
                            </div>
                        </div>
                        {/* if response.stats.subStages */}
                        {response.stats.rootStage && response.stats.rootStage.subStages ? (
                            <div>
                                <table className="query-status-table">
                                    <thead>
                                        <tr className="status-stage-category-header"> {/* groupings for subcategories of metrics */}
                                            <th colSpan={1}></th>
                                            <th colSpan={1}></th>
                                            <th colSpan={3} className="status-stage-category-header-rows">Rows</th>
                                            <th colSpan={4} className="status-stage-category-header-bytes">Bytes</th>
                                            <th colSpan={3} className="status-stage-category-header-splits">Splits</th>
                                        </tr>
                                        <tr>
                                            <th className="status-stage-default">Stage</th>
                                            <th className="status-stage-default">Nodes</th>
                                            <th className="status-stage-rows">Processed</th>
                                            <th className="status-stage-rows">Rate</th>
                                            <th className="status-stage-rows">Current Rate</th>
                                            <th className="status-stage-bytes">Processed</th>
                                            <th className="status-stage-bytes">Rate</th>
                                            <th className="status-stage-bytes">Current Rate</th>
                                            <th className="status-stage-bytes">Input Processed</th>
                                            <th className="status-stage-splits">Queued</th>
                                            <th className="status-stage-splits">Running</th>
                                            <th className="status-stage-splits">Done</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr key="root_stage_stages" className={response.stats.rootStage.state == 'RUNNING' ? 'stage-running' : 'stage-not-running'}>
                                            <td className="status-stage-default">0 (root)</td>
                                            <td className="status-stage-default">{response.stats.rootStage.nodes}</td>
                                            <td className="status-stage-rows">{this.rowCountToCorrectScale(response.stats.rootStage.processedRows)}</td>
                                            <td className="status-stage-rows">{this.rowCountToCorrectScale(response.stats.rootStage.processedRows / (response.stats.rootStage.wallTimeMillis / 1000))}</td>
                                            <td className="status-stage-rows"></td>
                                            <td className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.rootStage.processedBytes)}</td>
                                            <td className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.rootStage.processedBytes / (response.stats.wallTimeMillis / 1000))}</td>
                                            <td className="status-stage-bytes"></td>
                                            <th className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.rootStage.physicalInputBytes)}</th>
                                            <td className="status-stage-splits">{response.stats.rootStage.queuedSplits}</td>
                                            <td className="status-stage-splits">{response.stats.rootStage.runningSplits}</td>
                                            <td className="status-stage-splits">{response.stats.rootStage.completedSplits}</td>
                                        </tr>
                                        {/* look at all the substages in subStages */}
                                        {stages.map((subStageInfo: any) => {
                                            return (
                                                <tr key={response.id + "-" + subStageInfo.stage.stageId} className={subStageInfo.stage.state == 'RUNNING' ? 'stage-running' : 'stage-not-running'} >
                                                    <td className="status-stage-default">{subStageInfo.stage.stageId}</td>
                                                    <td className="status-stage-default">{subStageInfo.stage.nodes}</td>
                                                    <td className="status-stage-rows">{this.rowCountToCorrectScale(subStageInfo.stage.processedRows)}</td>
                                                    <td className="status-stage-rows">{this.rowCountToCorrectScale(subStageInfo.stage.processedRows / (subStageInfo.stage.wallTimeMillis / 1000))}</td>
                                                    <td className="status-stage-rows"></td>
                                                    <td className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.processedBytes)}</td>
                                                    <td className="status-stage-bytes">{this.bytesToCorrectScale(subStageInfo.stage.processedBytes / (subStageInfo.stage.wallTimeMillis / 1000))}</td>
                                                    <td className="status-stage-bytes"></td>
                                                    <th className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.physicalInputBytes)}</th>
                                                    <td className="status-stage-splits">{subStageInfo.stage.queuedSplits}</td>
                                                    <td className="status-stage-splits">{subStageInfo.stage.runningSplits}</td>
                                                    <td className="status-stage-splits">{subStageInfo.stage.completedSplits}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr key="results_all_stages" className='stage-running'>
                                            <td className="status-stage-default">Total</td>
                                            <td className="status-stage-default">{response.stats.nodes}</td>
                                            <td className="status-stage-rows">{this.rowCountToCorrectScale(response.stats.processedRows)}</td>
                                            <td className="status-stage-rows">{this.rowCountToCorrectScale(response.stats.processedRows / (response.stats.elapsedTimeMillis / 1000))}</td>
                                            <td className="status-stage-rows">{this.rowCountToCorrectScale(processedRowsSinceLast)}</td>
                                            <td className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.processedBytes)}</td>
                                            <td className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.processedBytes / (response.stats.elapsedTimeMillis / 1000))}</td>
                                            <td className="status-stage-bytes"></td>
                                            <th className="status-stage-bytes">{this.bytesToCorrectScale(response.stats.physicalInputBytes)}</th>
                                            <td className="status-stage-splits">{response.stats.queuedSplits}</td>
                                            <td className="status-stage-splits">{response.stats.runningSplits}</td>
                                            <td className="status-stage-splits">{response.stats.completedSplits}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default ResultSet;
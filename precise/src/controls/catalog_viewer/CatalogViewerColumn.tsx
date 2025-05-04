import React, { useState, useEffect } from 'react'
import Column from '../../schema/Column'
import TableReference from './../../schema/TableReference'
import CopyLink from './../../utils/CopyLink'
import { buildPath } from './ViewerState'
import './catalogviewer.css'

interface CatalogViewerColumnProps {
    tableRef: TableReference
    column: Column
    isExpanded: boolean
    isVisible: (path: string) => boolean
    onToggle: (path: string) => Promise<void>
}

const CatalogViewerColumn: React.FC<CatalogViewerColumnProps> = ({
    tableRef,
    column,
    isExpanded,
    isVisible,
    onToggle,
}) => {
    const [sampleValues, setSampleValues] = useState<string[]>([])
    const [isLoadingSamples, setIsLoadingSamples] = useState(false)
    const [showSamples, setShowSamples] = useState(false)

    const columnPath = buildPath.column(tableRef.catalogName, tableRef.schemaName, tableRef.tableName, column.getName())

    // Load sample values when samples are shown
    useEffect(() => {
        if (showSamples && sampleValues.length === 0 && !isLoadingSamples) {
            setIsLoadingSamples(true)
            column.getSampleValues(tableRef, (newSampleValues: string[]) => {
                setSampleValues(newSampleValues)
                setIsLoadingSamples(false)
            })
        }
    }, [showSamples, column, tableRef, sampleValues.length, isLoadingSamples])

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsLoadingSamples(true)
        column.getSampleValues(tableRef, (newSampleValues: string[]) => {
            setSampleValues(newSampleValues)
            setIsLoadingSamples(false)
        })
    }

    const handleToggle = async () => {
        // Toggle samples if already expanded
        if (isExpanded) {
            setShowSamples(!showSamples)
        } else {
            // Just expand the column initially
            await onToggle(columnPath)
            setShowSamples(true)
        }
    }

    const renderSampleValue = (value: string, index: number) => {
        if (value === null) {
            return (
                <div key={index} className="viewer_samplevalue" title="null">
                    NULL
                </div>
            )
        }

        const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value

        return (
            <div key={index} className="viewer_samplevalue" title={value}>
                {displayValue}
                <CopyLink copy={() => navigator.clipboard.writeText(value)} />
            </div>
        )
    }

    // Check visibility using the passed down helper
    if (!isVisible(columnPath)) {
        return null
    }

    return (
        <div className="column-section">
            <div className="column-header">
                {showSamples && (
                    <div className="reload-link-div" onClick={handleRefresh} title="Refresh sample values">
                        <div className={`refresh-icon ${isLoadingSamples ? 'spinning' : ''}`}>&#x27F3;</div>
                    </div>
                )}
                <div className="viewer_column" onClick={handleToggle}>
                    <span className="column-name">{column.getName()}</span>
                    <span className="columnType">{column.getType()}</span>
                    <span className="expand-indicator">{showSamples ? '▼' : '▶'}</span>
                </div>
                {column.getExtraOrComment() && (
                    <div className="columnExtraOrComment" title={column.getExtraOrComment()}>
                        {column.getExtraOrComment()}
                    </div>
                )}
            </div>

            {showSamples && (
                <div className="viewer_samplevalues_body">
                    <div className="sampleValuesTitle">
                        <span className="helper-text">Sample values:</span>
                    </div>
                    <div className="sampleValuesList">
                        {isLoadingSamples ? (
                            <div className="loading-message">Loading samples...</div>
                        ) : sampleValues.length === 0 ? (
                            <div className="empty-message">No sample values available</div>
                        ) : (
                            sampleValues.map((value, index) => renderSampleValue(value, index))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CatalogViewerColumn

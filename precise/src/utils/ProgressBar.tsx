import * as React from 'react'

// ProgressBar properties
interface ProgressBarProps {
    progress: number
    state: string
}

// ProgressBar state
interface ProgressBarState {}

export default class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState> {
    constructor(props: ProgressBarProps) {
        super(props)
        this.state = {
            progress: 0,
        }
    }

    render() {
        return (
            <div className="progress-bar">
                {this.props.progress === 0 && Number.isFinite(this.props.progress) ? (
                    <div className="progress-bar-running-state">{this.props.state}</div>
                ) : (
                    <div className="progress-bar-fill" style={{ width: this.props.progress + '%' }}>
                        {Math.round(this.props.progress) + '%'}
                    </div>
                )}
            </div>
        )
    }
}

import React, { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

interface ClearButtonProps {
    onClear: () => void
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear }) => {
    const [confirming, setConfirming] = useState(false)

    const handleClear = () => {
        if (!confirming) {
            setConfirming(true)
            setTimeout(() => setConfirming(false), 2000)
        } else {
            onClear()
            setConfirming(false)
        }
    }

    return (
        <div
            className={`result-action-button clear-result-table ${confirming ? 'confirmed' : ''}`}
            onClick={handleClear}
            title={confirming ? 'Click again to confirm' : 'Clear results'}
        >
            {confirming ? (
                <>
                    <AlertTriangle className="action-icon" size={16} />
                    <span className="action-text">Confirm</span>
                </>
            ) : (
                <>
                    <Trash2 className="action-icon" size={16} />
                    <span className="action-text">Clear</span>
                </>
            )}
        </div>
    )
}

export default ClearButton

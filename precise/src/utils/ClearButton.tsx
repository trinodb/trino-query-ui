import React, { useState } from 'react'
import { Button, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningIcon from '@mui/icons-material/Warning'

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
        <Tooltip title={confirming ? 'Click again to confirm' : 'Clear results'}>
            <Button
                variant={confirming ? 'contained' : 'outlined'}
                color={confirming ? 'error' : 'primary'}
                size="small"
                sx={(theme) => ({ borderRadius: `${theme.shape.borderRadius}px`, textTransform: 'none' })}
                startIcon={confirming ? <WarningIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
                onClick={handleClear}
            >
                {confirming ? 'Confirm' : 'Clear'}
            </Button>
        </Tooltip>
    )
}

export default ClearButton

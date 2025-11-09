import React, { useState } from 'react'
import { Button, Tooltip } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

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
                sx={{ fontSize: '0.5rem' }}
                startIcon={confirming ? <WarningAmberIcon fontSize="small" /> : <DeleteOutlineIcon fontSize="small" />}
                onClick={handleClear}
            >
                {confirming ? 'Confirm' : 'Clear'}
            </Button>
        </Tooltip>
    )
}

export default ClearButton

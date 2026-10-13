import React from 'react'
import { Button, Tooltip } from '@mui/material'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { MAX_RESULT_ROWS } from '../AsyncTrinoClient'

interface DownloadCsvButtonProps {
    download: () => void
}

const DownloadCsvButton: React.FC<DownloadCsvButtonProps> = ({ download }) => {
    return (
        <Tooltip title={`Download displayed rows as CSV (up to ${MAX_RESULT_ROWS.toLocaleString()})`}>
            <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontSize: '0.5rem' }}
                startIcon={<DownloadOutlinedIcon sx={{ fontSize: '0.5rem' }} />}
                onClick={download}
            >
                CSV
            </Button>
        </Tooltip>
    )
}

export default DownloadCsvButton

import React from 'react'
import { Button, Tooltip } from '@mui/material'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'

interface DownloadCsvButtonProps {
    download: () => void
}

const DownloadCsvButton: React.FC<DownloadCsvButtonProps> = ({ download }) => {
    return (
        <Tooltip title="Download as CSV">
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

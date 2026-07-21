import React from 'react'
import { Button, Tooltip } from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'

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
                sx={(theme) => ({ borderRadius: `${theme.shape.borderRadius}px`, textTransform: 'none' })}
                startIcon={<GetAppIcon fontSize="small" />}
                onClick={download}
            >
                CSV
            </Button>
        </Tooltip>
    )
}

export default DownloadCsvButton

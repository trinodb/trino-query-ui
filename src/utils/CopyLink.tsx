import React, { useState } from 'react'
import { Button, Tooltip } from '@mui/material'
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined'
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined'

interface CopyLinkProps {
    copy: () => void
}

const CopyLink: React.FC<CopyLinkProps> = ({ copy }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        copy()
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <Tooltip title="Copy to clipboard">
            <Button
                variant={copied ? 'contained' : 'outlined'}
                color={copied ? 'success' : 'primary'}
                size="small"
                sx={{ fontSize: '0.5rem' }}
                startIcon={
                    copied ? (
                        <DoneOutlinedIcon sx={{ fontSize: '0.5rem' }} />
                    ) : (
                        <CopyAllOutlinedIcon sx={{ fontSize: '0.5rem' }} />
                    )
                }
                onClick={handleCopy}
            >
                {copied ? 'Copied!' : 'Copy'}
            </Button>
        </Tooltip>
    )
}

export default CopyLink

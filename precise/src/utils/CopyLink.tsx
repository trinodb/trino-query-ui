import React, { useState } from 'react'
import { Button, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DoneIcon from '@mui/icons-material/Done'

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
                sx={(theme) => ({ borderRadius: `${theme.shape.borderRadius}px`, textTransform: 'none' })}
                startIcon={
                    copied ? (
                        <DoneIcon fontSize="small" />
                    ) : (
                        <ContentCopyIcon fontSize="small" />
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

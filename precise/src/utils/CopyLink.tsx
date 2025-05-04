import React, { useState } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

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
        <div
            className={`result-action-button copy-link ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <CheckCircle className="action-icon" size={16} />
                    <span className="action-text">Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="action-icon" size={16} />
                    <span className="action-text">Copy</span>
                </>
            )}
        </div>
    )
}

export default CopyLink

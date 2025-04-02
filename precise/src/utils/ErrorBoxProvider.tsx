import React, { useState } from 'react';
import CloseIcon from '../assets/close.png';
import './errorbox.css';

interface ErrorBoxProviderProps {
    errorMessage: string;
    errorContext: string;
}

const ErrorBox: React.FC<ErrorBoxProviderProps> = ({ errorMessage, errorContext }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [errorTimestamp] = useState(new Date().toISOString());  // Capture timestamp when error occurs

    if (!errorMessage || !isVisible) {
        return null;
    }

    return (
        <div className="error-box">
            <div className="error-box-header">
                <span>Error: {errorContext}</span>
                <div 
                    className="error-box-close"
                    onClick={() => setIsVisible(false)}
                    role="button"
                    aria-label="Close error message"
                >
                    <img 
                        src={CloseIcon}
                        alt="Close" 
                        width="16" 
                        height="16"
                    />
                </div>
            </div>
            <div className="error-box-body">
                <div className="error-box-message">
                    {errorMessage}
                    <div className="error-box-context">
                        {errorTimestamp}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorBox;
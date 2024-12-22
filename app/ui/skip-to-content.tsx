import React from "react";

interface SkipToContentProps {
    text?: string;
    href?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ text = "Skip to main content", href = "#main-content" }) => {
    return (
        <a href={href} className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-blue-600 focus:text-white focus:p-4 focus:z-50">
            {text}
        </a>
    );
};

export default SkipToContent;

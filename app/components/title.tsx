import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { useState } from "react";

interface TitleWithCopy {
    title?: string;
    children: React.ReactElement | React.ReactElement[];
    allowCopy?: boolean;
}

export const Title: React.FC<TitleWithCopy> = ({ title, children, allowCopy = true }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!title) {
            return;
        }
        navigator.clipboard.writeText(title).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        });
    };

    return (
        <div className="flex items-center">
            <h4 className="text-xl font-medium">{children}</h4>
            {allowCopy && (
                <button onClick={handleCopy} className="ml-2 text-gray-500 hover:text-gray-700">
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            )}
        </div>
    );
};

export default Title;

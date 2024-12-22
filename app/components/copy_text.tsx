import { Button } from "@ui/button";
import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { useState } from "react";

interface TitleWithCopy {
    text?: string;
    className?: string;
}

interface ButtonWithCopy {
    text?: string;
    [x: string]: any;
}

export const CopyText: React.FC<TitleWithCopy> = ({ text, className }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!text) {
            return;
        }
        navigator.clipboard.writeText(String(text)).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        });
    };

    return (
        <span className={"cursor-pointer" + (className ? " " + className : "")} onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
        </span>
    );
};
export const CopyTextButton: React.FC<ButtonWithCopy> = ({ text, children, ...rest }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.preventDefault();
        if (!text) {
            return;
        }
        navigator.clipboard.writeText(String(text)).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        });
    };

    return (
        <Button icon={copied ? <CheckIcon /> : <CopyIcon />} onClick={handleCopy} {...rest}>
            {children}
        </Button>
    );
};

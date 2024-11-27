import { Button } from "@carbon/react";
import { Checkmark, Copy, CopyFile } from "@carbon/icons-react";
import { SyntheticEvent, useState } from "react";

interface TitleWithCopy {
	text?: string;
	className?: string;
}

interface ButtonWithCopy {
	text?: string;
	[x: string]: any
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
			{copied ? <Checkmark /> : <Copy />}
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
		<Button  renderIcon={copied ? Checkmark : Copy} onClick={handleCopy} {...rest}>
			{children}
		</Button>
	);
};

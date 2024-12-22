import { XIcon } from "@primer/octicons-react";

export const AlertMessage = ({ message, type = "error", onClose }) => {
	if (!message || message.trim() == "") {
		return null;
	}
	return (
		<div className="w-full">
			<div className="inline-flex items-center px-2 py-1 text-xs text-red-500 bg-red-100 border border-red-300 border-solid ">
				{message}
				<button className="ml-2 text-xs text-red-500  hover:bg-red-200" onClick={onClose}>
					<XIcon />
				</button>
			</div>
		</div>
	);
};

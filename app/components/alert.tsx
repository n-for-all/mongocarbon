import { Close } from "@carbon/icons-react";

export const AlertMessage = ({ message, type = "error", onClose }) => {
	if (!message || message.trim() == "") {
		return null;
	}
	return (
		<div className="w-full">
			<div className="inline-flex items-center px-2 py-1 text-xs text-red-500 bg-red-100 border border-red-300 border-solid rounded-sm">
				{message}
				<button className="ml-2 text-xs text-red-500 rounded-sm hover:bg-red-200" onClick={onClose}>
					<Close />
				</button>
			</div>
		</div>
	);
};

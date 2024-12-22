import * as React from "react";
import { Alert, AlertTitle } from "./alert";
import { XIcon } from "@primer/octicons-react";
interface ActionableNotificationProps {
    title: string;
    subtitle?: string;
    closeOnEscape?: boolean;
    inline?: boolean;
    onClose: () => void;
    variant?: "success" | "error" | "warning" | "info" | "default";
}

const ActionableNotification: React.FC<ActionableNotificationProps> = ({ title, variant, subtitle, closeOnEscape = true, inline = true, onClose }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (closeOnEscape) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    onClose();
                }
            };
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [closeOnEscape, onClose]);

    return (
        <Alert ref={ref} className={"bg-white " + (inline ? "inline-block" : "block")} variant={variant}>
            <div className="flex items-start justify-between">
                <div>
                    <AlertTitle>{title}</AlertTitle>
                    {subtitle ? <p>{subtitle}</p> : null}
                </div>
                <button onClick={onClose} className="ml-4 -mt-1 -mr-2">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </Alert>
    );
};

export default ActionableNotification;

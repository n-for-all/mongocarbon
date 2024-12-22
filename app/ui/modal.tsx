import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

interface ModalProps {
    primaryButtonText?: string;
    secondaryButtonText?: string;
    open: boolean;
    danger?: boolean;
    loading?: boolean;
    loadingDescription?: string;
    modalHeading?: string;
    modalLabel?: string;
    onClose?: () => void;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
    closeOnEscape?: boolean;
    children?: any;
}

const Modal: React.FC<ModalProps> = ({
    open,
    modalHeading,
    modalLabel,
    closeOnEscape,
    primaryButtonText,
    secondaryButtonText,
    danger,
    loading,
    loadingDescription,
    onClose,
    onPrimaryClick,
    onSecondaryClick,
    children,
}) => {
    React.useEffect(() => {
        if (closeOnEscape && onClose) {
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
        <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
            <DialogContent className="p-0 bg-neutral-100">
                <div className="p-4">
                    <DialogHeader>
                        {modalLabel ? <DialogDescription>{modalLabel}</DialogDescription> : null}
                        {modalHeading ? <DialogTitle>{modalHeading}</DialogTitle> : null}
                    </DialogHeader>
                    <div className="py-6">{children}</div>
                </div>
                <DialogFooter className="gap-0 p-0">
                    {secondaryButtonText ? (
                        <Button variant="dark" className="justify-start flex-1 pt-6 pb-10 mr-px text-left rounded-none text-md" onClick={onSecondaryClick || onClose}>
                            {secondaryButtonText}
                        </Button>
                    ) : null}
                    {primaryButtonText ? (
                        <Button className="justify-start flex-1 pt-6 pb-10 text-left rounded-none text-md" loading={loading} onClick={onPrimaryClick} variant={danger ? "error" : "default"}>
                            {loading && loadingDescription ? loadingDescription : primaryButtonText}
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Modal;

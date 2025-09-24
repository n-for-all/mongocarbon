import React, { useRef, useState, useEffect } from "react";
import equal from "fast-deep-equal";
import { tokenize, themes } from "./utils";

interface JSONInputProps {
    theme?: string;
    value?: object | any[];
    colors?: {
        default?: string;
        string?: string;
        number?: string;
        colon?: string;
        keys?: string;
        keys_whiteSpace?: string;
        primitive?: string;
        error?: string;
        background?: string;
        background_warning?: string;
    };
    style?: {
        outerBox?: React.CSSProperties;
        innerBox?: React.CSSProperties;
        warningBox?: React.CSSProperties;
        body?: React.CSSProperties;
        labels?: React.CSSProperties;
    };
    error?: any;
    height?: string;
    width?: string;
    confirmGood?: boolean;
    onChange?: (data: { text: string; markup: string; json: string; jsObject: any; lines: number | boolean; error: any }) => void;
    onBlur?: (data: any) => void;
    viewOnly?: boolean;
    reset?: boolean;
    className?: string;
    inputClassName?: string;
}

const defaultTheme = themes.dark;

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const JSONInput: React.FC<JSONInputProps> = ({ value, ...props }) => {
    const refContent = useRef<HTMLSpanElement>(null);
    const refLabels = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<{
        prevValue: object | any[] | null;
        markup?: string;
        text?: string;
        json: string;
        jsObject?: any;
        lines?: number | boolean;
        error: any;
    }>({
        prevValue: null,
        markup: "",
        text: "",
        json: "",
        jsObject: undefined,
        lines: false as number | boolean,
        error: false as any,
    });

    // Derived props
    const theme = typeof props.theme === "string" && props.theme in themes ? themes[props.theme] : defaultTheme;
    const colors = { ...theme, ...props.colors };
    const style = {
        outerBox: {},
        container: {},
        warningBox: {},
        errorMessage: {},
        body: {},
        labelColumn: {},
        labels: {},
        contentBox: {},
        ...(props.style || {}),
    };
    const confirmGood = "confirmGood" in props ? props.confirmGood : true;
    const totalHeight = props.height || "auto";
    const totalWidth = props.width;
    const hasError = !!props.error || (state.error ? "token" in state.error : false);

    useEffect(() => {
        showValue();
    }, [value]);

    const showValue = () => {
        if (value === undefined || value === null) return;
        const unexpectedDataType = typeof value !== "object" && !Array.isArray(value);
        if (unexpectedDataType) {
            console.error("JSONInput: 'value' prop must be an object or array. Got '" + typeof value + "' instead.");
            return;
        }

        let componentShouldUpdate = !equal(value, state.prevValue);
        if (!componentShouldUpdate && props.reset) {
            if (state.jsObject !== undefined) componentShouldUpdate = !equal(value, state.jsObject);
        }
        if (!componentShouldUpdate) return;
        const data = tokenize(value, colors);
        setState((prev) => ({
            ...prev,
            prevValue: value,
            text: data?.indented,
            markup: data?.markup,
            lines: data?.lines,
            error: data?.error,
        }));
    };

    // Markup creation
    const createMarkup = (markup: string) => {
        if (markup === undefined) return { __html: "" };
        return { __html: "" + markup };
    };

    // Render labels
    const renderLabels = () => {
        const error = props.error || state.error;
        const errorLine = error ? error.line : -1;
        const lines = Number(state.lines ? state.lines : 1);
        let labels = new Array(lines);
        for (var i = 0; i < lines - 1; i++) labels[i] = i + 1;
        return labels.map((number, index) => {
            const color = number !== errorLine ? colors.default : "red";
            return (
                <div key={"label-" + index} className={index % 2 === 0 ? "" : ""} style={{ ...style.labels, color }}>
                    {number}
                </div>
            );
        });
    };

    const renderErrorMessage = () => {
        const error = props.error || state.error;
        if (!error) return null;
        return (
            <div className="p-1">
                <p
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-700 break-words whitespace-pre-wrap bg-red-100 border border-red-300 rounded-sm dark:bg-red-700 dark:border-red-700 dark:text-red-200 "
                    style={style.errorMessage}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M2.20164 18.4695L10.1643 4.00506C10.9021 2.66498 13.0979 2.66498 13.8357 4.00506L21.7984 18.4695C22.4443 19.6428 21.4598 21 19.9627 21H4.0373C2.54022 21 1.55571 19.6428 2.20164 18.4695Z"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path d="M12 9V13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 17.0195V17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    {error.reason || error.message || "Invalid JSON"}
                </p>
            </div>
        );
    };

    // Cursor position helpers
    const getCursorPosition = (countBR: number | false | null | undefined) => {
        const isChildOf = (node: any) => {
            while (node !== null) {
                if (node === refContent.current) return true;
                node = node.parentNode;
            }
            return false;
        };
        let selection = window.getSelection(),
            charCount = -1,
            linebreakCount = 0,
            node;
        if (selection && selection.focusNode && isChildOf(selection.focusNode)) {
            node = selection.focusNode;
            charCount = selection.focusOffset;
            while (node) {
                if (node === refContent.current) break;
                if (node.previousSibling) {
                    node = node.previousSibling;
                    if (countBR && node.nodeName === "BR") linebreakCount++;
                    charCount += node.textContent.length;
                } else {
                    node = node.parentNode;
                    if (node === null) break;
                }
            }
        }
        return charCount + linebreakCount;
    };

    const setCursorPosition = (nextPosition: number | false | null | undefined) => {
        if (nextPosition === false || nextPosition === null || nextPosition === undefined) return;
        const createRange = (node: any, chars: any, range?: any) => {
            if (!range) {
                range = document.createRange();
                range.selectNode(node);
                range.setStart(node, 0);
            }
            if (chars.count === 0) {
                range.setEnd(node, chars.count);
            } else if (node && chars.count > 0) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.length < chars.count) chars.count -= node.textContent.length;
                    else {
                        range.setEnd(node, chars.count);
                        chars.count = 0;
                    }
                } else
                    for (var lp = 0; lp < node.childNodes.length; lp++) {
                        range = createRange(node.childNodes[lp], chars, range);
                        if (chars.count === 0) break;
                    }
            }
            return range;
        };
        const setPosition = (chars: number) => {
            if (chars < 0) return;
            let selection = window.getSelection(),
                range = createRange(refContent.current, { count: chars });
            if (!range) return;
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        };
        if (nextPosition > 0) setPosition(nextPosition);
        else refContent.current?.focus();
    };

    const update = (cursorOffset = 0) => {
        const container = refContent.current;
        const data = tokenize(container, colors);
        if (!data || data?.error) {
            setState((prev) => ({ ...prev, error: data?.error }));
            return;
        }
        if ("onChange" in props && props.onChange) {
            props.onChange({
                text: data?.indented || "",
                markup: data?.markup,
                json: data?.json,
                jsObject: data?.jsObject,
                lines: data?.lines,
                error: data?.error,
            });
        }
        let cursorPosition = getCursorPosition(data.error?.line) + cursorOffset;
        setState({
            text: data.indented,
            markup: data.markup,
            json: data.json,
            jsObject: data.jsObject,
            lines: data.lines,
            error: data.error,
            prevValue: state.prevValue,
        });
        setTimeout(() => setCursorPosition(cursorPosition), 0);
    };

    // Event handlers
    const stopEvent = (event: any) => {
        if (!event) return;
        event.preventDefault();
        event.stopPropagation();
    };

    const onKeyUp = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        const ctrlOrMetaIsPressed = event.ctrlKey || event.metaKey;
        if (props.viewOnly && !ctrlOrMetaIsPressed) stopEvent(event);
        if (!ctrlOrMetaIsPressed) {
            // we need to debounce the update a bit
            debounce(() => {
                update();
            }, 300)();
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        const viewOnly = !!props.viewOnly;
        const ctrlOrMetaIsPressed = event.ctrlKey || event.metaKey;
        switch (event.key) {
            case "Tab":
                stopEvent(event);
                if (viewOnly) break;
                document.execCommand("insertText", false, "  ");
                break;
            case "Backspace":
            case "Delete":
                if (viewOnly) stopEvent(event);
                break;
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
                break;
            case "a":
            case "c":
                if (viewOnly && !ctrlOrMetaIsPressed) stopEvent(event);
                break;
            default:
                if (viewOnly) stopEvent(event);
                break;
        }
    };

    const onPaste = (event: React.ClipboardEvent<HTMLSpanElement>) => {
        if (props.viewOnly) {
            stopEvent(event);
        } else {
            event.preventDefault();
            var text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
        }
        update();
    };

    const onBlur = () => {
        const container = refContent.current;
        const data = tokenize(container, colors);
        if ("onBlur" in props && props.onBlur && data) {
            props.onBlur(data.json);
        }
    };

    const onScroll = (event: React.UIEvent<HTMLSpanElement>) => {
        if (refLabels.current) {
            refLabels.current.scrollTop = (event.target as HTMLElement).scrollTop;
        }
    };

    return (
        <div className={"box-border relative block m-0 " + (props.className || "")} style={{ height: totalHeight, width: totalWidth, overflow: "hidden", ...style.outerBox }}>
            {confirmGood ? (
                <div
                    className="absolute top-0 right-0 w-6 h-6 pointer-events-none transition duration-200 [transition-timing-function:cubic-bezier(0,1,0.5,1)] text-green-500 dark:text-green-400"
                    style={{ opacity: hasError ? 0 : 1, transform: "translate(-25%,25%)" }}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M10.5 15.25C10.307 15.2353 10.1276 15.1455 9.99998 15L6.99998 12C6.93314 11.8601 6.91133 11.7029 6.93756 11.55C6.96379 11.3971 7.03676 11.2562 7.14643 11.1465C7.2561 11.0368 7.39707 10.9638 7.54993 10.9376C7.70279 10.9114 7.86003 10.9332 7.99998 11L10.47 13.47L19 5.00004C19.1399 4.9332 19.2972 4.91139 19.45 4.93762C19.6029 4.96385 19.7439 5.03682 19.8535 5.14649C19.9632 5.25616 20.0362 5.39713 20.0624 5.54999C20.0886 5.70286 20.0668 5.86009 20 6.00004L11 15C10.8724 15.1455 10.6929 15.2353 10.5 15.25Z"
                            fill="currentColor"
                        />
                        <path
                            d="M12 21C10.3915 20.9974 8.813 20.5638 7.42891 19.7443C6.04481 18.9247 4.90566 17.7492 4.12999 16.34C3.54037 15.29 3.17596 14.1287 3.05999 12.93C2.87697 11.1721 3.2156 9.39921 4.03363 7.83249C4.85167 6.26578 6.1129 4.9746 7.65999 4.12003C8.71001 3.53041 9.87134 3.166 11.07 3.05003C12.2641 2.92157 13.4719 3.03725 14.62 3.39003C14.7224 3.4105 14.8195 3.45215 14.9049 3.51232C14.9903 3.57248 15.0622 3.64983 15.116 3.73941C15.1698 3.82898 15.2043 3.92881 15.2173 4.03249C15.2302 4.13616 15.2214 4.2414 15.1913 4.34146C15.1612 4.44152 15.1105 4.53419 15.0425 4.61352C14.9745 4.69286 14.8907 4.75712 14.7965 4.80217C14.7022 4.84723 14.5995 4.87209 14.4951 4.87516C14.3907 4.87824 14.2867 4.85946 14.19 4.82003C13.2186 4.52795 12.1987 4.43275 11.19 4.54003C10.193 4.64212 9.22694 4.94485 8.34999 5.43003C7.50512 5.89613 6.75813 6.52088 6.14999 7.27003C5.52385 8.03319 5.05628 8.91361 4.77467 9.85974C4.49307 10.8059 4.40308 11.7987 4.50999 12.78C4.61208 13.777 4.91482 14.7431 5.39999 15.62C5.86609 16.4649 6.49084 17.2119 7.23999 17.82C8.00315 18.4462 8.88357 18.9137 9.8297 19.1953C10.7758 19.4769 11.7686 19.5669 12.75 19.46C13.747 19.3579 14.713 19.0552 15.59 18.57C16.4349 18.1039 17.1818 17.4792 17.79 16.73C18.4161 15.9669 18.8837 15.0864 19.1653 14.1403C19.4469 13.1942 19.5369 12.2014 19.43 11.22C19.4201 11.1169 19.4307 11.0129 19.461 10.9139C19.4914 10.8149 19.5409 10.7228 19.6069 10.643C19.6728 10.5631 19.7538 10.497 19.8453 10.4485C19.9368 10.3999 20.0369 10.3699 20.14 10.36C20.2431 10.3502 20.3471 10.3607 20.4461 10.3911C20.5451 10.4214 20.6372 10.471 20.717 10.5369C20.7969 10.6028 20.863 10.6839 20.9115 10.7753C20.9601 10.8668 20.9901 10.9669 21 11.07C21.1821 12.829 20.842 14.6026 20.0221 16.1695C19.2022 17.7363 17.9389 19.0269 16.39 19.88C15.3288 20.4938 14.1495 20.8755 12.93 21C12.62 21 12.3 21 12 21Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
            ) : null}
            <div
                className="box-border block p-0 m-0"
                style={{
                    height: totalHeight,
                    width: totalWidth,
                    ...style.container,
                }}>
                <div
                    className="box-border relative flex m-0 overflow-hidden border-0 rounded-sm resize-none"
                    style={{
                        height: hasError ? "calc(100% - 3rem)" : "100%",
                        backgroundColor: colors.background,
                        ...style.body,
                    }}>
                    <span
                        ref={refLabels}
                        className="box-border inline-block w-10 h-full px-2 py-1 m-0 overflow-hidden text-gray-300 align-top border-r border-white/5"
                        style={style.labelColumn}>
                        {renderLabels()}
                    </span>
                    <span
                        ref={refContent}
                        contentEditable={!props.viewOnly}
                        style={style.contentBox}
                        className={
                            "box-border flex-1 inline-block h-full p-1 m-0 overflow-x-hidden overflow-y-auto text-gray-300 break-words whitespace-pre-line align-top outline-none " +
                            (props.inputClassName || "")
                        }
                        dangerouslySetInnerHTML={createMarkup(state.markup || "")}
                        onKeyUp={onKeyUp}
                        onKeyDown={onKeyDown}
                        onBlur={onBlur}
                        onScroll={onScroll}
                        onPaste={onPaste}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                </div>
            </div>
            <div className="absolute left-0 w-full pointer-events-none bottom-1">{renderErrorMessage()}</div>
        </div>
    );
};

export default JSONInput;

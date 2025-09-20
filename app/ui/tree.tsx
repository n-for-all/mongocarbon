import { TriangleDownIcon, TriangleRightIcon } from "@primer/octicons-react";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { cn, EnterKey, SpaceKey, matches, match, ArrowRightKey, ArrowLeftKey, ArrowUpKey, ArrowDownKey, HomeKey, EndKey } from "./lib/utils";

export type TreeViewProps = {
    /**
     * Specify the children of the TreeView
     */
    children?: React.ReactNode;
    /**
     * Specify an optional className to be applied to the TreeView
     */
    className?: string;
    /**
     * Specify whether or not the label should be hidden
     */
    hideLabel?: boolean;
    /**
     * Provide the label text that will be read by a screen reader
     */
    label: string;
    /**
     * **[Experimental]** Specify the selection mode of the tree.
     * If `multiselect` is `false` then only one node can be selected at a time
     */
    multiselect?: boolean;
    /**
     * **[Experimental]** Callback function that is called when any node is activated.
     * *This is only supported with the `enable-treeview-controllable` feature flag!*
     */
    onActivate?: (activated?: string | number) => void;
    /**
     * Callback function that is called when any node is selected
     */
    onSelect?: (
        event: React.SyntheticEvent<HTMLUListElement>,
        payload?: Partial<TreeNodeProps> & {
            activeNodeId?: string | number;
        }
    ) => void;
    /**
     * Array representing all selected node IDs in the tree
     */
    selected?: Array<string | number>;
    /**
     * Specify the size of the tree from a list of available sizes.
     */
    size?: "xs" | "sm";
} & Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect">;

type TreeViewComponent = {
    (props: TreeViewProps): JSX.Element;
    children?: typeof TreeNode;
};

const TreeView: TreeViewComponent = ({
    className,
    hideLabel = false,
    label,
    multiselect = false,
    onActivate,
    onSelect,
    selected,
    size = "sm",
    children,
    ...rest
}: TreeViewProps) => {
    const treeClasses = cn(className, `tree`, size ? `tree--${size}` : "");
    const treeRootRef = useRef<HTMLUListElement>(null);
    const treeWalker = useRef<TreeWalker>(treeRootRef?.current as unknown as TreeWalker);

    function resetNodeTabIndices() {
        Array.prototype.forEach.call(treeRootRef?.current?.querySelectorAll('[tabIndex="0"]') ?? [], (item) => {
            item.tabIndex = -1;
        });
    }

    function handleTreeSelect(event, node = {}) {
        const nodeId = (node as any).id;
        if (multiselect && (event.metaKey || event.ctrlKey)) {
            // if (!selected?.includes(nodeId)) {
            //     onSelect?.(event, { activeNodeId: nodeId, ...node });
            // } else {
            //     setSelected(selected.filter((selectedId) => selectedId !== nodeId));
            // }

            onSelect?.(event, node);
        } else {
            onSelect?.(event, { activeNodeId: nodeId, ...node });
        }
    }

    function handleFocusEvent(event) {
        if (event.type === "blur") {
            const { relatedTarget: currentFocusedNode, target: prevFocusedNode } = event;

            if (treeRootRef?.current?.contains(currentFocusedNode)) {
                prevFocusedNode.tabIndex = -1;
            }
        }
        if (event.type === "focus") {
            resetNodeTabIndices();
            const { relatedTarget: prevFocusedNode, target: currentFocusedNode } = event;

            if (treeRootRef?.current?.contains(prevFocusedNode)) {
                prevFocusedNode.tabIndex = -1;
            }
            currentFocusedNode.tabIndex = 0;
        }
    }

    let focusTarget = false;
    const nodesWithProps = children
        ? React.Children.map(children, (_node) => {
              const node = _node as React.ReactElement<TreeNodeProps>;
              const sharedNodeProps: Partial<TreeNodeProps> = {
                  depth: 0,
                  onNodeFocusEvent: handleFocusEvent,
                  onTreeSelect: handleTreeSelect,
                  tabIndex: (!node.props.disabled && -1) || undefined,
              };
              if (!focusTarget && !node.props.disabled) {
                  sharedNodeProps.tabIndex = 0;
                  focusTarget = true;
              }
              if (React.isValidElement(node)) {
                  return React.cloneElement(node, sharedNodeProps);
              }
          })
        : null;

    function handleKeyDown(event) {
        event.stopPropagation();
        if (matches(event, [ArrowUpKey, ArrowDownKey, HomeKey, EndKey, { code: "KeyA" }])) {
            event.preventDefault();
        }

        if (!treeWalker.current) {
            return;
        }

        treeWalker.current.currentNode = event.target;
        let nextFocusNode: Node | null = null;

        if (match(event, ArrowUpKey)) {
            nextFocusNode = treeWalker.current.previousNode();
        }
        if (match(event, ArrowDownKey)) {
            nextFocusNode = treeWalker.current.nextNode();
        }

        if (matches(event, [HomeKey, EndKey, { code: "KeyA" }])) {
            const nodeIds: string[] = [];

            if (matches(event, [HomeKey, EndKey])) {
                if (
                    multiselect &&
                    event.shiftKey &&
                    event.ctrlKey &&
                    treeWalker.current.currentNode instanceof Element &&
                    !treeWalker.current.currentNode.getAttribute("aria-disabled") &&
                    !treeWalker.current.currentNode.classList.contains(`hidden`)
                ) {
                    nodeIds.push(treeWalker.current.currentNode?.id);
                }
                while (match(event, HomeKey) ? treeWalker.current.previousNode() : treeWalker.current.nextNode()) {
                    nextFocusNode = treeWalker.current.currentNode;
                    if (
                        multiselect &&
                        event.shiftKey &&
                        event.ctrlKey &&
                        nextFocusNode instanceof Element &&
                        !nextFocusNode.getAttribute("aria-disabled") &&
                        !nextFocusNode.classList.contains(`hidden`)
                    ) {
                        nodeIds.push(nextFocusNode?.id);
                    }
                }
            }
            if (match(event, { code: "KeyA" }) && event.ctrlKey) {
                treeWalker.current.currentNode = treeWalker.current.root;

                while (treeWalker.current.nextNode()) {
                    if (
                        treeWalker.current.currentNode instanceof Element &&
                        !treeWalker.current.currentNode.getAttribute("aria-disabled") &&
                        !treeWalker.current.currentNode.classList.contains(`hidden`)
                    ) {
                        nodeIds.push(treeWalker.current.currentNode?.id);
                    }
                }
            }
            // setSelected(selected.concat(nodeIds));
        }
        if (nextFocusNode && nextFocusNode !== event.target) {
            resetNodeTabIndices();
            if (nextFocusNode instanceof HTMLElement) {
                nextFocusNode.tabIndex = 0;
                nextFocusNode.focus();
            }
        }
        rest?.onKeyDown?.(event);
    }
    useEffect(() => {
        treeWalker.current =
            treeWalker.current ??
            document.createTreeWalker(treeRootRef?.current as unknown as Node, NodeFilter.SHOW_ELEMENT, {
                acceptNode: function (node) {
                    if (!(node instanceof Element)) {
                        return NodeFilter.FILTER_SKIP;
                    }
                    if (node.classList.contains(`disabled`) || node.classList.contains(`hidden`)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (node.matches(`li.tree-node`)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                },
            });
    }, []);

    const TreeLabel = () => (!hideLabel ? <label className={`flex bg-red-400`}>{label}</label> : null);

    return (
        <>
            <TreeLabel />
            <ul
                {...rest}
                aria-label={hideLabel ? label : undefined}
                aria-multiselectable={multiselect || undefined}
                className={treeClasses}
                onKeyDown={handleKeyDown}
                ref={treeRootRef as unknown as React.RefObject<HTMLUListElement>}
                role="tree">
                {nodesWithProps}
            </ul>
        </>
    );
};

export type TreeNodeProps = {
    active?: boolean;
    /**
     * Specify the children of the TreeNode
     */
    children?: React.ReactNode;
    /**
     * Specify an optional className to be applied to the TreeNode
     */
    className?: string;
    /**
     * **[Experimental]** The default expansion state of the node.
     * *This is only supported with the `enable-treeview-controllable` feature flag!*
     */
    defaultIsExpanded?: boolean;
    /**
     * **Note:** this is controlled by the parent TreeView component, do not set manually.
     * TreeNode depth to determine spacing
     */
    depth?: number;
    /**
     * Specify if the TreeNode is disabled
     */
    disabled?: boolean;
    /**
     * Specify the TreeNode's ID. Must be unique in the DOM and is used for props.active and props.selected
     */
    id?: string;
    /**
     * Specify if the TreeNode is expanded (only applicable to parent nodes)
     */
    isExpanded?: boolean;
    /**
     * Rendered label for the TreeNode
     */
    label: React.ReactNode;
    /**
     * Callback function for when the node receives or loses focus
     */
    onNodeFocusEvent?: (event: React.FocusEvent<HTMLLIElement>) => void;
    /**
     * Callback function for when the node is selected
     */
    onSelect?: (event: React.MouseEvent, node?: TreeNodeProps) => void;
    /**
     * Callback function for when a parent node is expanded or collapsed
     */
    onToggle?: (event: React.MouseEvent, node?: TreeNodeProps) => void;
    /**
     * Callback function for when any node in the tree is selected
     */
    onTreeSelect?: (
        event: React.MouseEvent,
        node?: {
            label: TreeNodeProps["label"];
            value: TreeNodeProps["value"];
        }
    ) => void;
    /**
     * Optional prop to allow each node to have an associated icon.
     * Can be a React component class
     */
    icon?: React.ReactNode;
    /**
     * Specify the value of the TreeNode
     */
    value?: any;
} & Omit<React.LiHTMLAttributes<HTMLLIElement>, "onSelect">;

const TreeNode = React.forwardRef<HTMLLIElement, TreeNodeProps>(
    (
        {
            active,
            children,
            className,
            depth: propDepth,
            disabled,
            isExpanded,
            defaultIsExpanded,
            label,
            onNodeFocusEvent,
            onSelect: onNodeSelect,
            onToggle,
            onTreeSelect,
            icon,
            value,
            ...rest
        },
        forwardedRef
    ) => {
        // These are provided by the parent TreeView component
        const depth = propDepth as number;

        const currentNode = useRef<HTMLLIElement | null>(null);
        const currentNodeLabel = useRef<HTMLDivElement>(null);

        const setRefs = (element: HTMLLIElement | null) => {
            currentNode.current = element;
            if (typeof forwardedRef === "function") {
                forwardedRef(element);
            } else if (forwardedRef) {
                (forwardedRef as MutableRefObject<HTMLLIElement | null>).current = element;
            }
        };

        const nodesWithProps = React.Children.map(children, (node) => {
            if (React.isValidElement(node)) {
                return React.cloneElement(node, {
                    depth: depth + 1,
                    onTreeSelect,
                    tabIndex: (!node.props.disabled && -1) || null,
                } as TreeNodeProps);
            }
        });
        const treeNodeClasses = cn(
            " py-0",
            className,
            disabled ? "disabled opacity-50 cursor-not-allowed" : "",
            icon ? "with-icon" : "",
            !children ? "hover:bg-tree/10 cursor-pointer" : "py-0"
        );
        const treeLabelClasses = cn(
            active ? "border-l-4 border-solid border-primary bg-tree" : "border-l-4 border-solid border-transparent hover:bg-tree opacity-70"
        );
        const toggleClasses = isExpanded ? "rotate-90" : "";
        function handleToggleClick(event: React.MouseEvent<HTMLSpanElement>) {
            if (disabled) {
                return;
            }

            // Prevent the node from being selected
            event.stopPropagation();

            onToggle?.(event, { isExpanded: !isExpanded, label, value });
        }
        function handleClick(event: React.MouseEvent) {
            event.stopPropagation();
            if (!disabled) {
                onTreeSelect?.(event, { label, value });
                onNodeSelect?.(event, { label, value });
                rest?.onClick?.(event as React.MouseEvent<HTMLLIElement>);
            }
        }
        function handleKeyDown(event) {
            if (disabled) {
                return;
            }
            if (matches(event, [ArrowLeftKey, ArrowRightKey, EnterKey])) {
                event.stopPropagation();
            }
            if (match(event, ArrowLeftKey)) {
                const findParentTreeNode = (node: Element | null): Element | null => {
                    if (!node) return null;
                    if (node.classList.contains(`parent-node`)) {
                        return node;
                    }
                    if (node.classList.contains(`tree`)) {
                        return null;
                    }
                    return findParentTreeNode(node.parentElement);
                };
                if (children && isExpanded) {
                    onToggle?.(event, { isExpanded: false, label, value });
                } else {
                    /**
                     * When focus is on a leaf node or a closed parent node, move focus to
                     * its parent node (unless its depth is level 1)
                     */
                    const parentNode = findParentTreeNode(currentNode.current?.parentElement || null);
                    if (parentNode instanceof HTMLElement) {
                        parentNode.focus();
                    }
                }
            }
            if (children && match(event, ArrowRightKey)) {
                if (isExpanded) {
                    /**
                     * When focus is on an expanded parent node, move focus to the first
                     * child node
                     */
                    (currentNode.current?.lastChild?.firstChild as HTMLElement).focus();
                } else {
                    onToggle?.(event, { isExpanded: true, label, value });
                }
            }
            if (matches(event, [EnterKey, SpaceKey])) {
                event.preventDefault();
                handleClick(event);
            }
            rest?.onKeyDown?.(event);
        }
        function handleFocusEvent(event) {
            if (event.type === "blur") {
                rest?.onBlur?.(event);
            }
            if (event.type === "focus") {
                rest?.onFocus?.(event);
            }
            onNodeFocusEvent?.(event);
        }

        const treeNodeProps: React.LiHTMLAttributes<HTMLLIElement> = {
            ...rest,
            ["aria-current"]: (active as any) || undefined,
            ["aria-disabled"]: disabled,
            onBlur: handleFocusEvent,
            onClick: handleClick,
            onFocus: handleFocusEvent,
            onKeyDown: handleKeyDown,
            role: "treeitem",
        };

        let paddingLeft = depth ? `${depth}rem` : undefined;

        if (!children) {
            return (
                <li {...treeNodeProps} className={treeNodeClasses} ref={setRefs}>
                    <div style={{ paddingLeft }} className={"flex items-center gap-2 py-1 transition " + treeLabelClasses} ref={currentNodeLabel}>
                        {icon}
                        {label}
                    </div>
                </li>
            );
        }
        return (
            <li style={{ paddingLeft }} {...treeNodeProps} className={treeNodeClasses} aria-expanded={!!isExpanded} ref={setRefs}>
                <div className={"flex items-center transition cursor-pointer hover:bg-tree/10 " + treeLabelClasses} ref={currentNodeLabel}>
                    <span className="w-6 py-2 pl-3 pr-2 mr-2 -ml-2" onClick={handleToggleClick}>
                        <TriangleRightIcon className={"h-4 " + toggleClasses} />
                    </span>
                    <span className="flex items-center">
                        {icon}
                        {label}
                    </span>
                </div>
                <ul role="group" className={cn("flex flex-col pt-0 pb-2 py-px", !isExpanded ? "hidden" : "")}>
                    {nodesWithProps}
                </ul>
            </li>
        );
    }
);

export { TreeView, TreeNode };

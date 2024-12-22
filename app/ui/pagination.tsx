import React, { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";
import { cn, isArraysEqual } from "./lib/utils";
import { TriangleLeftIcon, TriangleRightIcon } from "@primer/octicons-react";

type ExcludedAttributes = "id" | "onChange";

export interface PaginationPageSize {
    text: string;
    value: number;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, ExcludedAttributes> {
    /**
     * The description for the backward icon.
     */
    backwardText?: string;

    /**
     * The CSS class names.
     */
    className?: string;

    /**
     * `true` if the backward/forward buttons, as well as the page select elements,  should be disabled.
     */
    disabled?: boolean;

    /**
     * The description for the forward icon.
     */
    forwardText?: string;

    /**
     * The unique ID of this component instance.
     */
    id?: string | number;

    // TODO: remove when v9 is deprecated
    /**
     * `true` if the current page should be the last page.
     */
    isLastPage?: boolean;

    /**
     * The function returning a translatable text showing where the current page is,
     * in a manner of the range of items.
     */
    itemRangeText?: (min: number, max: number, total: number) => string;

    /**
     * A variant of `itemRangeText`, used if the total number of items is unknown.
     */
    itemText?: (min: number, max: number) => string;

    /**
     * The translatable text indicating the number of items per page.
     */
    itemsPerPageText?: string;

    /**
     * The callback function called when the current page changes.
     */
    onChange?: (data: { page: number; pageSize: number; ref?: React.RefObject<any> }) => void;

    /**
     * The current page.
     */
    page?: number;

    /**
     * `true` if the select box to change the page should be disabled.
     */
    pageInputDisabled?: boolean;

    pageNumberText?: string;

    /**
     * A function returning PII showing where the current page is.
     */
    pageRangeText?: (current: number, total: number) => string;

    /**
     * The number dictating how many items a page contains.
     */
    pageSize?: number;

    /**
     * `true` if the select box to change the items per page should be disabled.
     */
    pageSizeInputDisabled?: boolean;

    /**
     * The choices for `pageSize`.
     */
    pageSizes: number[] | PaginationPageSize[];

    /**
     * The translatable text showing the current page.
     */
    pageText?: (page: number, pagesUnknown?: boolean) => string;

    /**
     * `true` if the total number of items is unknown.
     */
    pagesUnknown?: boolean;

    /**
     * Specify the size of the Pagination.
     */
    size?: "sm" | "md" | "lg";

    /**
     * The total number of items.
     */
    totalItems?: number;
}

function mapPageSizesToObject(sizes) {
    return typeof sizes[0] === "object" && sizes[0] !== null ? sizes : sizes.map((size) => ({ text: size, value: size }));
}

function renderSelectItems(total) {
    let counter = 1;
    const itemArr: React.ReactNode[] = [];
    while (counter <= total) {
        itemArr.push(
            <SelectItem key={counter} value={counter}>
                {String(counter)}
            </SelectItem>
        );
        counter++;
    }
    return itemArr;
}

function getPageSize(pageSizes, pageSize) {
    if (pageSize) {
        const hasSize = pageSizes.find((size) => {
            return pageSize === size.value;
        });

        if (hasSize) {
            return pageSize;
        }
    }
    return pageSizes[0].value;
}

const Pagination = React.forwardRef(function Pagination(
    {
        backwardText = "Previous page",
        className: customClassName = "",
        disabled = false,
        forwardText = "Next page",
        id,
        isLastPage = false,
        itemText = (min, max) => `${min}–${max} items`,
        itemRangeText = (min, max, total) => `${min}–${max} of ${total} items`,
        itemsPerPageText = "Items per page:",
        onChange,
        pageNumberText: _pageNumberText = "Page Number",
        pageRangeText = (_current, total) => `of ${total} ${total === 1 ? "page" : "pages"}`,
        page: controlledPage = 1,
        pageInputDisabled,
        pageSize: controlledPageSize,
        pageSizeInputDisabled,
        pageSizes: controlledPageSizes,
        pageText = (page) => `page ${page}`,
        pagesUnknown = false,
        size = "md",
        totalItems,
        ...rest
    }: PaginationProps,
    ref: React.Ref<HTMLDivElement>
) {
    const backBtnRef = useRef<HTMLButtonElement>(null);
    const forwardBtnRef = useRef<HTMLButtonElement>(null);
    const [pageSizes, setPageSizes] = useState(() => {
        return mapPageSizesToObject(controlledPageSizes);
    });
    const [prevPageSizes, setPrevPageSizes] = useState(controlledPageSizes);

    const [page, setPage] = useState(controlledPage);
    const [prevControlledPage, setPrevControlledPage] = useState(controlledPage);

    const [pageSize, setPageSize] = useState(() => {
        return getPageSize(pageSizes, controlledPageSize);
    });
    const [prevControlledPageSize, setPrevControlledPageSize] = useState(controlledPageSize);

    const className = cn("pagination bg-neutral-100 border-t border-solid border-neutral-300 flex items-center text-md justify-between", `pagination--${size}`, customClassName);
    const totalPages = totalItems ? Math.max(Math.ceil(totalItems / pageSize), 1) : 1;
    const backButtonDisabled = disabled || page === 1;
    const backButtonClasses = cn("flex p-1 w-10 items-center justify-center cursor-pointer hover:bg-neutral-100", backButtonDisabled ? "opacity-50 cursor-not-allowed" : "");
    const forwardButtonDisabled = disabled || (page === totalPages && !pagesUnknown);
    const forwardButtonClasses = cn(
        "flex p-1 items-center w-10 justify-center cursor-pointer hover:bg-neutral-100",
        forwardButtonDisabled || isLastPage ? "opacity-50 cursor-not-allowed" : ""
    );
    const selectItems = renderSelectItems(totalPages);

    // Sync state with props
    if (controlledPage !== prevControlledPage) {
        setPage(controlledPage);
        setPrevControlledPage(controlledPage);
    }

    if (controlledPageSize !== prevControlledPageSize) {
        setPageSize(getPageSize(pageSizes, controlledPageSize));
        setPrevControlledPageSize(controlledPageSize);
    }

    if (!isArraysEqual(controlledPageSizes, prevPageSizes)) {
        const pageSizes = mapPageSizesToObject(controlledPageSizes);

        const hasPageSize = pageSizes.find((size) => {
            return size.value === pageSize;
        });

        // Reset page to 1 if the current pageSize is not included in the new page
        // sizes
        if (!hasPageSize) {
            setPage(1);
        }

        setPageSizes(pageSizes);
        setPrevPageSizes(controlledPageSizes);
    }

    function handleSizeChange(value: string) {
        const pageSize = Number(value);
        const changes = {
            pageSize,
            page: 1,
        };

        setPage(changes.page);
        setPageSize(changes.pageSize);

        if (onChange) {
            onChange(changes);
        }
    }

    function handlePageInputChange(value) {
        const page = Number(value);
        if (page > 0 && totalItems && page <= Math.max(Math.ceil(totalItems / pageSize), 1)) {
            setPage(page);

            if (onChange) {
                onChange({
                    page,
                    pageSize,
                });
            }
        }
    }

    function incrementPage() {
        const nextPage = page + 1;
        setPage(nextPage);

        // when the increment button reaches the last page,
        // the icon button becomes disabled and the focus shifts to `main`
        // this presents an a11y problem for keyboard & screen reader users
        // instead, we want the focus to shift to the other pagination btn
        if (nextPage === totalPages && backBtnRef?.current) {
            backBtnRef.current.focus();
        }

        if (onChange) {
            onChange({
                page: nextPage,
                pageSize,
                ref: backBtnRef,
            });
        }
    }

    function decrementPage() {
        const nextPage = page - 1;
        setPage(nextPage);

        // when the decrement button reaches the first page,
        // the icon button becomes disabled and the focus shifts to `main`
        // this presents an a11y problem for keyboard & screen reader users
        // instead, we want the focus to shift to the other pagination btn
        if (nextPage === 1 && forwardBtnRef?.current) {
            forwardBtnRef.current.focus();
        }

        if (onChange) {
            onChange({
                page: nextPage,
                pageSize,
                ref: forwardBtnRef,
            });
        }
    }

    return (
        <div className={className} ref={ref} {...rest}>
            <div className={`flex gap-2 pl-4`}>
                <label className={`whitespace-nowrap flex items-center`}>{itemsPerPageText}</label>
                <Select
                    className={`select__item-count`}
                    labelText=""
                    hideLabel
                    noLabel
                    inline
                    onValueChange={handleSizeChange}
                    disabled={pageSizeInputDisabled || disabled}
                    value={pageSize}>
                    <SelectTrigger className={`border-0 shadow-none`}>{pageSize}</SelectTrigger>
                    <SelectContent>
                        {pageSizes.map((sizeObj) => (
                            <SelectItem key={sizeObj.value} value={sizeObj.value}>
                                {String(sizeObj.text)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="border-r border-solid border-neutral-300"></span>
                <span className={`whitespace-nowrap opacity-50 flex items-center pl-4`}>
                    {pagesUnknown || !totalItems
                        ? totalItems === 0
                            ? itemRangeText(0, 0, 0)
                            : itemText(pageSize * (page - 1) + 1, page * pageSize)
                        : itemRangeText(Math.min(pageSize * (page - 1) + 1, totalItems), Math.min(page * pageSize, totalItems), totalItems)}
                </span>
            </div>
            <span className="border-r border-solid border-neutral-300"></span>
            <div className={`flex whitespace-nowrap`}>
                <span className="border-r border-solid border-neutral-300"></span>
                {pagesUnknown ? (
                    <span className={`whitespace-nowrap flex items-center`}>{pageText(page)}</span>
                ) : (
                    <div className="flex gap-1 pr-4">
                        <Select
                            labelText={`Page of ${totalPages} pages`}
                            inline
                            hideLabel
                            onValueChange={handlePageInputChange}
                            value={page}
                            disabled={pageInputDisabled || disabled}>
                            <SelectTrigger className={`border-0 shadow-none`}>{page}</SelectTrigger>
                            <SelectContent>{selectItems}</SelectContent>
                        </Select>

                        <span className="flex items-center opacity-50">{pageRangeText(page, totalPages)}</span>
                    </div>
                )}
                <span className="border-r border-solid border-neutral-300"></span>
                <div className={`flex`}>
                    <span className={backButtonClasses} aria-label={backwardText} onClick={decrementPage} ref={backBtnRef}>
                        <TriangleLeftIcon />
                        <span className="sr-only">{backwardText}</span>
                    </span>
                    <span className="border-r border-solid border-neutral-300"></span>
                    <span className={forwardButtonClasses} aria-label={forwardText} onClick={incrementPage} ref={backBtnRef}>
                        <TriangleRightIcon />
                        <span className="sr-only">{forwardText}</span>
                    </span>
                </div>
            </div>
        </div>
    );
});

export { Pagination };

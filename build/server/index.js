import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable, createCookieSessionStorage, redirect } from '@remix-run/node';
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, useFetcher, Form, useLoaderData, useNavigate, useActionData, Link, redirect as redirect$1, useLocation } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import * as React from 'react';
import React__default, { useState, useEffect, useRef } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X, ChevronDown as ChevronDown$1, ChevronUp as ChevronUp$1, Check, PanelLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SearchIcon, XIcon, CheckIcon, CopyIcon, PlusIcon, TrashIcon, SortAscIcon, SortDescIcon, DatabaseIcon, ArrowRightIcon, PencilIcon, ChevronDownIcon, ChevronRightIcon, TriangleLeftIcon, TriangleRightIcon, ListUnorderedIcon, ServerIcon, VersionsIcon, SignOutIcon, ThreeBarsIcon, EyeIcon } from '@primer/octicons-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as dotenv from 'dotenv';
import path from 'node:path';
import appRoot from 'app-root-path';
import mongodb, { Timestamp, Binary } from 'mongodb';
import validator from 'validator';
import parser from 'mongodb-query-parser';
import { EJSON, ObjectId } from 'bson';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as SelectPrimitive from '@radix-ui/react-select';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import getCaretCoordinates from 'textarea-caret';
import scrollIntoView from 'scroll-into-view-if-needed';
import { CodeiumEditor } from '@codeium/react-code-editor/dist/esm/index.js';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

const entryServer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: 'Module' }));

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function matches(event, array) {
  for (let i = 0; i < array.length; i++) {
    if (match(event, array[i])) {
      return true;
    }
  }
  return false;
}
function match(eventOrCode, {
  key,
  which,
  keyCode,
  code
} = {}) {
  if (typeof eventOrCode === "string") {
    return eventOrCode === key;
  }
  if (typeof eventOrCode === "number") {
    return eventOrCode === which || eventOrCode === keyCode;
  }
  if (eventOrCode.key && Array.isArray(key)) {
    return key.indexOf(eventOrCode.key) !== -1;
  }
  return eventOrCode.key === key || eventOrCode.which === which || eventOrCode.keyCode === keyCode || eventOrCode.code === code;
}
const isArraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
const EnterKey = {
  key: "Enter",
  which: 13,
  keyCode: 13,
  code: "Enter"
};
const SpaceKey = {
  key: " ",
  which: 32,
  keyCode: 32,
  code: "Space"
};
const ArrowLeftKey = {
  key: "ArrowLeft",
  which: 37,
  keyCode: 37,
  code: "ArrowLeft"
};
const ArrowUpKey = {
  key: "ArrowUp",
  which: 38,
  keyCode: 38,
  code: "ArrowUp"
};
const ArrowRightKey = {
  key: "ArrowRight",
  which: 39,
  keyCode: 39,
  code: "ArrowRight"
};
const ArrowDownKey = {
  key: "ArrowDown",
  which: 40,
  keyCode: 40,
  code: "ArrowDown"
};
const HomeKey = {
  key: "Home",
  which: 36,
  keyCode: 36,
  code: "Numpad7"
};
const EndKey = {
  key: "End",
  which: 35,
  keyCode: 35,
  code: "Numpad1"
};

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    ToastPrimitives.Viewport,
    {
      ref,
      className: cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className),
      ...props
    }
  )
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden  border p-4 pr-6 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        error: "error group border-error bg-error text-error-foreground",
        warning: "warning group border-warning bg-warning text-warning-foreground",
        success: "success group border-success bg-success text-success-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    ToastPrimitives.Action,
    {
      ref,
      className: cn(
        "inline-flex h-8 shrink-0 items-center justify-center  border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.error]:border-muted/40 group-[.error]:hover:border-error/30 group-[.error]:hover:bg-error group-[.error]:hover:text-error-foreground group-[.error]:focus:ring-error",
        className
      ),
      ...props
    }
  )
);
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    ToastPrimitives.Close,
    {
      ref,
      className: cn(
        "absolute right-1 top-1  p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.error]:text-red-300 group-[.error]:hover:text-red-50 group-[.error]:focus:ring-red-400 group-[.error]:focus:ring-offset-red-600",
        className
      ),
      "toast-close": "",
      ...props,
      children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
    }
  )
);
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold [&+div]:text-xs", className), ...props })
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props })
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}

const links = () => [
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg"
  }
];
function Layout$2({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {}),
      /* @__PURE__ */ jsx(Toaster, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}

const route0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Layout: Layout$2,
  default: App,
  links
}, Symbol.toStringTag, { value: 'Module' }));

const NativeInput = React.forwardRef(({ className, type, invalid, invalidClassName, ...props }, ref) => {
  let additionClassName = "";
  if (invalid) {
    additionClassName = invalidClassName || "border-red-500 bg-red-200";
  }
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      className: cn(
        "flex h-9 w-full border-b border-black bg-white px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
        additionClassName
      ),
      ref,
      ...props
    }
  );
});
const Input = React.forwardRef(({ invalidText, helperText, hideLabel, labelText, containerClassName, ...props }, ref) => {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1", containerClassName), children: [
    labelText && !hideLabel ? /* @__PURE__ */ jsx("label", { className: "text-sm tracking-wide", children: labelText }) : null,
    /* @__PURE__ */ jsx(NativeInput, { ...props }),
    invalidText ? /* @__PURE__ */ jsx("small", { className: "text-red-500", children: invalidText }) : null,
    helperText ? /* @__PURE__ */ jsx("small", { className: "text-xs text-black opacity-50", children: helperText }) : null
  ] });
});
const SearchInput = ({ className, value, onChange, ...props }) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
    /* @__PURE__ */ jsx(SearchIcon, { className: "absolute left-3 text-muted-foreground" }),
    /* @__PURE__ */ jsx(NativeInput, { type: "text", value, onChange: (e) => onChange(e.target.value), className: cn("pl-10 pr-4 min-w-48", className), ...props }),
    value && value != "" && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: (e) => {
          e.preventDefault();
          onChange("");
        },
        className: "absolute right-3 text-muted-foreground",
        children: /* @__PURE__ */ jsx(XIcon, {})
      }
    )
  ] });
};

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      ref,
      className: cn(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      ),
      ...props
    }
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        ref,
        className: cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 bg-background p-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[calc(100%_-_4rem)] mt-4 mb-4 overflow-auto",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
            /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] })
);
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col-reverse sm:flex-row", className), ...props });
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Title, { ref, className: cn("text-lg leading-none tracking-wide", className), ...props })
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, { ref, className: cn("text-sm opacity-60 text-muted-foreground", className), ...props })
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = ({ children, content, delayDuration, open, defaultOpen, showArrow, "data-state": dataState, onOpenChange, className, ...props }) => {
  if (!content) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(TooltipPrimitive.Root, { delayDuration, "data-state": dataState || "instant-open", defaultOpen, onOpenChange, children: [
    /* @__PURE__ */ jsx(TooltipPrimitive.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxs(
      TooltipPrimitive.Content,
      {
        className: cn(
          "z-50 overflow-hidden  bg-tooltip px-3 py-1.5 text-xs text-tooltip-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        ),
        ...props,
        children: [
          content,
          showArrow && /* @__PURE__ */ jsx(TooltipPrimitive.Arrow, { width: 11, height: 5 })
        ]
      }
    )
  ] }) });
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap hover:cursor-pointer text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        danger: "bg-error text-error-foreground hover:bg-error/90",
        error: "bg-error text-error-foreground hover:bg-error/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        dark: "bg-neutral-700 text-white hover:bg-neutral-800",
        ghost: "hover:bg-neutral-100 hover:text-neutral-800",
        link: "text-primary underline-offset-4 hover:underline",
        none: ""
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-9  px-3 text-sm",
        md: "h-10  px-4",
        xs: "h-8  px-3 text-xs",
        lg: "h-10  px-8",
        icon: "h-9 w-9"
      },
      iconPosition: {
        left: "flex-row",
        right: "flex-row-reverse"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, hasIconOnly, tooltipAlignment, tooltipPosition, iconPosition, as, to, href, variant, icon, size, asChild = false, tooltip, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : href || to || as == "a" ? "a" : "button";
    let loader = null;
    if (loading) {
      let loaderSize = "";
      switch (size) {
        case "sm":
          loaderSize = "h-4 w-4";
          break;
        case "lg":
          loaderSize = "h-6 w-6";
          break;
        default:
          loaderSize = "h-5 w-5";
      }
      loader = /* @__PURE__ */ jsx("span", { className: "animate-spin border-t-2 border-b-2 border-white rounded-full " + loaderSize });
    } else {
      loader = icon ? /* @__PURE__ */ jsx("span", { className: hasIconOnly ? "" : iconPosition == "right" ? "ml-4" : "mr-4", children: icon }) : null;
    }
    const linkTo = href || to;
    return /* @__PURE__ */ jsx(Tooltip, { content: tooltip, side: tooltipPosition, align: tooltipAlignment, open: !!tooltip, children: /* @__PURE__ */ jsxs(Comp, { className: cn(buttonVariants({ variant, size, className, iconPosition })), ref, ...props, href: linkTo, children: [
      loader,
      children
    ] }) });
  }
);
Button.displayName = "Button";
const ButtonSkeleton = ({ variant = "default", size = "default", className }) => {
  return /* @__PURE__ */ jsx("div", { className: cn("inline-block w-32 h-10 bg-gray-300  animate-pulse", buttonVariants({ variant, size, className })) });
};

const Modal = ({
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
  children
}) => {
  React.useEffect(() => {
    if (closeOnEscape && onClose) {
      const handleKeyDown = (event) => {
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (open2) => !open2 && onClose && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "p-0 bg-neutral-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        modalLabel ? /* @__PURE__ */ jsx(DialogDescription, { children: modalLabel }) : null,
        modalHeading ? /* @__PURE__ */ jsx(DialogTitle, { children: modalHeading }) : null
      ] }),
      /* @__PURE__ */ jsx("div", { className: "py-6", children })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-0 p-0", children: [
      secondaryButtonText ? /* @__PURE__ */ jsx(Button, { variant: "dark", className: "justify-start flex-1 pt-6 pb-10 mr-px text-left rounded-none text-md", onClick: onSecondaryClick || onClose, children: secondaryButtonText }) : null,
      primaryButtonText ? /* @__PURE__ */ jsx(Button, { className: "justify-start flex-1 pt-6 pb-10 text-left rounded-none text-md", loading, onClick: onPrimaryClick, variant: danger ? "error" : "default", children: loading && loadingDescription ? loadingDescription : primaryButtonText }) : null
    ] })
  ] }) });
};

const CollectionAddModal = ({ dbName, open, onClose, onSuccess }) => {
  const [state, setState] = useState({ collectionName: "" });
  const [errors, setErrors] = useState({});
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription("Created!");
      toast({
        title: "Connected!",
        description: fetcher.data.message || "Connected!",
        type: "background"
      });
      setTimeout(() => {
        onSuccess(dbName, state.collectionName.trim());
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      setErrors(fetcher.data.errors || {});
      toast({
        title: "Error",
        description: fetcher.data.message || "An error occurred",
        type: "background"
      });
    }
  }, [fetcher.data]);
  const [description, setDescription] = useState("Creating...");
  const submit = async () => {
    fetcher.submit(
      {
        create: state
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/database/${dbName}`
      }
    );
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      onPrimaryClick: submit,
      loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
      loadingDescription: description,
      modalHeading: "Create a new collection",
      modalLabel: "Collection",
      primaryButtonText: "Create",
      secondaryButtonText: "Cancel",
      children: /* @__PURE__ */ jsx(Form, { "aria-label": "Collection form", autoComplete: "new-password", children: /* @__PURE__ */ jsx(
        Input,
        {
          id: "collectionName",
          labelText: "Collection Name",
          autoComplete: "new-password",
          type: "text",
          required: true,
          invalid: errors["collectionName"],
          invalidText: errors["collectionName"],
          helperText: "Enter the name of the collection you want to create",
          value: state.collectionName,
          onChange: (e) => {
            setState({ ...state, collectionName: e.target.value });
          }
        }
      ) })
    }
  ) });
};
const CollectionDeleteModal = ({ open, onClose, onSuccess, dbName, collectionName }) => {
  const fetcher = useFetcher();
  const [status, setStatus] = useState("inactive");
  const [description, setDescription] = useState("Deleting...");
  const [confirmName, setConfirmName] = useState("");
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription("Deleted!");
      setStatus("finished");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      setStatus("error");
      setTimeout(() => {
        setStatus("inactive");
        setDescription("Deleting...");
      }, 2e3);
    }
  }, [fetcher.data]);
  const submitDelete = async () => {
    if (confirmName != collectionName) {
      setErrors({ collectionName: "The name does not match the collection name" });
      return;
    }
    setStatus("active");
    fetcher.submit(
      {
        delete: { collectionName }
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/database/${dbName}`
      }
    );
  };
  if (!collectionName || collectionName == "") return null;
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      open,
      danger: true,
      loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
      loadingDescription: description,
      modalHeading: "Drop Collection",
      modalLabel: "Collection",
      primaryButtonText: "Yes",
      secondaryButtonText: "No",
      onClose,
      onPrimaryClick: submitDelete,
      children: [
        /* @__PURE__ */ jsxs("h3", { children: [
          "Are you sure you want to delete the collection ",
          /* @__PURE__ */ jsxs("b", { children: [
            '"',
            collectionName,
            '"'
          ] }),
          "?"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-4 text-xs", children: "Deleting a collection will delete all documents in the collection and this action cannot be undone" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            type: "text",
            labelText: "Type the name of the collection to confirm",
            autoComplete: "new-password",
            required: true,
            placeholder: collectionName,
            invalid: !!errors["collectionName"],
            invalidText: errors["collectionName"],
            value: confirmName,
            onChange: (e) => {
              setErrors({});
              setConfirmName(e.target.value);
            }
          }
        )
      ]
    }
  );
};

const DatabaseAddModal = ({ open, onClose, onSuccess }) => {
  const [state, setState] = useState({ dbName: "", collectionName: "" });
  const [errors, setErrors] = useState({});
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription("Created!");
      toast({
        title: "Database Created!",
        type: "background"
      });
      setTimeout(() => {
        onSuccess(state.dbName.trim(), state.collectionName.trim());
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      setErrors(fetcher.data.errors || {});
      toast({
        title: "Error",
        description: fetcher.data.message || "An error occurred",
        type: "background"
      });
    }
  }, [fetcher.data]);
  const [description, setDescription] = useState("Creating...");
  const submit = async () => {
    fetcher.submit(
      {
        create: state
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/database`
      }
    );
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      onPrimaryClick: submit,
      loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
      loadingDescription: description,
      modalHeading: "Create a new database",
      modalLabel: "Database",
      primaryButtonText: "Create",
      secondaryButtonText: "Cancel",
      children: /* @__PURE__ */ jsx(Form, { "aria-label": "Database form", autoComplete: "new-password", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            labelText: "Database Name",
            type: "text",
            autoComplete: "new-password",
            required: true,
            invalid: errors["dbName"],
            invalidText: errors["dbName"],
            helperText: "Enter a name for this database",
            value: state.dbName,
            onChange: (e) => {
              setState({ ...state, dbName: e.target.value });
            }
          }
        ),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "collectionName",
              labelText: "Collection Name",
              autoComplete: "new-password",
              type: "text",
              required: true,
              invalid: errors["collectionName"],
              invalidText: errors["collectionName"],
              helperText: "You need to add a collection to create the database",
              value: state.collectionName,
              onChange: (e) => {
                setState({ ...state, collectionName: e.target.value });
              }
            }
          ),
          /* @__PURE__ */ jsxs("small", { className: "block mt-4 mb-4 text-sm", children: [
            /* @__PURE__ */ jsx("b", { children: "*" }),
            "MongoDb will only create a database if a collection is added.",
            /* @__PURE__ */ jsx(
              "a",
              {
                className: "ml-2 text-sm text-blue-600 hover:underline",
                target: "_blank",
                href: "https://www.mongodb.com/resources/products/fundamentals/create-database",
                children: "Learn More"
              }
            )
          ] })
        ] })
      ] }) })
    }
  ) });
};
const DatabaseDeleteModal = ({ open, onClose, onSuccess, name }) => {
  const fetcher = useFetcher();
  const [description, setDescription] = useState("Deleting...");
  const [confirmName, setConfirmName] = useState("");
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription("Deleted!");
      toast({
        title: "Database Deleted!",
        type: "background"
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      toast({
        title: "Error",
        description: fetcher.data.message || "An error occurred",
        type: "background"
      });
      setTimeout(() => {
        setDescription("Deleting...");
      }, 2e3);
    }
  }, [fetcher.data]);
  const submitDelete = async () => {
    if (confirmName != name) {
      setErrors({ name: "The name does not match the database name" });
      return;
    }
    fetcher.submit(
      {
        delete: { name }
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/database`
      }
    );
  };
  if (!name || name == "") return null;
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      open,
      danger: true,
      loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
      loadingDescription: description,
      modalHeading: "Drop Database",
      modalLabel: "Database",
      primaryButtonText: "Yes",
      secondaryButtonText: "No",
      onClose,
      onPrimaryClick: submitDelete,
      children: [
        /* @__PURE__ */ jsxs("h3", { children: [
          "Are you sure you want to drop the database ",
          /* @__PURE__ */ jsxs("b", { children: [
            '"',
            name,
            '"'
          ] }),
          "?"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-4 text-xs", children: "Dropping a database will delete all collections and documents in the database and this action cannot be undone" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            labelText: "Type the name of the database to confirm",
            type: "text",
            autoComplete: "new-password",
            required: true,
            placeholder: name,
            invalid: !!errors["confirmName"],
            invalidText: errors["confirmName"],
            value: confirmName,
            onChange: (e) => {
              setErrors(() => ({}));
              setConfirmName(e.target.value);
            }
          }
        )
      ]
    }
  );
};

const Title = ({ title, children, allowCopy = true }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!title) {
      return;
    }
    navigator.clipboard.writeText(title).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1e3);
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-xl font-medium", children }),
    allowCopy && /* @__PURE__ */ jsx("button", { onClick: handleCopy, className: "ml-2 text-gray-500 hover:text-gray-700", children: copied ? /* @__PURE__ */ jsx(CheckIcon, {}) : /* @__PURE__ */ jsx(CopyIcon, {}) })
  ] });
};

const envPath = path.join(appRoot.toString(), ".env");
dotenv.config({ path: envPath });
function getBoolean(str, defaultValue = false) {
  return str ? str.toLowerCase() === "true" : defaultValue;
}
const config = {
  options: {
    gridFSEnabled: getBoolean(process.env.GRIDFS_ENABLED, true)
  }
};

const mongodbOperators = [
  "$eq",
  "$gt",
  "$gte",
  "$in",
  "$lt",
  "$lte",
  "$ne",
  "$nin",
  "$and",
  "$not",
  "$nor",
  "$or",
  "$exists",
  "$type",
  "$expr",
  "$jsonSchema",
  "$mod",
  "$regex",
  "$text",
  "$where",
  "$geoIntersects",
  "$geoWithin",
  "$near",
  "$nearSphere",
  "$all",
  "$elemMatch",
  "$size",
  "$bitsAllClear",
  "$bitsAllSet",
  "$bitsAnyClear",
  "$bitsAnySet"
];
function validateUsername(username) {
  if (!isUsername(username)) {
    return `Usernames must be at least 3 characters long and no spaces included`;
  }
}
function validatePassword(password) {
  const { isStrongPassword } = validator;
  if (!isStrongPassword(password, {
    minLength: 6
  })) {
    return "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
}
const convertBytes = function(input) {
  if (typeof input == "undefined") {
    return "";
  }
  input = Number.parseInt(input, 10);
  if (Number.isNaN(input)) {
    return "0 Bytes";
  }
  if (input < 1024) {
    return input.toString() + " Bytes";
  }
  if (input < 1024 * 1024) {
    input = Math.round(input / 1024 * 100) / 100;
    return input.toString() + " KB";
  }
  if (input < 1024 * 1024 * 1024) {
    input = Math.round(input / (1024 * 1024) * 100) / 100;
    return input.toString() + " MB";
  }
  if (input < 1024 * 1024 * 1024 * 1024) {
    input = Math.round(input / (1024 * 1024 * 1024) * 100) / 100;
    return input.toString() + " GB";
  }
  if (input < 1024 * 1024 * 1024 * 1024 * 1024) {
    input = Math.round(input / (1024 * 1024 * 1024 * 1024) * 100) / 100;
    return input.toString() + " TB";
  }
  return input.toString() + " Bytes";
};
const numberWithCommas = (x) => {
  if (isNumber(x)) {
    return x?.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x;
  }
};
const validateMongoConnectionString = (connectionString) => {
  if (connectionString.startsWith("mongodb://") || connectionString.startsWith("mongodb+srv://")) {
    return true;
  }
  return false;
};
const isNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
const bytesToSize = function bytesToSize2(bytes) {
  if (bytes === 0) return "0 Byte";
  const k = 1e3;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / k ** i).toPrecision(3) + " " + sizes[i];
};
const colsToGrid = function(cols) {
  const rets = {};
  for (const key in cols) {
    rets[key] = cols[key].constructor.name === "Array" ? cols[key].filter((col) => col.toString().slice(-6) === ".files" && [col.toString().slice(0, -6) + ".chunks"].filter((value) => cols[key].includes(value))).map((col) => col.toString().slice(0, -6)).sort() : [];
  }
  return rets;
};
const isValidDatabaseName = function(name) {
  if (!name || name.length > 63) {
    return false;
  }
  if (/[ "$*./:<>?|]/.test(name)) {
    return false;
  }
  return true;
};
const isValidCollectionName = function(name) {
  if (name === void 0 || name.length === 0) {
    return false;
  }
  if (!/^[/A-Z_a-z-][\w./-]*$/.test(name)) {
    return false;
  }
  return true;
};
const isUsername = (username) => {
  if (validator.isEmpty(username) || username.length <= 3) {
    return false;
  } else if (!validator.matches(username, "^[a-zA-Z0-9_.-@]*$")) {
    return false;
  }
  return true;
};

const convertMongoTimestamp = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.t * 1e3);
  }
  if (timestamp && timestamp.$timestamp) {
    const seconds = parseInt(timestamp.$timestamp.substring(0, 10), 10);
    return new Date(seconds * 1e3);
  }
  return null;
};
const toBSON = parser.toBSON;
const parseEJSON = EJSON.parse;
const parseObjectId = function(string) {
  if (/^[\da-f]{24}$/i.test(string)) {
    return ObjectId.createFromHexString(string);
  }
  if (string instanceof ObjectId) {
    return string;
  }
  return ObjectId.createFromHexString(String(string));
};
const toJsonString = function(doc) {
  return EJSON.stringify(EJSON.serialize(doc));
};

const ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set(["text/csv", "application/json"]);
const converters = {
  // If type == J, convert value as json document
  J(value) {
    return JSON.parse(value);
  },
  // If type == N, convert value to number
  N(value) {
    return Number(value);
  },
  // If type == O, convert value to ObjectId
  O(value) {
    return parseObjectId(value);
  },
  // If type == R, convert to RegExp
  R(value) {
    return new RegExp(value, "i");
  },
  U(value) {
    return new Binary(Buffer.from(value.replaceAll("-", ""), "hex"), Binary.SUBTYPE_UUID);
  },
  // if type == S, no conversion done
  S(value) {
    return value;
  }
};
class Collection {
  allowDiskUse;
  config;
  collection;
  collectionName;
  db;
  constructor(connectionData, dbName, collectionName, config, allowDiskUse = true) {
    this.config = config;
    this.allowDiskUse = allowDiskUse;
    this.db = connectionData.getClient()?.db(dbName);
    this.collection = connectionData.getClient()?.db(dbName).collection(collectionName);
    this.collectionName = collectionName;
  }
  /*
   * Builds the Mongo query corresponding to the
   * Simple/Advanced parameters input.
   * Returns {} if no query parameters were passed in request.
   */
  _getQuery = (query) => {
    const { key } = query;
    let { value } = query;
    if (key && value) {
      const type = query.type?.toUpperCase();
      if (!(type in converters)) {
        throw new Error("Invalid query type: " + type);
      }
      value = converters[type](value);
      return { [key]: value };
    }
    const { query: jsonQuery } = query;
    return jsonQuery || {};
  };
  _getSort = (query) => {
    const { sort } = query;
    if (sort) {
      const outSort = {};
      for (const i in sort) {
        outSort[i] = Number.parseInt(sort[i], 10);
      }
      return outSort;
    }
    return {};
  };
  _getProjection = (query) => {
    const { projection } = query;
    if (projection) {
      return toBSON(projection) ?? {};
    }
    return {};
  };
  _getQueryOptions = (query) => {
    return {
      sort: this._getSort(query),
      limit: Number.parseInt(query.limit, 10) || 10,
      skip: query.skip ? Number.parseInt(query.skip, 10) || 0 : 0,
      projection: this._getProjection(query)
    };
  };
  _getAggregatePipeline = (pipeline, queryOptions) => {
    return [
      ...pipeline,
      ...Object.keys(queryOptions.sort).length > 0 ? [
        {
          $sort: queryOptions.sort
        }
      ] : [],
      {
        $facet: {
          count: [{ $count: "count" }],
          items: [
            { $skip: queryOptions.skip },
            { $limit: queryOptions.limit + queryOptions.skip },
            ...Object.keys(queryOptions.projection).length > 0 ? [
              {
                $project: queryOptions.projection
              }
            ] : []
          ]
        }
      }
    ];
  };
  _getItemsAndCount = async (itemQuery, queryOptions) => {
    let query = this._getQuery(itemQuery);
    if (itemQuery.runAggregate === "on" && query.constructor.name === "Array") {
      if (query.length > 0) {
        const queryAggregate = this._getAggregatePipeline(query, queryOptions);
        const [resultArray] = await this.collection.aggregate(queryAggregate, { allowDiskUse: this.allowDiskUse }).toArray();
        const { items: items2, count: count2 } = resultArray;
        return {
          items: items2,
          count: count2.at(0)?.count
        };
      }
      query = {};
    }
    const [items, count] = await Promise.all([
      this.collection.find(query, { ...queryOptions, allowDiskUse: this.allowDiskUse }).toArray(),
      this.collection.countDocuments(query)
    ]);
    return {
      items,
      count
    };
  };
  viewCollection = async (query) => {
    const queryOptions = this._getQueryOptions(query);
    const { items, count } = await this._getItemsAndCount(query, queryOptions);
    const [stats, indexes] = await Promise.all([
      this.collection.aggregate([
        {
          $collStats: {
            latencyStats: { histograms: true },
            storageStats: {},
            count: {},
            queryExecStats: {}
          }
        }
      ]).next(),
      this.collection.indexes()
    ]);
    const { indexSizes } = stats?.storageStats;
    for (let n = 0, nn = indexes.length; n < nn; n++) {
      if (indexes[n].name) {
        indexes[n].size = indexSizes[indexes[n].name];
      }
    }
    const docs = [];
    const columns = [];
    for (const i in items) {
      docs[i] = items[i];
      columns.push(Object.keys(items[i]));
    }
    const { limit, skip, sort } = queryOptions;
    const pagination = count > limit;
    const ctx = {
      title: this.collectionName,
      docs,
      columns: columns.flat().filter((value, index, arr) => arr.indexOf(value) === index),
      // All used columns
      count,
      stats,
      limit,
      skip,
      sort,
      pagination,
      key: query.key,
      value: query.value,
      type: query.type,
      query: query.query,
      projection: query.projection,
      runAggregate: query.runAggregate === "on",
      indexes
    };
    return ctx;
  };
  // findDocuments = async (query: { [x: string]: any }) => {
  // 	const queryOptions = this._getQueryOptions(query);
  // 	this._getItemsAndCount(query, queryOptions);
  // 	return await this.collection!.find(this._getQuery(query), queryOptions).toArray();
  // };
  getColumns = async () => {
    const results = await this.collection.aggregate([
      { $project: { keys: { $objectToArray: "$$ROOT" } } },
      { $unwind: "$keys" },
      { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } }
    ]).next();
    return results ? results.allKeys : [];
  };
  compactCollection = async () => {
    return await this.db.command({ compact: this.collectionName });
  };
  exportCollection = async (documentQuery) => {
    const query = this._getQuery(documentQuery);
    const queryOptions = {
      sort: this._getSort(documentQuery),
      projection: this._getProjection(documentQuery)
    };
    return await this.collection.find(query, queryOptions);
  };
  exportColArray = async (documentQuery) => {
    return new Promise((resolve, reject) => {
      try {
        const query = this._getQuery(documentQuery);
        const queryOptions = {
          sort: this._getSort(documentQuery),
          projection: this._getProjection(documentQuery)
        };
        this.collection.find(query, queryOptions).toArray().then((items) => {
          resolve(toJsonString(items));
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  exportCsv = async (documentQuery) => {
    return this.exportColArray(documentQuery);
  };
  reIndex = async () => {
    return new Promise((resolve, reject) => {
      if (typeof this.collection.reIndex === "function") {
        this.collection.reIndex().then(() => {
          resolve(true);
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject(new Error("ReIndex is not supported on this version on mongodb"));
      }
    });
  };
  addIndex = async (index) => {
    const doc = index;
    if (doc === void 0 || doc.length === 0) {
      throw new Error("Please enter a valid index!");
    }
    const docBSON = doc;
    return await this.collection.createIndex(docBSON);
  };
  createCollection = async (collectionName) => {
    const valid = isValidCollectionName(collectionName);
    if (!valid) {
      throw new Error("Invalid collection name");
    }
    return await this.db.createCollection(collectionName);
  };
  deleteCollection = async () => {
    return await this.collection.drop();
  };
  deleteDocuments = async (documentQuery) => {
    const query = this._getQuery(documentQuery);
    return await this.collection.deleteMany(query);
  };
  renameCollection = async (newName) => {
    const valid = isValidCollectionName(newName);
    if (!valid) {
      throw new Error("Invalid collection name");
    }
    return await this.collection.rename(newName);
  };
  dropIndex = async (indexName) => {
    if (!indexName) {
      throw new Error("The index you are deleting is invalid!");
    }
    return await this.collection.dropIndex(indexName);
  };
  importCollection = async (files) => {
    const areInvalidFiles = files.some((file) => !ALLOWED_MIME_TYPES.has(file.mimetype) || !file.data || !file.data.toString);
    if (areInvalidFiles) {
      throw new Error("Some of the files are invalid, Importing is aborted");
    }
    const docs = [];
    for (const file of files) {
      const fileContent = file.data.toString("utf8");
      const lines = fileContent.split("\n").map((line) => line.trim()).filter(Boolean);
      for (const line of lines) {
        const parsedData = parseEJSON(line);
        docs.push(...parsedData);
      }
    }
    return await this.collection.insertMany(docs);
  };
}

class Database {
  config;
  connectionData;
  constructor(connectionData, config) {
    this.config = config;
    this.connectionData = connectionData;
  }
  getStats = async (dbOName) => {
    const listDatabases = await this.connectionData.getDatabases();
    let dbName = "";
    let found = listDatabases.some((db) => {
      if (dbOName == db) {
        dbName = db;
        return true;
      }
    });
    if (!found) {
      throw new Error("Database not found");
    }
    const data = await this.connectionData.getClient()?.db(dbName).stats();
    const collections = await this.connectionData.getClient()?.db(dbName).collections();
    if (data) {
      let collectionList = [];
      if (collections) {
        const collectionListStats = await Promise.allSettled(
          collections.map((c) => {
            return Promise.allSettled([
              Promise.resolve(c),
              c.aggregate([
                {
                  $collStats: {
                    latencyStats: { histograms: true },
                    storageStats: {},
                    count: {},
                    queryExecStats: {}
                  }
                }
              ]).next(),
              c.indexes(),
              c.countDocuments()
            ]);
          })
        );
        collectionList = collectionListStats.map((result) => {
          if (result.status == "fulfilled") {
            const [col, stats, indexes, count] = result.value;
            return {
              name: col.status == "fulfilled" ? col.value.collectionName : "N/A",
              count: count.status == "fulfilled" ? count.value : 0,
              indexes: indexes.status == "fulfilled" ? indexes.value : [],
              stats: stats.status == "fulfilled" ? stats.value : void 0
            };
          } else {
            return {
              name: "N/A",
              count: 0,
              indexes: [],
              storageSize: void 0
            };
          }
        });
      }
      return {
        name: data.db,
        fsUsedSize: data.fsUsedSize,
        fsTotalSize: data.fsTotalSize,
        operationTime: convertMongoTimestamp(data.operationTime),
        clusterTime: convertMongoTimestamp(data.$clusterTime?.clusterTime),
        views: data.views,
        avgObjSize: bytesToSize(data.avgObjSize || 0),
        collections: data.collections,
        collectionList,
        dataFileVersion: data.dataFileVersion && data.dataFileVersion.major && data.dataFileVersion.minor ? data.dataFileVersion.major + "." + data.dataFileVersion.minor : null,
        dataSize: bytesToSize(data.dataSize),
        extentFreeListNum: data.extentFreeList && data.extentFreeList.num ? data.extentFreeList.num : null,
        fileSize: data.fileSize === void 0 ? null : bytesToSize(data.fileSize),
        indexes: data.indexes,
        indexSize: bytesToSize(data.indexSize),
        numExtents: data.numExtents ? data.numExtents.toString() : null,
        objects: data.objects,
        storageSize: bytesToSize(data.storageSize)
      };
    }
    return null;
  };
  createDatabase = async (dbName, collectionName) => {
    if (!isValidDatabaseName(dbName)) {
      return Promise.reject(new Error(`The database name "${dbName} is invalid`));
    }
    const ndb = this.connectionData.getClient()?.db(dbName);
    return await ndb?.createCollection(collectionName);
  };
  deleteDatabase = async (dbName) => {
    const ndb = this.connectionData.getClient()?.db(dbName);
    return await ndb?.dropDatabase();
  };
}

class MongoDbConnection {
  mainClient;
  config;
  constructor(config) {
    this.config = config;
  }
  init = async () => {
    const { connectionString, name } = this.config;
    const options = {
      maxPoolSize: this.config.maxPoolSize,
      tls: this.config.tls,
      tlsAllowInvalidCertificates: this.config.tlsAllowInvalidCertificates,
      tlsCAFile: this.config.tlsCAFile,
      tlsCertificateKeyFile: this.config.tlsCertificateKeyFile,
      tlsCertificateKeyFilePassword: this.config.tlsCertificateKeyFilePassword
    };
    try {
      const client = await mongodb.MongoClient.connect(connectionString, options);
      const adminDb = client.db().admin();
      this.mainClient = {
        connectionName: name,
        client,
        adminDb,
        info: {
          whitelist: this.config.whitelist.trim().split(",").filter(Boolean),
          blacklist: this.config.blacklist.trim().split(",").filter(Boolean)
        }
      };
    } catch (error) {
      console.error(`Could not connect to database using connectionString: ${connectionString.replace(/(mongo.*?:\/\/.*?:).*?@/, "$1****@")}"`);
      throw error;
    }
  };
  getClient() {
    return this.mainClient?.client;
  }
  getCollections = async ({ dbName }) => {
    const collections = await this.mainClient?.client.db(dbName).listCollections().toArray();
    return collections;
  };
  getDatabasesWithDetails = async () => {
    if (!this.mainClient?.adminDb) {
      return {
        databases: [],
        ok: 0
      };
    }
    return await this.mainClient?.adminDb.listDatabases();
  };
  getDatabases = async () => {
    const databases = [];
    if (this.mainClient?.adminDb) {
      const whitelist = this.mainClient?.info.whitelist;
      const blacklist = this.mainClient?.info.blacklist;
      const allDbs = await this.mainClient.adminDb.listDatabases();
      for (let i = 0; i < allDbs.databases.length; ++i) {
        const dbName = allDbs.databases[i].name;
        if (dbName) {
          if (whitelist.length > 0 && !whitelist.includes(dbName)) {
            continue;
          }
          if (blacklist.length > 0 && blacklist.includes(dbName)) {
            continue;
          }
          databases.push(dbName);
        }
      }
    } else {
      const dbConnection = this.mainClient?.client.db();
      const dbName = dbConnection?.databaseName;
      if (dbName) {
        databases.push(dbName);
      }
    }
    return databases;
  };
}
const connect = async (config) => {
  const connectionData = new MongoDbConnection(config);
  await connectionData.init();
  return connectionData;
};

const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props })
);
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
    AccordionPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronDown$1, { className: "w-4 h-4 transition-transform duration-200 shrink-0 text-muted-foreground" })
      ]
    }
  ) })
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Content, { ref, className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", ...props, children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children }) })
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const alertVariants = cva(
  "relative w-full  border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        error: "border-error/50 text-error dark:border-error [&>svg]:text-error",
        success: "border-success/50 text-success-600 dark:border-success-600 [&>svg]:text-success-600",
        warning: "border-warning/50 text-warning-600 dark:border-warning-600 [&>svg]:text-warning-600",
        info: "border-info/50 text-info-600 dark:border-info-600 [&>svg]:text-info-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, role: "alert", className: cn(alertVariants({ variant }), className), ...props }));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("h5", { ref, className: cn("mb-1 font-medium leading-none tracking-tight", className), ...props }));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("text-sm [&_p]:leading-relaxed", className), ...props }));
AlertDescription.displayName = "AlertDescription";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex h-9 w-full cursor-pointer items-center justify-between whitespace-nowrap  border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown$1, { className: "w-4 h-4 opacity-50" }) })
      ]
    }
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.ScrollUpButton, { ref, className: cn("flex cursor-default items-center justify-center py-1", className), ...props, children: /* @__PURE__ */ jsx(ChevronUp$1, { className: "w-4 h-4" }) })
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.ScrollDownButton, { ref, className: cn("flex cursor-default items-center justify-center py-1", className), ...props, children: /* @__PURE__ */ jsx(ChevronDown$1, { className: "w-4 h-4" }) })
);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      ref,
      className: cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden  border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(SelectPrimitive.Viewport, { className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"), children }),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) })
);
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Label, { ref, className: cn("px-2 py-1.5 text-sm font-semibold", className), ...props })
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      ref,
      className: cn(
        "relative flex w-full cursor-pointer select-none items-center  py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props })
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const Table = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx("table", { ref, className: cn("w-full caption-bottom", className), ...props }) }));
Table.displayName = "Table";
const TableHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", { ref, className: cn("", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tbody", { ref, className: cn("", className), ...props }));
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tfoot", { ref, className: cn("border-t bg-muted/50 font-medium", className), ...props }));
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tr", { ref, className: cn("border-b transition-colors hover:bg-muted/50", className), ...props }));
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("th", { ref, className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className), ...props }));
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("td", { ref, className: cn("px-4 py-2 align-middle", className), ...props }));
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }));
TableCaption.displayName = "TableCaption";

let userDb;
if (process.env.NODE_ENV === "production") {
  userDb = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  userDb = global.__db;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
function cleanupUser(user) {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    username: user.username
  };
}
async function requireUser(request, redirectToIfNotAvaliable) {
  const userId = await requireUserId(request, redirectToIfNotAvaliable);
  if (!userId) {
    return null;
  }
  const user = await userDb.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }
  return cleanupUser(user);
}
async function getUserDbConnection(userId, id) {
  return await userDb.dbConnection.findUnique({ where: { userId, id } });
}
async function getUserDbConnections(userId) {
  return await userDb.dbConnection.findMany({ where: { userId } });
}
async function updatePassword(userId, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return await userDb.user.update({ where: { id: userId }, data: { passwordHash } });
}
async function addUserDbConnection(userId, connection) {
  return await userDb.dbConnection.create({
    data: {
      ...connection,
      userId
    }
  });
}
async function removeUserDbConnection(userId, connectionId) {
  return await userDb.dbConnection.delete({ where: { userId, id: connectionId } });
}
async function updateUserDbConnection(userId, connectionId, connection) {
  return await userDb.dbConnection.update({
    where: { id: connectionId, userId },
    data: {
      ...connection
    }
  });
}
const cookie = {
  name: "mongocarbon_session",
  secure: typeof process.env.SECURE_COOKIE != "undefined" ? !!(process.env.SECURE_COOKIE == "1") : process.env.NODE_ENV === "production",
  secrets: [sessionSecret],
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true
};
const storage = createCookieSessionStorage({
  cookie
});
const commitSession = storage.commitSession;
function checkUserSession(request) {
  const url = new URL(request.url);
  const scheme = url.protocol.replace(":", "");
  if (scheme === "http" && cookie.secure) {
    throw new Error("Secure cookies cannot be used on HTTP connections, it is either you set SECURE_COOKIE=0 in your .env file or use https connection.");
  }
}
async function createUserSession(userId, redirectTo) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });
}
function getUserSession(request) {
  return storage.getSession(request.headers.get("Cookie"));
}
async function getUserId(request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}
async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    if (["", "/", "/login"].includes(redirectTo)) {
      throw redirect(`/login`);
    }
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}
async function register({ username, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userDb.user.create({
    data: { username, passwordHash }
  });
  return { id: user.id, username };
}
async function login({ username, password }) {
  const user = await userDb.user.findUnique({
    where: { username }
  });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return { id: user.id, username };
}
async function logout(request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session)
    }
  });
}

const loader$9 = async ({ request, params }) => {
  if (!params.db) {
    return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
  }
  const session = await getUserSession(request);
  const connection = session.get("connection");
  let mongo;
  try {
    mongo = await connect(connection);
    const database = new Database(mongo, config);
    const stats = await database.getStats(params.db);
    return Response.json(
      { status: "success", stats },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return Response.json({ status: "error", error: error.message }, { status: 500 });
  }
};
const validate$2 = ({ collectionName }) => {
  const errors = {};
  if (!collectionName || collectionName.trim() == "" || !isValidCollectionName(collectionName)) {
    errors["collectionName"] = "The collection name is invalid";
  }
  return errors;
};
const action$7 = async ({ request, params }) => {
  try {
    if (!params.db) {
      return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
    }
    const dbName = params.db;
    const jsonQuery = await request.json();
    if (!jsonQuery) {
      return Response.json({ status: "error", message: "Invalid submission" }, { status: 500 });
    }
    if (jsonQuery.create) {
      const errors = validate$2(jsonQuery.create);
      if (Object.keys(errors).length > 0) {
        return Response.json({ status: "error", message: "Please specify a valid name for the collection to be created", errors }, { status: 500 });
      }
      const { collectionName } = jsonQuery.create;
      const session = await getUserSession(request);
      const connection = session.get("connection");
      let mongo;
      mongo = await connect(connection);
      const collection = new Collection(mongo, dbName, collectionName, config, connection.allowDiskUse);
      await collection.createCollection(collectionName);
      return Response.json({ status: "success", message: "Collection is created" }, { status: 200 });
    } else if (jsonQuery.delete) {
      const { collectionName } = jsonQuery.delete;
      if (!collectionName || typeof collectionName != "string" || !isValidCollectionName(collectionName)) {
        return Response.json({ status: "error", message: "Invalid collection" }, { status: 500 });
      }
      const session = await getUserSession(request);
      const connection = session.get("connection");
      let mongo;
      mongo = await connect(connection);
      const collection = new Collection(mongo, dbName, collectionName, config, connection.allowDiskUse);
      await collection.deleteCollection();
      return Response.json({ status: "success", message: "Collection is deleted" }, { status: 200 });
    }
  } catch (e) {
    return Response.json({ status: "error", message: e.message }, { status: 500 });
  }
};
var sortingSelect$1 = /* @__PURE__ */ ((sortingSelect2) => {
  sortingSelect2["name"] = "Name";
  sortingSelect2["documents"] = "Documents";
  sortingSelect2["document-size"] = "Avg. Document Size";
  sortingSelect2["storage-size"] = "Storage Size";
  sortingSelect2["indexes"] = "Indexes";
  sortingSelect2["index-size"] = "Total Index Size";
  return sortingSelect2;
})(sortingSelect$1 || {});
function DatabasePage$1() {
  const loaderData = useLoaderData();
  const [sort, setSort] = useState("");
  const [direction, setDirection] = useState("asc");
  const [isDelete, setIsDelete] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  const [collectionDelete, setCollectionDelete] = useState(null);
  const stats = loaderData?.stats;
  if (loaderData?.error) {
    return /* @__PURE__ */ jsxs(Alert, { children: [
      /* @__PURE__ */ jsx(AlertTitle, { children: "An error occurred while fetching the collection stats." }),
      /* @__PURE__ */ jsx(AlertDescription, { children: loaderData.error })
    ] });
  }
  if (!stats) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  let totalDocuments = 0;
  switch (sort) {
    case "name":
      if (direction == "desc") {
        stats.collectionList.sort((a, b) => b.name.localeCompare(a.name));
      } else {
        stats.collectionList.sort((a, b) => a.name.localeCompare(b.name));
      }
      break;
    case "documents":
      if (direction == "desc") {
        stats.collectionList.sort((a, b) => b.count - a.count);
      } else {
        stats.collectionList.sort((a, b) => a.count - b.count);
      }
      break;
    case "document-size":
      if (direction == "desc") {
        stats.collectionList.sort((b, a) => {
          const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
          const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
          return avgDocumentSizeA - avgDocumentSizeB;
        });
      } else {
        stats.collectionList.sort((a, b) => {
          const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
          const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
          return avgDocumentSizeA - avgDocumentSizeB;
        });
      }
      break;
    case "storage-size":
      if (direction == "desc") {
        stats.collectionList.sort((b, a) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
      } else {
        stats.collectionList.sort((a, b) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
      }
      break;
    case "indexes":
      if (direction == "desc") {
        stats.collectionList.sort((b, a) => a.indexes.length - b.indexes.length);
      } else {
        stats.collectionList.sort((a, b) => b.indexes.length - a.indexes.length);
      }
      break;
    case "index-size":
      if (direction == "desc") {
        stats.collectionList.sort((b, a) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
      } else {
        stats.collectionList.sort((a, b) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
      }
      break;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "database-page", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pb-4 lg:flex-nowrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Title, { title: stats.name, children: [
            /* @__PURE__ */ jsx("span", { className: "font-normal opacity-50", children: "Database:" }),
            " ",
            stats.name
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-4 text-sm", children: [
            "Collections: ",
            stats.collections,
            ", Documents: ",
            totalDocuments
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                iconPosition: "right",
                icon: /* @__PURE__ */ jsx(PlusIcon, {}),
                onClick: (e) => {
                  e.preventDefault();
                  setIsAdd(true);
                },
                children: "Create Collection"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "error",
                icon: /* @__PURE__ */ jsx(TrashIcon, {}),
                onClick: (e) => {
                  e.preventDefault();
                  setIsDelete(true);
                },
                children: "Drop Database"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            SearchInput,
            {
              placeholder: "Find a collection",
              id: "search-collection",
              value: search,
              className: "w-32 min-w-md bg-neutral-100",
              onChange: (value) => {
                setSearch(value);
              }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Sort:" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              onValueChange: (value) => {
                setSort(value);
              },
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: sort == "" ? "---" : sortingSelect$1[sort] }) }),
                /* @__PURE__ */ jsx(SelectContent, { className: "bg-white", children: Object.keys(sortingSelect$1).map((key) => {
                  return /* @__PURE__ */ jsx(SelectItem, { value: key, children: sortingSelect$1[key] }, key);
                }) })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              hasIconOnly: true,
              variant: "ghost",
              tooltip: "Sort Direction",
              icon: direction == "asc" ? /* @__PURE__ */ jsx(SortAscIcon, {}) : /* @__PURE__ */ jsx(SortDescIcon, {}),
              onClick: (e) => {
                e.preventDefault();
                setDirection(direction == "asc" ? "desc" : "asc");
              }
            }
          )
        ] })
      ] }),
      stats.collectionList.map((collection, index) => {
        if (search && search.trim() != "" && !(collection.name.toLowerCase().indexOf(search.toLowerCase()) == 0)) {
          return null;
        }
        const avgDocumentSize = collection.stats.storageStats?.storageSize / collection.count;
        return /* @__PURE__ */ jsxs("div", { className: "mb-3 bg-neutral-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-base border-b border-solid border-neutral-200", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(DatabaseIcon, {}),
              " ",
              /* @__PURE__ */ jsx("strong", { children: collection.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "error",
                  icon: /* @__PURE__ */ jsx(TrashIcon, {}),
                  size: "sm",
                  onClick: (e) => {
                    e.preventDefault();
                    setCollectionDelete(collection.name);
                  },
                  children: "Delete"
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "outline", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), size: "sm", href: `/database/${stats.name}/${collection.name}`, children: "View" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 px-4 py-2 lg:grid-cols-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Storage size:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: convertBytes(collection.stats.storageStats?.storageSize) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Documents:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: collection.count })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Avg. document size:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: convertBytes(avgDocumentSize) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Indexes:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: collection.indexes.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Total index size:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: convertBytes(collection.stats.storageStats?.totalIndexSize) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Accordion, { type: "multiple", children: /* @__PURE__ */ jsxs(AccordionItem, { value: "stats", title: "More Details", className: "pr-0 ", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "px-4 border-t border-solid border-neutral-200", children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: "More Details" }) }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "px-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start w-full pb-4 lg:flex-row", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsx(Table, { className: "text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Namespace" }),
                  /* @__PURE__ */ jsx(TableCell, { children: collection.stats.ns })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Host" }),
                  /* @__PURE__ */ jsx(TableCell, { children: collection.stats.host })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Local Time" }),
                  /* @__PURE__ */ jsx(TableCell, { children: collection.stats.localTime })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Reads Latency" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.latencyStats?.reads.latency),
                    " ms"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Writes Latency" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.latencyStats?.writes.latency),
                    " ms"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Commands Latency" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.latencyStats?.commands.latency),
                    " ms"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Transactions Latency" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.latencyStats?.transactions.latency),
                    " ms"
                  ] })
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsx(Table, { className: "mt-4 text-md lg:mt-0", children: /* @__PURE__ */ jsxs(TableBody, { children: [
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Storage Size" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.storageStats?.storageSize),
                    " B"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Total Index Size" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.storageStats?.totalIndexSize),
                    " B"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Total Size" }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    numberWithCommas(collection.stats.storageStats?.totalSize),
                    " B"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Count" }),
                  /* @__PURE__ */ jsx(TableCell, { children: collection.count })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Collection Scans Total" }),
                  /* @__PURE__ */ jsx(TableCell, { children: numberWithCommas(collection.stats.queryExecStats?.collectionScans.total) })
                ] }),
                /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Collection Scans Non-Tailable" }),
                  /* @__PURE__ */ jsx(TableCell, { children: numberWithCommas(collection.stats.queryExecStats?.collectionScans.nonTailable) })
                ] })
              ] }) }) })
            ] }) })
          ] }) })
        ] }, index);
      }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pb-4 mt-10", children: /* @__PURE__ */ jsxs("div", { className: "", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xl font-medium", children: "Details" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          "Collections: ",
          stats.collections
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Table, { className: "text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            /* @__PURE__ */ jsx("strong", { children: "Collections " }),
            /* @__PURE__ */ jsx("small", { className: "block", children: "(incl. system.namespaces)" })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.collections })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Data Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.dataSize })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Storage Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.storageSize })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Views" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.views })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Avg Obj Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.avgObjSize })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Objects" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.objects })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Operation Time" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.operationTime })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Cluster Time" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.clusterTime })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Extents" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.numExtents })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Extents Free List" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.extentFreeListNum })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Indexes" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.indexes })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Index Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.indexSize })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "Data File Version" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: stats.dataFileVersion })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "File System Used Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: convertBytes(stats.fsUsedSize) })
        ] }),
        /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("strong", { children: "File System Total Size" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: convertBytes(stats.fsTotalSize) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      CollectionAddModal,
      {
        open: isAdd,
        onClose: () => {
          setIsAdd(false);
        },
        onSuccess: (dbName, collectionName) => {
          navigate(`/database/${dbName}/${collectionName}`, { replace: true });
        },
        dbName: stats.name
      }
    ),
    /* @__PURE__ */ jsx(
      CollectionDeleteModal,
      {
        open: collectionDelete !== null,
        onClose: () => {
          setCollectionDelete(null);
        },
        collectionName: collectionDelete || "",
        onSuccess: () => {
          setCollectionDelete(null);
          window.location.reload();
        },
        dbName: stats.name
      }
    ),
    /* @__PURE__ */ jsx(
      DatabaseDeleteModal,
      {
        open: isDelete,
        onClose: () => {
          setIsDelete(false);
        },
        onSuccess: () => {
          setIsDelete(false);
          navigate(`/database`, { replace: true });
        },
        name: stats.name
      }
    )
  ] });
}

const route1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$7,
  default: DatabasePage$1,
  loader: loader$9
}, Symbol.toStringTag, { value: 'Module' }));

const CopyText = ({ text, className }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) {
      return;
    }
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1e3);
    });
  };
  return /* @__PURE__ */ jsx("span", { className: "cursor-pointer" + (className ? " " + className : ""), onClick: handleCopy, children: copied ? /* @__PURE__ */ jsx(CheckIcon, {}) : /* @__PURE__ */ jsx(CopyIcon, {}) });
};
const CopyTextButton = ({ text, children, ...rest }) => {
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
      }, 1e3);
    });
  };
  return /* @__PURE__ */ jsx(Button, { icon: copied ? /* @__PURE__ */ jsx(CheckIcon, {}) : /* @__PURE__ */ jsx(CopyIcon, {}), onClick: handleCopy, ...rest, children });
};

function getInputSelection(el) {
  let start = 0, end = 0;
  if (!el) {
    return { start, end };
  }
  if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
    return { start: el.selectionStart, end: el.selectionEnd };
  }
  if (!document) {
    return { start, end };
  }
  const selection = document.getSelection();
  const range = selection ? selection.getRangeAt(0) : null;
  if (!range || range.commonAncestorContainer !== el) {
    return { start, end };
  }
  const len = el.value.length;
  const normalizedValue = el.value.replace(/\r\n/g, "\n");
  const textInputRange = el.createTextRange();
  const rangeClone = range.cloneRange();
  textInputRange.setStart(rangeClone.startContainer, rangeClone.startOffset);
  textInputRange.setEnd(rangeClone.endContainer, rangeClone.endOffset);
  const endRange = el.createTextRange();
  endRange.collapse(false);
  if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
    start = end = len;
  } else {
    start = -textInputRange.moveStart("character", -len);
    start += normalizedValue.slice(0, start).split("\n").length - 1;
    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
      end = len;
    } else {
      end = -textInputRange.moveEnd("character", -len);
      end += normalizedValue.slice(0, end).split("\n").length - 1;
    }
  }
  return { start, end };
}
function setCaretPosition(elem, caretPos) {
  if (elem) {
    if (elem.createTextRange) {
      const range = elem.createTextRange();
      range.move("character", caretPos);
      range.select();
    } else {
      if (elem.selectionStart) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      } else {
        elem.focus();
      }
    }
  }
}

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;
const OPTION_LIST_MIN_WIDTH = 100;
const AutocompleteTextField = ({
  Component = "textarea",
  defaultValue = "",
  disabled = false,
  maxOptions = 6,
  onBlur = () => {
  },
  onChange = () => {
  },
  onKeyDown = () => {
  },
  onRequestOptions = () => {
  },
  onSelect = () => {
  },
  changeOnSelect = (trigger2, slug) => {
    if (slug.substring(0, 1) == trigger2) {
      return slug;
    }
    return trigger2 + slug;
  },
  options = [],
  regex = "^[A-Za-z0-9\\-_]+$",
  matchAny = false,
  minChars = 0,
  requestOnlyIfNoOptions = true,
  spaceRemovers = [",", ".", "!", "?"],
  spacer = "",
  trigger = "@",
  offsetX = 0,
  offsetY = 0,
  value = null,
  passThroughEnter = false,
  passThroughTab = true,
  triggerMatchWholeWord = false,
  triggerCaseInsensitive = false,
  className,
  attributes
}) => {
  const [state, setState] = useState({
    helperVisible: false,
    left: 0,
    trigger: null,
    matchLength: 0,
    matchStart: 0,
    options: [],
    selection: 0,
    top: 0,
    caret: 0
  });
  const recentValue = useRef(defaultValue);
  const enableSpaceRemovers = useRef(false);
  const refInput = useRef(null);
  const refCurrent = useRef(null);
  const refParent = useRef(null);
  useEffect(() => {
    const handleResize = () => setState((prevState) => ({ ...prevState, helperVisible: false }));
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, []);
  useEffect(() => {
    const { helperVisible } = state;
    if (helperVisible && refCurrent.current) {
      scrollIntoView(refCurrent.current, { boundary: refParent.current, scrollMode: "if-needed" });
    }
  }, [state.caret, state.helperVisible]);
  const getMatch = (str, caret, providedOptions) => {
    const re = new RegExp(regex);
    let triggers = [];
    if (!Array.isArray(trigger)) {
      triggers = [trigger];
    } else {
      triggers = trigger;
    }
    triggers.sort();
    const providedOptionsObject = providedOptions;
    if (Array.isArray(providedOptions)) {
      triggers.forEach((triggerStr) => {
        providedOptionsObject[triggerStr] = providedOptions;
      });
    }
    const triggersMatch = arrayTriggerMatch(triggers, re);
    let slugData = null;
    for (let triggersIndex = 0; triggersIndex < triggersMatch.length; triggersIndex++) {
      const { triggerStr, triggerMatch, triggerLength } = triggersMatch[triggersIndex];
      for (let i = caret - 1; i >= 0; --i) {
        const substr = str.substring(i, caret);
        const match = substr.match(re);
        let matchStart = -1;
        if (triggerLength > 0) {
          const triggerIdx = triggerMatch ? i : i - triggerLength + 1;
          if (triggerIdx < 0) {
            break;
          }
          if (isTrigger(triggerStr, str, triggerIdx)) {
            matchStart = triggerIdx + triggerLength;
          }
          if (!match && matchStart < 0) {
            break;
          }
        } else {
          if (match && i > 0) {
            continue;
          }
          matchStart = i === 0 && match ? 0 : i + 1;
          if (caret - matchStart === 0) {
            break;
          }
        }
        if (matchStart >= 0) {
          const triggerOptions = providedOptionsObject[triggerStr];
          if (triggerOptions == null) {
            continue;
          }
          const matchedSlug = str.substring(matchStart - 1, caret);
          const options2 = triggerOptions.filter((slug) => {
            const idx = slug.toLowerCase().indexOf(matchedSlug.toLowerCase());
            return idx !== -1 && (matchAny || idx === 0);
          });
          const currTrigger = triggerStr;
          const matchLength = matchedSlug.length;
          if (slugData === null) {
            slugData = {
              trigger: currTrigger,
              matchStart: matchStart - 1,
              matchLength,
              options: options2
            };
          } else {
            slugData = {
              ...slugData,
              trigger: currTrigger,
              matchStart: matchStart - 1,
              matchLength,
              options: options2
            };
          }
        }
      }
    }
    return slugData;
  };
  const arrayTriggerMatch = (triggers, re) => {
    return triggers.map((trigger2) => ({
      triggerStr: trigger2,
      triggerMatch: trigger2.match(re),
      triggerLength: trigger2.length
    }));
  };
  const isTrigger = (trigger2, str, i) => {
    if (!trigger2 || !trigger2.length) {
      return true;
    }
    if (triggerMatchWholeWord && i > 0 && str.charAt(i - 1).match(/[\w]/)) {
      return false;
    }
    if (str.substr(i, trigger2.length) === trigger2 || triggerCaseInsensitive && str.substr(i, trigger2.length).toLowerCase() === trigger2.toLowerCase()) {
      return true;
    }
    return false;
  };
  const handleBlur = (e) => {
    resetHelper();
    if (onBlur) {
      onBlur(e);
    }
  };
  const handleChange = (e) => {
    const old = recentValue.current;
    const str = e.target.value;
    const caret = getInputSelection(e.target).end;
    if (!str.length) {
      setState((prevState) => ({ ...prevState, helperVisible: false }));
    }
    recentValue.current = str;
    setState((prevState) => ({ ...prevState, caret, value: e.target.value }));
    if (!str.length || !caret) {
      return onChange(e.target.value);
    }
    if (enableSpaceRemovers.current && spaceRemovers.length && str.length > 2 && spacer.length) {
      for (let i = 0; i < Math.max(old.length, str.length); ++i) {
        if (old[i] !== str[i]) {
          if (i >= 2 && str[i - 1] === spacer && spaceRemovers.indexOf(str[i - 2]) === -1 && spaceRemovers.indexOf(str[i]) !== -1 && getMatch(str.substring(0, i - 2), caret - 3, options)) {
            const newValue = `${str.slice(0, i - 1)}${str.slice(i, i + 1)}${str.slice(i - 1, i)}${str.slice(i + 1)}`;
            updateCaretPosition(i + 1);
            if (refInput.current) refInput.current.value = newValue;
            if (!value) {
              setState((prevState) => ({ ...prevState, value: newValue }));
            }
            return onChange(newValue);
          }
          break;
        }
      }
      enableSpaceRemovers.current = false;
    }
    updateHelper(str, caret, options);
    if (!value) {
      setState((prevState) => ({ ...prevState, value: e.target.value }));
    }
    return onChange(e.target.value);
  };
  const handleKeyDown = (event) => {
    const { helperVisible, options: options2, selection } = state;
    const optionsCount = maxOptions > 0 ? Math.min(options2.length, maxOptions) : options2.length;
    if (helperVisible) {
      switch (event.keyCode) {
        case KEY_ESCAPE:
          event.preventDefault();
          resetHelper();
          break;
        case KEY_UP:
          event.preventDefault();
          if (optionsCount > 0) {
            setState((prevState) => ({ ...prevState, selection: Math.max(0, optionsCount + selection - 1) % optionsCount }));
          }
          break;
        case KEY_DOWN:
          event.preventDefault();
          if (optionsCount > 0) {
            setState((prevState) => ({ ...prevState, selection: (selection + 1) % optionsCount }));
          }
          break;
        case KEY_ENTER:
        case KEY_RETURN:
          if (!passThroughEnter) {
            event.preventDefault();
          }
          handleSelection(selection);
          break;
        case KEY_TAB:
          if (!passThroughTab) {
            event.preventDefault();
          }
          handleSelection(selection);
          break;
        default:
          onKeyDown(event);
          break;
      }
    } else {
      onKeyDown(event);
    }
  };
  const handleSelection = (idx) => {
    const { matchStart, matchLength, options: options2, trigger: trigger2 } = state;
    const slug = options2[idx];
    const value2 = recentValue.current;
    if (trigger2) {
      const part1 = trigger2.length === 0 ? "" : value2.substring(0, matchStart - trigger2.length);
      const part2 = value2.substring(matchStart + matchLength);
      const event = { target: refInput.current };
      const changedStr = changeOnSelect(trigger2, slug);
      if (event.target) {
        event.target.value = `${part1}${changedStr}${spacer}${part2}`;
        handleChange(event);
        onSelect(event.target.value);
      }
      resetHelper();
      const advanceCaretDistance = part1.length + changedStr.length + (spacer ? spacer.length : 1);
      updateCaretPosition(advanceCaretDistance);
      enableSpaceRemovers.current = true;
    }
  };
  const updateCaretPosition = (caret) => {
    setState((prevState) => {
      const newState = { ...prevState, caret };
      setCaretPosition(refInput.current, caret);
      return newState;
    });
  };
  const updateHelper = (str, caret, options2) => {
    const input = refInput.current;
    const slug = getMatch(str, caret, options2);
    if (slug && input) {
      const caretPos = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();
      const top = caretPos.top + rect.top - input.scrollTop;
      const left = Math.min(caretPos.left + rect.left - input.scrollLeft, window.innerWidth - OPTION_LIST_MIN_WIDTH);
      if (slug.matchLength >= minChars && (slug.options.length > 1 || slug.options.length === 1 && (slug.options[0].length !== slug.matchLength || slug.options[0].length === 1))) {
        setState({
          ...state,
          helperVisible: true,
          top,
          left,
          ...slug
        });
      } else {
        if (!requestOnlyIfNoOptions || !slug.options.length) {
          onRequestOptions(str.substr(slug.matchStart, slug.matchLength));
        }
        resetHelper();
      }
    } else {
      resetHelper();
    }
  };
  const resetHelper = () => {
    setState((prevState) => ({ ...prevState, helperVisible: false, selection: 0 }));
  };
  const renderAutocompleteList = () => {
    const { helperVisible, left, matchStart, matchLength, options: options2, selection, top } = state;
    if (!helperVisible) {
      return null;
    }
    if (options2.length === 0) {
      return null;
    }
    if (selection >= options2.length) {
      setState((prevState) => ({ ...prevState, selection: 0 }));
      return null;
    }
    const optionNumber = maxOptions === 0 ? options2.length : maxOptions;
    const helperOptions = options2.slice(0, optionNumber).map((val, idx) => {
      let highlightStart = 0;
      if (value) {
        highlightStart = val.toLowerCase().indexOf(value.substr(matchStart, matchLength).toLowerCase());
      }
      return /* @__PURE__ */ jsxs(
        "li",
        {
          className: "cursor-pointer px-2 py-1 text-xs" + (idx === selection ? " bg-neutral-200" : ""),
          ref: idx === selection ? refCurrent : null,
          onClick: () => {
            handleSelection(idx);
          },
          onMouseDown: (e) => {
            e.preventDefault();
          },
          onMouseEnter: () => {
            setState((prevState) => ({ ...prevState, selection: idx }));
          },
          children: [
            val.slice(0, highlightStart),
            /* @__PURE__ */ jsx("strong", { className: "font-bold", children: val.substr(highlightStart, matchLength) }),
            val.slice(highlightStart + matchLength)
          ]
        },
        val
      );
    });
    const maxWidth = window.innerWidth - left - offsetX - 5;
    const maxHeight = window.innerHeight - top - offsetY - 5;
    return /* @__PURE__ */ jsx(
      "ul",
      {
        className: "fixed bottom-auto z-50 block p-px mt-1 overflow-y-scroll text-xs text-left bg-white border border-solid bg-clip-padding border-neutral-100",
        style: {
          left: left + offsetX,
          top: top + offsetY,
          maxHeight,
          maxWidth
        },
        ref: refParent,
        children: helperOptions
      }
    );
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Component,
      {
        ...attributes,
        className,
        disabled,
        onBlur: handleBlur,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        ref: refInput,
        value
      }
    ),
    renderAutocompleteList()
  ] });
};

const IconButton = ({ children, ...props }) => {
  return /* @__PURE__ */ jsx("button", { ...props, className: "px-1 py-1 hover:bg-neutral-200" + (props.className ? " " + props.className : ""), children });
};
const TreeNode$1 = ({ expanded, allowEdit, data, path, autocompleteItems, onUpdate, onDelete, onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const ref = useRef(null);
  const handleToggle = () => setIsExpanded(!isExpanded);
  const handleEdit = () => {
    setEditValue(EJSON.stringify(data));
    setIsEditing(true);
  };
  const handleSave = () => {
    try {
      const parsedValue = EJSON.parse(editValue);
      onUpdate?.(path, parsedValue);
      setIsEditing(false);
    } catch (error) {
      onUpdate?.(path, editValue);
      setIsEditing(false);
    }
    setIsExpanded(true);
  };
  const handleAdd = () => {
    try {
      const parsedValue = newValue.trim() === "" ? "" : EJSON.parse(newValue);
      onAdd?.(path, newKey, parsedValue);
      setNewKey(() => "");
      setNewValue(() => "");
      setIsAddingNew(false);
    } catch (error) {
      onAdd?.(path, newKey, newValue);
      setNewKey(() => "");
      setNewValue(() => "");
      setIsAddingNew(false);
    }
    setIsExpanded(true);
  };
  const renderValue = () => {
    if (isEditing && allowEdit) {
      let style = {};
      if (ref.current) {
        style = { minWidth: ref.current.clientWidth + 5 + "px" };
      }
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          AutocompleteTextField,
          {
            className: "w-32 h-6 px-1 pt-0.5 text-xs font-medium border border-solid  border-neutral-300",
            trigger: ["$"].concat(autocompleteItems.map((e) => e.substring(0, 1))),
            options: mongodbOperators.map((e) => e.substring(1)).concat(autocompleteItems),
            attributes: { placeholder: "Value (JSON or String or Number ...)", style: { resize: "both", ...style } },
            value: editValue,
            Component: "textarea",
            onChange: (value) => setEditValue(value)
          }
        ),
        /* @__PURE__ */ jsx(IconButton, { onClick: handleSave, className: "", children: /* @__PURE__ */ jsx(CheckIcon, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(IconButton, { onClick: () => setIsEditing(false), className: "", children: /* @__PURE__ */ jsx(XIcon, { className: "w-4 h-4" }) })
      ] });
    }
    if (typeof data !== "object" || data === null || data instanceof ObjectId || data instanceof Date) {
      let output = data;
      if (data instanceof ObjectId) {
        output = `ObjectId("${data.toHexString()}")`;
      } else if (data instanceof Date) {
        output = data.toISOString();
      } else {
        output = EJSON.stringify(data);
      }
      return /* @__PURE__ */ jsx(
        "span",
        {
          ref,
          className: [
            "px-1 rounded",
            typeof data === "string" && "text-green-600",
            typeof data === "number" && "text-blue-600",
            data instanceof ObjectId && "text-red-600 font-medium",
            data instanceof Date && "text-yellow-600 font-medium",
            typeof data === "boolean" && "text-purple-600",
            data === null && "text-neutral-600"
          ].filter(Boolean).join(" "),
          children: output
        }
      );
    }
    return null;
  };
  const renderAddNew = () => {
    if (!isAddingNew) return null;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1 mb-1 ml-4", children: [
      /* @__PURE__ */ jsx(
        AutocompleteTextField,
        {
          className: "w-32 h-6 px-1 text-xs font-medium border border-solid  border-neutral-300",
          trigger: ["$"].concat(autocompleteItems.map((e) => e.substring(0, 1))),
          options: mongodbOperators.concat(autocompleteItems),
          attributes: { placeholder: "Key" },
          value: newKey,
          Component: "input",
          onChange: (value) => setNewKey(value)
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-xs", children: ":" }),
      /* @__PURE__ */ jsx(
        AutocompleteTextField,
        {
          className: "w-32 h-6 px-1 pt-0.5 text-xs font-medium border border-solid  border-neutral-300",
          trigger: ["$"].concat(autocompleteItems.map((e) => e.substring(0, 1))),
          options: mongodbOperators.map((e) => e.substring(1)).concat(autocompleteItems),
          attributes: { placeholder: "Value (JSON or String or Number ...)", style: { resize: "both" } },
          value: newValue,
          Component: "textarea",
          onChange: (value) => setNewValue(value)
        }
      ),
      /* @__PURE__ */ jsx(IconButton, { onClick: handleAdd, disabled: !newKey.trim(), children: /* @__PURE__ */ jsx(CheckIcon, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsx(
        IconButton,
        {
          onClick: () => {
            setNewKey(() => "");
            setNewValue(() => "");
            setIsAddingNew(false);
          },
          children: /* @__PURE__ */ jsx(XIcon, { className: "w-4 h-4" })
        }
      )
    ] });
  };
  if (typeof data !== "object" || data === null || data instanceof ObjectId || data instanceof Date) {
    return /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-1 py-0.5 text-sm hover:bg-neutral-100 group", children: [
      /* @__PURE__ */ jsx("div", { className: "w-4" }),
      /* @__PURE__ */ jsxs("span", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-center text-right min-w-4", children: path[path.length - 1] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-center", children: ":" })
      ] }),
      renderValue(),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center h-5 gap-1 ml-10 opacity-0 group-hover:opacity-100 left-full", children: [
        !isEditing && allowEdit && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(IconButton, { onClick: handleEdit, title: "Edit", children: /* @__PURE__ */ jsx(PencilIcon, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx(IconButton, { onClick: () => onDelete?.(path), className: "px-1 py-1 text-red-600 hover:bg-neutral-200", children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsx(IconButton, { className: "px-1 py-1 hover:bg-neutral-200", children: /* @__PURE__ */ jsx(CopyText, { text: EJSON.stringify(data) }) })
      ] })
    ] });
  }
  let label = null;
  let isRoot = false;
  if (path.length) {
    label = `${path[path.length - 1]}:`;
  } else {
    isRoot = true;
    label = /* @__PURE__ */ jsx("span", { children: Array.isArray(data) && data && data["_id"] ? ` #${String(data["_id"])}:` : data && data._id ? ` #${String(data._id)}:` : null });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-1 py-0.5 text-sm group" + (isRoot ? " mb-1" : ""), children: [
      /* @__PURE__ */ jsx("button", { onClick: handleToggle, className: "w-4 h-4", children: isExpanded ? /* @__PURE__ */ jsx(ChevronDownIcon, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronRightIcon, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "flex font-medium", children: label }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-neutral-400 whitespace-nowrap", children: [
          Array.isArray(data) ? "Array" : "Object",
          " (",
          Array.isArray(data) ? data.length : Object.keys(data).length,
          " items)"
        ] })
      ] }),
      !isEditing && allowEdit && /* @__PURE__ */ jsxs("div", { className: "flex items-center h-5 gap-1 ml-10 opacity-0 group-hover:opacity-100 left-full", children: [
        /* @__PURE__ */ jsx(IconButton, { onClick: () => setIsAddingNew(true), children: /* @__PURE__ */ jsx(PlusIcon, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(IconButton, { onClick: () => onDelete?.(path), className: "text-red-600", children: /* @__PURE__ */ jsx(TrashIcon, { className: "w-4 h-4" }) })
      ] })
    ] }),
    allowEdit && renderAddNew(),
    isExpanded && /* @__PURE__ */ jsx("div", { className: "ml-4", children: Object.entries(data).map(([key, value]) => /* @__PURE__ */ jsx(
      TreeNode$1,
      {
        autocompleteItems,
        allowEdit,
        data: value,
        path: [...path, key],
        onUpdate,
        onDelete,
        onAdd
      },
      key
    )) })
  ] });
};

const JsonTreeEditor = ({ autocompleteItems, isExpanded, allowEdit = true, data = {}, onChange }) => {
  const handleUpdate = (path, value) => {
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange?.(newData);
  };
  const handleDelete = (path) => {
    if (path.length === 0) {
      onChange?.({});
      return;
    }
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    if (Array.isArray(current)) {
      current.splice(parseInt(path[path.length - 1]), 1);
    } else {
      delete current[path[path.length - 1]];
    }
    onChange?.(newData);
  };
  const handleAdd = (path, key, value) => {
    const newData = { ...data };
    let current = newData;
    for (const segment of path) {
      current = current[segment];
    }
    if (Array.isArray(current)) {
      current.push(value);
    } else {
      current[key] = value;
    }
    onChange?.(newData);
  };
  return /* @__PURE__ */ jsx(
    TreeNode$1,
    {
      autocompleteItems,
      allowEdit: !!(onChange && allowEdit),
      expanded: isExpanded,
      data,
      path: [],
      onUpdate: onChange ? handleUpdate : void 0,
      onDelete: onChange ? handleDelete : void 0,
      onAdd: onChange ? handleAdd : void 0
    }
  );
};

const CsvTable = ({ sort, rows, allowEdit = false, onSort }) => {
  const headers = [];
  if (rows.length > 0) {
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!headers.includes(key)) headers.push(key);
      });
    });
  }
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-full overflow-auto", children: /* @__PURE__ */ jsxs("table", { border: 1, className: "bg-neutral-50", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: headers.map((header, index) => {
      return /* @__PURE__ */ jsx(
        "th",
        {
          className: "px-4 py-2 text-left cursor-pointer text-md bg-neutral-100 group",
          onClick: () => {
            onSort(header);
          },
          id: `${header}-${index}`,
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            header,
            /* @__PURE__ */ jsx("span", { className: sort.field == header ? "opacity-60 group-hover:opacity-100" : " opacity-0 group-hover:opacity-40", children: sort.field == header && sort.direction > 0 ? /* @__PURE__ */ jsx(SortAscIcon, {}) : /* @__PURE__ */ jsx(SortDescIcon, {}) })
          ] })
        },
        header
      );
    }) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ jsx("tr", { className: "opacity-80 hover:opacity-100 border-b " + (rowIndex % 2 == 0 ? "bg-white" : ""), children: Object.keys(row).map((key) => {
      if ((Array.isArray(row[key]) || row[key] instanceof Object) && !(row[key] instanceof ObjectId || row[key] instanceof Date)) {
        return /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 group/item", children: [
          /* @__PURE__ */ jsx(JsonTreeEditor, { autocompleteItems: [], allowEdit, data: row[key] }),
          /* @__PURE__ */ jsx(CopyText, { className: "p-1 ml-auto opacity-0 group-hover/item:opacity-100 hover:bg-white", text: EJSON.stringify(row[key]) })
        ] }) }, key);
      }
      let output = "";
      if (row[key] instanceof ObjectId) {
        output = `ObjectId("${row[key].toHexString()}")`;
      } else if (row[key] instanceof Date) {
        output = row[key].toISOString();
      } else {
        output = EJSON.stringify(row[key]);
      }
      return /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-1 text-md group hover:bg-white", children: [
        EJSON.stringify(row[key]),
        /* @__PURE__ */ jsx(CopyText, { className: "p-1 ml-auto opacity-0 group-hover:opacity-100 hover:bg-neutral-200", text: output })
      ] }) }, key);
    }) }, row._id)) })
  ] }) });
};

const AlertMessage = ({ message, type = "error", onClose }) => {
  if (!message || message.trim() == "") {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center px-2 py-1 text-xs text-red-500 bg-red-100 border border-red-300 border-solid ", children: [
    message,
    /* @__PURE__ */ jsx("button", { className: "ml-2 text-xs text-red-500  hover:bg-red-200", onClick: onClose, children: /* @__PURE__ */ jsx(XIcon, {}) })
  ] }) });
};

const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.List, { ref, className: cn("inline-flex h-9 items-center justify-center  bg-muted p-1 text-muted-foreground", className), ...props }));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    TabsPrimitive.Trigger,
    {
      ref,
      className: cn(
        "inline-flex items-center justify-center whitespace-nowrap  px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className
      ),
      ...props
    }
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    TabsPrimitive.Content,
    {
      ref,
      className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
      ...props
    }
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

function mapPageSizesToObject(sizes) {
  return typeof sizes[0] === "object" && sizes[0] !== null ? sizes : sizes.map((size) => ({ text: size, value: size }));
}
function renderSelectItems(total) {
  let counter = 1;
  const itemArr = [];
  while (counter <= total) {
    itemArr.push(
      /* @__PURE__ */ jsx(SelectItem, { value: counter, children: String(counter) }, counter)
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
const Pagination = React__default.forwardRef(function Pagination2({
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
}, ref) {
  const backBtnRef = useRef(null);
  const forwardBtnRef = useRef(null);
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
  const forwardButtonDisabled = disabled || page === totalPages && !pagesUnknown;
  const forwardButtonClasses = cn(
    "flex p-1 items-center w-10 justify-center cursor-pointer hover:bg-neutral-100",
    forwardButtonDisabled || isLastPage ? "opacity-50 cursor-not-allowed" : ""
  );
  const selectItems = renderSelectItems(totalPages);
  if (controlledPage !== prevControlledPage) {
    setPage(controlledPage);
    setPrevControlledPage(controlledPage);
  }
  if (controlledPageSize !== prevControlledPageSize) {
    setPageSize(getPageSize(pageSizes, controlledPageSize));
    setPrevControlledPageSize(controlledPageSize);
  }
  if (!isArraysEqual(controlledPageSizes, prevPageSizes)) {
    const pageSizes2 = mapPageSizesToObject(controlledPageSizes);
    const hasPageSize = pageSizes2.find((size2) => {
      return size2.value === pageSize;
    });
    if (!hasPageSize) {
      setPage(1);
    }
    setPageSizes(pageSizes2);
    setPrevPageSizes(controlledPageSizes);
  }
  function handleSizeChange(value) {
    const pageSize2 = Number(value);
    const changes = {
      pageSize: pageSize2,
      page: 1
    };
    setPage(changes.page);
    setPageSize(changes.pageSize);
    if (onChange) {
      onChange(changes);
    }
  }
  function handlePageInputChange(value) {
    const page2 = Number(value);
    if (page2 > 0 && totalItems && page2 <= Math.max(Math.ceil(totalItems / pageSize), 1)) {
      setPage(page2);
      if (onChange) {
        onChange({
          page: page2,
          pageSize
        });
      }
    }
  }
  function incrementPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    if (nextPage === totalPages && backBtnRef?.current) {
      backBtnRef.current.focus();
    }
    if (onChange) {
      onChange({
        page: nextPage,
        pageSize,
        ref: backBtnRef
      });
    }
  }
  function decrementPage() {
    const nextPage = page - 1;
    setPage(nextPage);
    if (nextPage === 1 && forwardBtnRef?.current) {
      forwardBtnRef.current.focus();
    }
    if (onChange) {
      onChange({
        page: nextPage,
        pageSize,
        ref: forwardBtnRef
      });
    }
  }
  return /* @__PURE__ */ jsxs("div", { className, ref, ...rest, children: [
    /* @__PURE__ */ jsxs("div", { className: `flex gap-2 pl-4`, children: [
      /* @__PURE__ */ jsx("label", { className: `whitespace-nowrap flex items-center`, children: itemsPerPageText }),
      /* @__PURE__ */ jsxs(
        Select,
        {
          className: `select__item-count`,
          labelText: "",
          hideLabel: true,
          noLabel: true,
          inline: true,
          onValueChange: handleSizeChange,
          disabled: pageSizeInputDisabled || disabled,
          value: pageSize,
          children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: `border-0 shadow-none`, children: pageSize }),
            /* @__PURE__ */ jsx(SelectContent, { children: pageSizes.map((sizeObj) => /* @__PURE__ */ jsx(SelectItem, { value: sizeObj.value, children: String(sizeObj.text) }, sizeObj.value)) })
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "border-r border-solid border-neutral-300" }),
      /* @__PURE__ */ jsx("span", { className: `whitespace-nowrap opacity-50 flex items-center pl-4`, children: pagesUnknown || !totalItems ? totalItems === 0 ? itemRangeText(0, 0, 0) : itemText(pageSize * (page - 1) + 1, page * pageSize) : itemRangeText(Math.min(pageSize * (page - 1) + 1, totalItems), Math.min(page * pageSize, totalItems), totalItems) })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "border-r border-solid border-neutral-300" }),
    /* @__PURE__ */ jsxs("div", { className: `flex whitespace-nowrap`, children: [
      /* @__PURE__ */ jsx("span", { className: "border-r border-solid border-neutral-300" }),
      pagesUnknown ? /* @__PURE__ */ jsx("span", { className: `whitespace-nowrap flex items-center`, children: pageText(page) }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-1 pr-4", children: [
        /* @__PURE__ */ jsxs(
          Select,
          {
            labelText: `Page of ${totalPages} pages`,
            inline: true,
            hideLabel: true,
            onValueChange: handlePageInputChange,
            value: page,
            disabled: pageInputDisabled || disabled,
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: `border-0 shadow-none`, children: page }),
              /* @__PURE__ */ jsx(SelectContent, { children: selectItems })
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "flex items-center opacity-50", children: pageRangeText(page, totalPages) })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "border-r border-solid border-neutral-300" }),
      /* @__PURE__ */ jsxs("div", { className: `flex`, children: [
        /* @__PURE__ */ jsxs("span", { className: backButtonClasses, "aria-label": backwardText, onClick: decrementPage, ref: backBtnRef, children: [
          /* @__PURE__ */ jsx(TriangleLeftIcon, {}),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: backwardText })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "border-r border-solid border-neutral-300" }),
        /* @__PURE__ */ jsxs("span", { className: forwardButtonClasses, "aria-label": forwardText, onClick: incrementPage, ref: backBtnRef, children: [
          /* @__PURE__ */ jsx(TriangleRightIcon, {}),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: forwardText })
        ] })
      ] })
    ] })
  ] });
});

const IdeWithAutocomplete = ({ onChange }) => {
  return /* @__PURE__ */ jsx(
    CodeiumEditor,
    {
      language: "json",
      className: "text-sm",
      theme: "light",
      onChange,
      options: {
        fontSize: 12,
        padding: {
          top: 10
        }
      }
    }
  );
};
const loadCollectionData = async ({ jsonQuery, request, params, withColumns = false }) => {
  const url = new URL(request.url);
  const session = await getUserSession(request);
  const connection = session.get("connection");
  const query = url.searchParams;
  if (!params.db) {
    return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
  }
  if (!params.col) {
    return Response.json({ status: "error", message: "No collection specified" }, { status: 500 });
  }
  let mongo;
  mongo = await connect(connection);
  let sortKey = query.get("sort") || jsonQuery.sort || "";
  const pagination = {
    limit: query.get("limit") || jsonQuery.limit || 10,
    skip: query.get("skip") || jsonQuery.skip || 0
  };
  if (sortKey != "") {
    pagination["sort"] = {};
    pagination["sort"][sortKey] = query.get("direction") || jsonQuery.direction || 0;
  }
  const collection = new Collection(mongo, params.db, params.col, config);
  const collectionData = await collection.viewCollection({ ...jsonQuery, ...pagination });
  let columns = null;
  if (withColumns) {
    columns = await collection.getColumns();
  }
  return { ...collectionData, documents: EJSON.stringify(collectionData.docs), params, pagination, columns };
};
const action$6 = async ({ request, params }) => {
  try {
    const jsonQuery = await request.json();
    if (!jsonQuery || !jsonQuery.query) {
      return Response.json({ status: "error", message: "No query specified" }, { status: 500 });
    }
    jsonQuery.query = EJSON.parse(jsonQuery.query);
    if (!jsonQuery || !jsonQuery.query) {
      return Response.json({ status: "error", message: "No query specified" }, { status: 500 });
    }
    return Response.json({ status: "success", collection: await loadCollectionData({ jsonQuery, request, params }) }, { status: 200 });
  } catch (e) {
    return Response.json({ status: "error", message: e.message }, { status: 500 });
  }
};
const loader$8 = async ({ request, params }) => {
  try {
    const data = await loadCollectionData({ jsonQuery: {}, request, params, withColumns: true });
    return Response.json(
      { ...data },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return Response.json({ status: "error", message: e.message }, { status: 500 });
  }
};
function CollectionPage() {
  const loaderData = useLoaderData();
  const [currentPage, setCurrenPage] = useState({
    page: 1,
    pageSize: 10
  });
  const [sort, setSort] = useState({
    field: "",
    direction: 0
  });
  const fetcher = useFetcher();
  const initRef = useRef(false);
  const [view, setView] = useState("list");
  const [jsonQuery, setJsonQuery] = useState({});
  const [jsonQueryString, setJsonQueryString] = useState("");
  const [errorJsonQueryString, setErrorJsonQueryString] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const navigate = useNavigate();
  const { columns } = loaderData;
  const [data, setData] = useState(loaderData);
  const { title, stats, count, documents: loaderDocuments, params, pagination } = data;
  const documents = EJSON.parse(loaderDocuments);
  useEffect(() => {
    if (!params || !initRef || !initRef.current) {
      initRef.current = true;
      return;
    }
    const paginationObj = {};
    if (currentPage.page > 1) {
      const skip = (currentPage.page - 1) * currentPage.pageSize;
      paginationObj["skip"] = skip;
    }
    if (currentPage.pageSize != 10) {
      paginationObj["limit"] = currentPage.pageSize;
    }
    fetcher.submit(
      {
        query: jsonQuery ? EJSON.stringify(jsonQuery) : {},
        ...paginationObj,
        sort: sort.field,
        direction: sort.direction
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/database/${params.db}/${params.col}`
      }
    );
  }, [currentPage.page, currentPage.pageSize, sort.field, sort.direction]);
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setData(fetcher.data.collection);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setErrorJsonQueryString(fetcher.data?.message || "");
    }
  }, [fetcher.data]);
  if (!stats) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  let items = null;
  if (view == "grid") {
    items = /* @__PURE__ */ jsx(
      CsvTable,
      {
        sort,
        onSort: (key) => {
          setSort((prevSort) => ({
            field: key,
            direction: prevSort.field == key ? prevSort.direction * -1 : 1
          }));
          setCurrenPage({ ...currentPage, page: 1 });
        },
        rows: documents
      }
    );
  } else {
    items = documents.map((doc, index) => {
      return /* @__PURE__ */ jsx("div", { className: "w-full p-4 mb-3 overflow-auto bg-white border border-solid border-neutral-300", children: /* @__PURE__ */ jsx(JsonTreeEditor, { autocompleteItems: columns, isExpanded: false, data: doc }) }, doc._id ? doc._id.toString() : `document-${index}`);
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "database-page", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Title, { title, children: [
            /* @__PURE__ */ jsx("span", { className: "font-normal opacity-50", children: "Collection:" }),
            " ",
            title
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
            "Documents: ",
            stats?.count
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-4", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "danger",
              icon: /* @__PURE__ */ jsx(TrashIcon, {}),
              tooltip: "Delete Database",
              onClick: (e) => {
                e.preventDefault();
                setIsDelete(true);
              },
              children: "Delete Collection"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              hasIconOnly: true,
              size: "md",
              variant: "ghost",
              className: view == "list" ? "bg-neutral-100" : "",
              icon: /* @__PURE__ */ jsx(ListUnorderedIcon, {}),
              tooltip: "List View",
              onClick: (e) => {
                e.preventDefault();
                setView("list");
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              hasIconOnly: true,
              size: "md",
              variant: "ghost",
              className: view == "grid" ? "bg-neutral-100" : "",
              icon: /* @__PURE__ */ jsx(ServerIcon, {}),
              tooltip: "Table View",
              onClick: (e) => {
                e.preventDefault();
                setView("grid");
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 mt-1 mb-1 border border-solid border-neutral-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-base font-bold", children: "Query" }),
          /* @__PURE__ */ jsx("span", { className: "block mb-2 text-xs opacity-50", children: "Please enter your query below" })
        ] }),
        /* @__PURE__ */ jsxs(Tabs, { defaultValue: "json", children: [
          /* @__PURE__ */ jsxs(TabsList, { className: "bg-neutral-100", "aria-label": "List of tabs", children: [
            /* @__PURE__ */ jsx(TabsTrigger, { value: "json", children: "Json Editor" }),
            /* @__PURE__ */ jsx(TabsTrigger, { value: "editor", children: "Codeium (Raw)" })
          ] }),
          /* @__PURE__ */ jsxs(TabsContent, { value: "json", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-white min-h-36", children: /* @__PURE__ */ jsx(JsonTreeEditor, { data: jsonQuery, autocompleteItems: columns, onChange: (data2) => setJsonQuery(data2) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                fetcher.state == "submitting" || fetcher.state == "loading" ? /* @__PURE__ */ jsx(ButtonSkeleton, { size: "sm" }) : /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}),
                    onClick: (e) => {
                      e.preventDefault();
                      setErrorJsonQueryString("");
                      setCurrenPage({ ...currentPage, page: 1 });
                      fetcher.submit(
                        {
                          query: EJSON.stringify(jsonQuery)
                        },
                        {
                          method: "POST",
                          encType: "application/json",
                          action: `/database/${params.db}/${params.col}`
                        }
                      );
                    },
                    children: "Execute"
                  }
                ),
                /* @__PURE__ */ jsx(CopyTextButton, { size: "sm", className: "ml-2", variant: "ghost", text: EJSON.stringify(jsonQuery), children: "Copy as BSON" })
              ] }),
              errorJsonQueryString != "" && /* @__PURE__ */ jsx(AlertMessage, { message: errorJsonQueryString, onClose: () => setErrorJsonQueryString("") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(TabsContent, { value: "editor", children: [
            /* @__PURE__ */ jsx(
              IdeWithAutocomplete,
              {
                onChange: (data2) => {
                  setJsonQueryString(data2);
                  try {
                    setJsonQuery(EJSON.parse(data2));
                    setErrorJsonQueryString("");
                  } catch (e) {
                    setErrorJsonQueryString(e.message);
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
              fetcher.state == "submitting" || fetcher.state == "loading" ? /* @__PURE__ */ jsx(ButtonSkeleton, { size: "sm" }) : /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}),
                  onClick: (e) => {
                    e.preventDefault();
                    let jsonOutput = null;
                    try {
                      jsonOutput = EJSON.parse(jsonQueryString);
                    } catch (e2) {
                      setErrorJsonQueryString(e2.message);
                      return;
                    }
                    setErrorJsonQueryString("");
                    setCurrenPage({ ...currentPage, page: 1 });
                    fetcher.submit(
                      {
                        query: jsonQueryString
                      },
                      {
                        method: "POST",
                        encType: "application/json",
                        action: `/database/${params.db}/${params.col}`
                      }
                    );
                  },
                  children: "Execute"
                }
              ),
              errorJsonQueryString != "" && /* @__PURE__ */ jsx(AlertMessage, { message: errorJsonQueryString, onClose: () => setErrorJsonQueryString("") })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-3 bg-neutral-100", children: /* @__PURE__ */ jsx(Accordion, { type: "multiple", children: /* @__PURE__ */ jsxs(AccordionItem, { value: "statistics", className: "pr-0 ", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "px-4 border-t border-solid border-neutral-200", children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Statistics" }) }),
        /* @__PURE__ */ jsx(AccordionContent, { className: "px-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start w-full pb-4 lg:flex-row", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsx(Table, { className: "text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Namespace" }),
              /* @__PURE__ */ jsx(TableCell, { children: stats.ns })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Host" }),
              /* @__PURE__ */ jsx(TableCell, { children: stats.host })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Local Time" }),
              /* @__PURE__ */ jsx(TableCell, { children: stats.localTime })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Reads Latency" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.latencyStats?.reads.latency),
                " ms"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Writes Latency" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.latencyStats?.writes.latency),
                " ms"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Commands Latency" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.latencyStats?.commands.latency),
                " ms"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Transactions Latency" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.latencyStats?.transactions.latency),
                " ms"
              ] })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsx(Table, { className: "mt-4 text-md lg:mt-0", children: /* @__PURE__ */ jsxs(TableBody, { children: [
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Storage Size" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.storageStats?.storageSize),
                " B"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Total Index Size" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.storageStats?.totalIndexSize),
                " B"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Total Size" }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                numberWithCommas(stats.storageStats?.totalSize),
                " B"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Count" }),
              /* @__PURE__ */ jsx(TableCell, { children: stats.storageStats?.count })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Collection Scans Total" }),
              /* @__PURE__ */ jsx(TableCell, { children: numberWithCommas(stats.queryExecStats?.collectionScans.total) })
            ] }),
            /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: "Collection Scans Non-Tailable" }),
              /* @__PURE__ */ jsx(TableCell, { children: numberWithCommas(stats.queryExecStats?.collectionScans.nonTailable) })
            ] })
          ] }) }) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "w-full min-h-72", children: items })
    ] }),
    /* @__PURE__ */ jsx(
      Pagination,
      {
        className: "mt-3 mb-10 text-sm",
        backwardText: "Previous page",
        forwardText: "Next page",
        itemsPerPageText: "Items per page:",
        onChange: ({ page, pageSize }) => {
          setCurrenPage({ page, pageSize });
        },
        page: Math.floor(pagination.skip / pagination.limit) + 1,
        pageSize: Number(pagination.limit),
        pageSizes: [10, 20, 30, 40, 50, 100, 500],
        size: "md",
        totalItems: count
      }
    ),
    /* @__PURE__ */ jsx(
      CollectionDeleteModal,
      {
        open: isDelete,
        onClose: () => setIsDelete(false),
        collectionName: title,
        dbName: params.db,
        onSuccess: () => {
          setIsDelete(false);
          navigate(`/database/${params.db}`);
        }
      }
    )
  ] });
}

const route2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  IdeWithAutocomplete,
  action: action$6,
  default: CollectionPage,
  loader: loader$8
}, Symbol.toStringTag, { value: 'Module' }));

const loader$7 = async ({ request, params }) => {
  const session = await getUserSession(request);
  const connection = session.get("connection");
  let mongo;
  try {
    mongo = await connect(connection);
    const databases = await mongo.getDatabasesWithDetails();
    if (databases) {
      databases.operationTime = databases.operationTime ? convertMongoTimestamp(databases.operationTime) : null;
    }
    return Response.json(
      { status: "success", stats: databases },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return Response.json({ status: "error", error: error.message }, { status: 500 });
  }
};
const validate$1 = ({ dbName, collectionName }) => {
  const errors = {};
  if (!dbName || dbName.trim() == "" || !isValidDatabaseName(dbName)) {
    errors["dbName"] = "The database name is invalid";
  }
  if (!collectionName || collectionName.trim() == "" || !isValidCollectionName(collectionName)) {
    errors["collectionName"] = "The collection name is invalid";
  }
  return errors;
};
const action$5 = async ({ request }) => {
  try {
    const jsonQuery = await request.json();
    if (!jsonQuery) {
      return Response.json({ status: "error", message: "Invalid submission" }, { status: 500 });
    }
    if (jsonQuery.create) {
      const errors = validate$1(jsonQuery.create);
      if (Object.keys(errors).length > 0) {
        return Response.json({ status: "error", message: "Please specify a valid name for the database and the collection to be created", errors }, { status: 500 });
      }
      const { dbName, collectionName } = jsonQuery.create;
      const session = await getUserSession(request);
      const connection = session.get("connection");
      let mongo;
      mongo = await connect(connection);
      const database = new Database(mongo, config);
      await database.createDatabase(dbName, collectionName);
      return Response.json({ status: "success", message: "Database is created" }, { status: 200 });
    } else if (jsonQuery.delete) {
      const { name } = jsonQuery.delete;
      if (!name || typeof name != "string" || !isValidDatabaseName(name)) {
        return Response.json({ status: "error", message: "Invalid database" }, { status: 500 });
      }
      const session = await getUserSession(request);
      const connection = session.get("connection");
      let mongo;
      mongo = await connect(connection);
      const database = new Database(mongo, config);
      await database.deleteDatabase(name);
      return Response.json({ status: "success", message: "Database is deleted" }, { status: 200 });
    }
  } catch (e) {
    return Response.json({ status: "error", message: e.message }, { status: 500 });
  }
};
var sortingSelect = /* @__PURE__ */ ((sortingSelect2) => {
  sortingSelect2["name"] = "Name";
  sortingSelect2["sizeOnDisk"] = "Size on Disk";
  sortingSelect2["empty"] = "Empty";
  return sortingSelect2;
})(sortingSelect || {});
function DatabasePage() {
  const loaderData = useLoaderData();
  const [sort, setSort] = useState("");
  const [direction, setDirection] = useState("asc");
  const [isDelete, setIsDelete] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const stats = loaderData?.stats;
  if (loaderData?.error) {
    return /* @__PURE__ */ jsxs(Alert, { children: [
      /* @__PURE__ */ jsx(AlertTitle, { children: "An error occurred while fetching the database stats." }),
      /* @__PURE__ */ jsx(AlertDescription, { children: loaderData.error })
    ] });
  }
  if (!stats) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  switch (sort) {
    case "name":
      if (direction == "desc") {
        stats.databases.sort((a, b) => b.name.localeCompare(a.name));
      } else {
        stats.databases.sort((a, b) => a.name.localeCompare(b.name));
      }
      break;
    case "sizeOnDisk":
      if (direction == "desc") {
        stats.databases.sort((b, a) => a.sizeOnDisk - b.sizeOnDisk);
      } else {
        stats.databases.sort((a, b) => a.sizeOnDisk - b.sizeOnDisk);
      }
      break;
    case "empty":
      if (direction == "desc") {
        stats.databases.sort((b, a) => a.empty - b.empty);
      } else {
        stats.databases.sort((a, b) => a.empty - b.empty);
      }
      break;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "database-page", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Title, { title: stats.databases.length, children: [
            /* @__PURE__ */ jsx("span", { className: "font-normal opacity-50", children: "Databases:" }),
            " ",
            stats.databases.length
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
            "Total Size: ",
            convertBytes(stats.totalSize)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            SearchInput,
            {
              placeholder: "Find a database",
              value: search,
              className: "bg-neutral-100",
              id: "search-database",
              onChange: (v) => {
                setSearch(v);
              }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Sort:" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              onValueChange: (value) => {
                setSort(value);
              },
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: sort == "" ? "---" : sortingSelect[sort] }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: Object.keys(sortingSelect).map((key) => {
                  return /* @__PURE__ */ jsx(SelectItem, { value: key, children: sortingSelect[key] }, key);
                }) })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              hasIconOnly: true,
              size: "lg",
              variant: "ghost",
              icon: direction == "asc" ? /* @__PURE__ */ jsx(SortAscIcon, {}) : /* @__PURE__ */ jsx(SortDescIcon, {}),
              tooltip: "Sort Direction",
              onClick: (e) => {
                e.preventDefault();
                setDirection(direction == "asc" ? "desc" : "asc");
              }
            }
          )
        ] })
      ] }),
      stats.databases.map((database, index) => {
        if (search && search.trim() != "" && !(database.name.toLowerCase().indexOf(search.toLowerCase()) == 0)) {
          return null;
        }
        return /* @__PURE__ */ jsxs("div", { className: "mb-3 bg-neutral-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2 text-base border-b border-solid border-neutral-200", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(DatabaseIcon, {}),
              " ",
              /* @__PURE__ */ jsx("strong", { children: database.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "error",
                  icon: /* @__PURE__ */ jsx(TrashIcon, {}),
                  size: "sm",
                  onClick: (e) => {
                    e.preventDefault();
                    setIsDelete(database.name);
                  },
                  children: "Drop Database"
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "secondary", iconPosition: "right", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), size: "sm", href: `/database/${database.name}`, children: "View" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5 px-4 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Size on Disk:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: convertBytes(database.sizeOnDisk) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "block mb-1 font-bold", children: "Empty:" }),
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: database.empty ? "Yes" : "No" })
            ] })
          ] })
        ] }, index);
      })
    ] }) }),
    /* @__PURE__ */ jsx(
      DatabaseDeleteModal,
      {
        open: !(isDelete == null || isDelete == ""),
        onClose: () => {
          setIsDelete(null);
        },
        onSuccess: () => {
          setIsDelete(null);
          navigate(`/database`, { replace: true });
        },
        name: isDelete || ""
      }
    )
  ] });
}

const route3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: DatabasePage,
  loader: loader$7
}, Symbol.toStringTag, { value: 'Module' }));

const CheckboxNative = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      ref,
      className: cn(
        "peer h-4 w-4 shrink-0  border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) })
    }
  )
);
const Checkbox = React.forwardRef(
  ({ className, helperText, labelText, onChange, invalid, invalidText, hideLabel, readOnly, title = "", warn, warnText, ...other }, ref) => {
    const showWarning = !readOnly && !invalid && warn;
    const showHelper = !invalid && !warn;
    const helper = helperText ? /* @__PURE__ */ jsx("div", { className: `text-xs text-black opacity-50`, children: helperText }) : null;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(
        CheckboxNative,
        {
          ...other,
          "data-invalid": invalid ? true : void 0,
          className: "mt-0.5" + (invalid ? " border-red-500" : ""),
          onCheckedChange: (checked) => {
            if (!readOnly && onChange) {
              onChange(!!checked);
            }
          },
          ref: (el) => {
            if (typeof ref === "function") {
              ref(el);
            } else if (ref && "current" in ref) {
              ref.current = el;
            }
          },
          "aria-readonly": readOnly
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: `flex flex-col`, children: [
        /* @__PURE__ */ jsx("label", { className: `text-sm tracking-wide`, title, children: labelText }),
        /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-2`, children: [
          !readOnly && invalid && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: `text-red-500 `, children: invalidText }) }),
          showWarning && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: `text-yellow-500 `, children: warnText }) })
        ] }),
        showHelper && helper
      ] })
    ] });
  }
);

const ConnectionDeleteModal = ({ open, onClose, onSuccess, id }) => {
  const fetcher = useFetcher();
  const [status, setStatus] = useState("inactive");
  const [description, setDescription] = useState("Deleting...");
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription("Deleted!");
      setStatus("finished");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      setStatus("error");
      setTimeout(() => {
        setStatus("inactive");
        setDescription("Deleting...");
      }, 2e3);
    }
  }, [fetcher.data]);
  const submitDelete = async () => {
    setStatus("active");
    fetcher.submit(
      {
        delete: { id }
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/connections`
      }
    );
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      danger: true,
      loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
      loadingDescription: description,
      modalHeading: "Delete Connection",
      modalLabel: "Database Connection",
      primaryButtonText: "Yes",
      secondaryButtonText: "No",
      onClose,
      onPrimaryClick: submitDelete,
      onSecondaryClick: onClose,
      children: /* @__PURE__ */ jsx("h3", { children: "Are you sure you want to delete this connection?" })
    }
  );
};
const ConnectionModal = ({ open, onClose, onSuccess, mode = "add", initialData = null }) => {
  const [state, setState] = useState(
    initialData ?? {
      id: void 0,
      allowDiskUse: true,
      name: "",
      connectionString: "",
      tls: false,
      tlsAllowInvalidCertificates: true,
      tlsCAFile: "",
      tlsCertificateKeyFile: "",
      tlsCertificateKeyFilePassword: "",
      maxPoolSize: 4,
      whitelist: "",
      blacklist: ""
    }
  );
  const [errors, setErrors] = useState({});
  const fetcher = useFetcher();
  useEffect(() => {
    setState(
      initialData ?? {
        id: void 0,
        allowDiskUse: true,
        name: "",
        connectionString: "",
        tls: false,
        tlsAllowInvalidCertificates: true,
        tlsCAFile: "",
        tlsCertificateKeyFile: "",
        tlsCertificateKeyFilePassword: "",
        maxPoolSize: 4,
        whitelist: "",
        blacklist: ""
      }
    );
  }, [initialData]);
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      setDescription(mode == "edit" ? "Updated" : "Connected!");
      toast({
        title: mode == "edit" ? "Updated" : "Connected!",
        type: "background"
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2e3);
    } else if (fetcher.data && fetcher.data.status == "error") {
      setDescription(fetcher.data.message || "");
      setErrors(fetcher.data.errors || {});
      toast({
        title: "Error",
        description: fetcher.data.message || "An error occurred",
        variant: "error"
      });
    }
  }, [fetcher.data]);
  const [description, setDescription] = useState("Connecting...");
  const [modalDelete, setModalDelete] = useState(false);
  const submit = async () => {
    fetcher.submit(
      {
        [mode]: state
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/connections`
      }
    );
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Modal,
      {
        open,
        danger: mode == "edit",
        onClose,
        onPrimaryClick: mode == "edit" ? () => {
          setModalDelete(true);
        } : submit,
        loading: fetcher.state == "loading" || fetcher.state == "submitting" ? true : false,
        loadingDescription: description,
        modalHeading: mode == "edit" ? `Update Connection` : "Create a new database connection",
        modalLabel: "Database Connection",
        onSecondaryClick: mode == "edit" ? submit : void 0,
        primaryButtonText: mode == "edit" ? "Delete" : "Create",
        secondaryButtonText: mode == "edit" ? "Update" : "Cancel",
        children: /* @__PURE__ */ jsx(Form, { "aria-label": "Database Connection form", autoComplete: "new-password", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              labelText: "Name",
              type: "text",
              autoComplete: "new-password",
              required: true,
              invalid: errors["name"],
              invalidText: errors["name"],
              helperText: "Enter a name for this connection",
              value: state.name,
              onChange: (e) => {
                setState({ ...state, name: e.target.value });
              }
            }
          ),
          /* @__PURE__ */ jsx("hr", {}),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "connectionString",
                labelText: "Connection String",
                autoComplete: "new-password",
                type: "text",
                required: true,
                invalid: errors["connectionString"],
                invalidText: errors["connectionString"],
                helperText: "ex: mongodb:// or mongodb+srv:// [username:password@]host[/[defaultauthdb][?options]]",
                value: state.connectionString,
                onChange: (e) => {
                  setState({ ...state, connectionString: e.target.value });
                }
              }
            ),
            /* @__PURE__ */ jsx("a", { className: "text-xs text-blue-600 hover:underline", target: "_blank", href: "https://www.mongodb.com/docs/manual/reference/connection-string/", children: "View Documentation" }),
            /* @__PURE__ */ jsxs("small", { className: "block mt-1", children: [
              /* @__PURE__ */ jsx("b", { children: "*" }),
              "Use ",
              /* @__PURE__ */ jsx("b", { children: '"directConnection=true"' }),
              " parameter to run operations on host",
              " ",
              /* @__PURE__ */ jsx("a", { className: "text-blue-600 hover:underline", target: "_blank", href: "https://www.mongodb.com/docs/drivers/node/v3.6/fundamentals/connection/connect/", children: "View More" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              labelText: "TLS",
              helperText: "set to true to enable TLS/SSL",
              checked: state.tls,
              onChange: (checked) => {
                setState({ ...state, tls: checked });
              }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4" + (state.tls ? "" : " hidden"), children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                labelText: "TLS Allow Invalid Certificates",
                helperText: "validate mongod server certificate against CA",
                checked: state.tlsAllowInvalidCertificates,
                onChange: (checked) => {
                  setState({ ...state, tlsAllowInvalidCertificates: checked });
                },
                disabled: !state.tls
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "tlsCAFile",
                labelText: "TLS CA File",
                autoComplete: "new-password",
                type: "text",
                required: true,
                invalid: errors["tlsCAFile"],
                invalidText: errors["tlsCAFile"],
                disabled: !state.tls,
                value: state.tlsCAFile,
                onChange: (e) => {
                  setState({ ...state, tlsCAFile: e.target.value });
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "tlsCertificateKeyFile",
                autoComplete: "new-password",
                labelText: "TLS Certificate Key File",
                type: "text",
                required: true,
                invalid: errors["tlsCertificateKeyFile"],
                invalidText: errors["tlsCertificateKeyFile"],
                disabled: !state.tls,
                value: state.tlsCertificateKeyFile,
                onChange: (e) => {
                  setState({ ...state, tlsCertificateKeyFile: e.target.value });
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "tlsCertificateKeyFilePassword",
                labelText: "TLS Certificate Key File Password",
                type: "password",
                autoComplete: "new-password",
                required: true,
                invalid: errors["tlsCertificateKeyFilePassword"],
                invalidText: errors["tlsCertificateKeyFilePassword"],
                disabled: !state.tls,
                value: state.tlsCertificateKeyFilePassword,
                onChange: (e) => {
                  setState({ ...state, tlsCertificateKeyFilePassword: e.target.value });
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "maxPoolSize",
              labelText: "Max Pool Size",
              type: "number",
              min: 1,
              max: 100,
              value: state.maxPoolSize,
              onChange: (e) => {
                setState({ ...state, maxPoolSize: Number(e.target.value) });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "whitelist",
              autoComplete: "new-password",
              labelText: "Whitelist",
              type: "text",
              invalid: false,
              invalidText: "",
              helperText: "Comma separated list of databases (case sensitive)",
              value: state.whitelist,
              onChange: (e) => {
                setState({ ...state, whitelist: e.target.value });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "blacklist",
              autoComplete: "new-password",
              labelText: "Blacklist",
              type: "text",
              helperText: "Comma separated list of databases (case sensitive)",
              invalid: false,
              invalidText: "",
              value: state.blacklist,
              onChange: (e) => {
                setState({ ...state, blacklist: e.target.value });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              labelText: "Allow Disk Use",
              helperText: "set to true to remove the limit of 100 MB of RAM on each aggregation pipeline stage",
              checked: state.allowDiskUse,
              onChange: (checked) => {
                setState({ ...state, allowDiskUse: checked });
              }
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ jsx(
      ConnectionDeleteModal,
      {
        open: modalDelete,
        onClose: () => setModalDelete(false),
        onSuccess: () => {
          onSuccess();
          onClose();
        },
        id: state.id
      }
    )
  ] });
};
const SwitchConnection = ({ current, connections }) => {
  const fetcher = useFetcher();
  const [selectedConnection, setSelectedConnection] = useState(current);
  useEffect(() => {
    if (selectedConnection && (fetcher.state == "submitting" || fetcher.state == "loading")) {
      const connection = connections.find((c) => c.id == selectedConnection.id);
      if (connection) {
        toast({
          title: "Connecting, Please wait...",
          description: `Connecting to "${connection.name}"`,
          variant: "default"
        });
      }
    }
  }, [fetcher.state]);
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      window.location.href = fetcher.data.redirect || "/";
    } else if (fetcher.data && fetcher.data.status == "error") {
      toast({
        title: "Error",
        description: fetcher.data.message,
        variant: "error"
      });
    }
  }, [fetcher.data]);
  const onChange = (selectedItem) => {
    if (!selectedItem || !selectedItem.id) {
      return;
    }
    const connection = connections.find((c) => c.id == selectedItem.id);
    if (connection) {
      setSelectedConnection(connection);
      fetcher.submit(
        {
          connect: { id: connection.id }
        },
        {
          method: "POST",
          encType: "application/json",
          action: `/connections`
        }
      );
    }
  };
  let items = connections || [];
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    Select,
    {
      onValueChange: (value) => {
        if (value == "new") {
          window.location.href = `/connections`;
          return;
        }
        onChange(items.find((item) => item.id == value));
      },
      value: current ? current.id : null,
      children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, { children: current?.name || "Select a connection" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { className: "bg-white", children: [
          items.map((item) => {
            return /* @__PURE__ */ jsx(SelectItem, { value: item.id, children: item.name }, item.id);
          }),
          /* @__PURE__ */ jsxs(SelectGroup, { children: [
            /* @__PURE__ */ jsx(SelectLabel, { className: "mt-5 text-xs font-normal uppercase opacity-50", children: "New Connection" }),
            /* @__PURE__ */ jsx(SelectItem, { className: "text-sm", value: "new", children: "Add New Connection" })
          ] })
        ] })
      ]
    }
  ) });
};

const Logo = ({ className }) => {
  return /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 362 55", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M340.482 43V24.152C340.482 22.8293 340.301 21.688 339.938 20.728C339.597 19.768 339.021 19.0213 338.21 18.488C337.399 17.9547 336.29 17.688 334.882 17.688C333.645 17.688 332.557 17.912 331.618 18.36C330.701 18.808 329.943 19.416 329.346 20.184C328.77 20.9307 328.333 21.784 328.034 22.744L326.754 18.264H328.29C328.631 16.8773 329.197 15.6293 329.986 14.52C330.797 13.4107 331.885 12.536 333.25 11.896C334.637 11.2347 336.365 10.904 338.434 10.904C340.845 10.904 342.797 11.3627 344.29 12.28C345.783 13.176 346.882 14.52 347.586 16.312C348.311 18.104 348.674 20.3227 348.674 22.968V43H340.482ZM320.034 43V11.608H328.226L327.906 19.256L328.226 19.928V43H320.034Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M299.291 43.864C294.427 43.864 290.736 42.616 288.219 40.12C285.723 37.624 284.475 34.072 284.475 29.464V25.208C284.475 20.5787 285.723 17.016 288.219 14.52C290.736 12.0027 294.427 10.744 299.291 10.744C304.134 10.744 307.803 12.0027 310.299 14.52C312.795 17.016 314.043 20.5787 314.043 25.208V29.464C314.043 34.072 312.795 37.624 310.299 40.12C307.824 42.616 304.155 43.864 299.291 43.864ZM299.291 37.304C301.424 37.304 303.046 36.664 304.155 35.384C305.286 34.104 305.851 32.2693 305.851 29.88V24.792C305.851 22.36 305.286 20.504 304.155 19.224C303.046 17.9227 301.424 17.272 299.291 17.272C297.136 17.272 295.494 17.9227 294.363 19.224C293.254 20.504 292.699 22.36 292.699 24.792V29.88C292.699 32.2693 293.254 34.104 294.363 35.384C295.494 36.664 297.136 37.304 299.291 37.304Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M268.017 43.736C266.139 43.736 264.539 43.4373 263.217 42.84C261.915 42.2213 260.859 41.3573 260.049 40.248C259.259 39.1387 258.694 37.8373 258.353 36.344H256.017L258.129 30.072C258.193 31.5653 258.513 32.824 259.089 33.848C259.665 34.872 260.465 35.64 261.489 36.152C262.513 36.664 263.697 36.92 265.041 36.92C267.11 36.92 268.678 36.3227 269.745 35.128C270.811 33.912 271.345 32.0987 271.345 29.688V24.6C271.345 22.2533 270.811 20.4827 269.745 19.288C268.678 18.0933 267.11 17.496 265.041 17.496C263.825 17.496 262.737 17.7307 261.777 18.2C260.817 18.648 260.017 19.256 259.377 20.024C258.737 20.792 258.278 21.6773 258.001 22.68L256.145 18.264H258.449C258.79 16.8987 259.334 15.6613 260.081 14.552C260.827 13.4213 261.862 12.536 263.185 11.896C264.529 11.2347 266.235 10.904 268.305 10.904C271.995 10.904 274.801 12.0987 276.721 14.488C278.641 16.856 279.601 20.3653 279.601 25.016V29.368C279.601 34.0613 278.63 37.6347 276.689 40.088C274.747 42.52 271.857 43.736 268.017 43.736ZM250.097 43V0.695999H258.257V10.36L258.097 19.928L258.129 20.92V33.368L258.001 35.32L258.289 43H250.097Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M233.252 24.76L231.172 19.288H233.156C233.732 16.7493 234.777 14.7547 236.292 13.304C237.807 11.8533 239.908 11.128 242.596 11.128C243.151 11.128 243.652 11.1707 244.1 11.256C244.548 11.32 244.953 11.4053 245.316 11.512L245.764 19.704C245.295 19.5547 244.751 19.448 244.132 19.384C243.513 19.2987 242.863 19.256 242.18 19.256C240.004 19.256 238.148 19.736 236.612 20.696C235.097 21.656 233.977 23.0107 233.252 24.76ZM225.284 43V11.608H233.092L232.74 21.24L233.476 21.528V43H225.284Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M210.46 43L210.748 35.32L210.524 34.616V24.792L210.492 23.384C210.492 21.336 209.927 19.832 208.796 18.872C207.687 17.912 205.863 17.432 203.324 17.432C201.169 17.432 199.143 17.72 197.244 18.296C195.367 18.8507 193.628 19.5013 192.028 20.248L192.732 13.72C193.671 13.2293 194.737 12.7707 195.932 12.344C197.148 11.896 198.503 11.5333 199.996 11.256C201.489 10.9787 203.1 10.84 204.828 10.84C207.388 10.84 209.553 11.1493 211.324 11.768C213.095 12.3653 214.503 13.2293 215.548 14.36C216.615 15.4907 217.383 16.8453 217.852 18.424C218.321 19.9813 218.556 21.7093 218.556 23.608V43H210.46ZM200.188 43.736C197.073 43.736 194.695 42.9573 193.052 41.4C191.431 39.8427 190.62 37.624 190.62 34.744V33.848C190.62 30.7973 191.559 28.5467 193.436 27.096C195.313 25.624 198.289 24.6107 202.364 24.056L211.26 22.84L211.74 28.12L203.548 29.304C201.756 29.5387 200.476 29.9653 199.708 30.584C198.961 31.2027 198.588 32.1093 198.588 33.304V33.624C198.588 34.7973 198.951 35.7147 199.676 36.376C200.423 37.016 201.585 37.336 203.164 37.336C204.572 37.336 205.777 37.112 206.78 36.664C207.783 36.216 208.604 35.6293 209.244 34.904C209.905 34.1573 210.375 33.3253 210.652 32.408L211.804 36.472H210.396C210.055 37.816 209.5 39.0427 208.732 40.152C207.985 41.24 206.929 42.1147 205.564 42.776C204.199 43.416 202.407 43.736 200.188 43.736Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M175.121 43.864C169.574 43.864 165.425 42.36 162.673 39.352C159.942 36.344 158.577 32.0667 158.577 26.52V18.456C158.577 12.952 159.942 8.70666 162.673 5.71999C165.425 2.73332 169.564 1.23999 175.089 1.23999C176.668 1.23999 178.108 1.36799 179.409 1.62399C180.71 1.87999 181.884 2.22132 182.929 2.64799C183.996 3.05332 184.924 3.50132 185.713 3.99199L186.353 11.384C185.094 10.616 183.676 9.95466 182.097 9.39999C180.518 8.84532 178.673 8.56799 176.561 8.56799C173.404 8.56799 171.046 9.45332 169.489 11.224C167.932 12.9947 167.153 15.4907 167.153 18.712V26.2C167.153 29.4 167.942 31.896 169.521 33.688C171.1 35.4587 173.542 36.344 176.849 36.344C178.918 36.344 180.753 36.0667 182.353 35.512C183.953 34.9573 185.393 34.2747 186.673 33.464L186.033 40.984C185.265 41.4747 184.337 41.944 183.249 42.392C182.161 42.8187 180.934 43.1707 179.569 43.448C178.225 43.7253 176.742 43.864 175.121 43.864Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M142.416 43.736C138.426 43.736 135.397 42.584 133.328 40.28C131.258 37.976 130.224 34.6693 130.224 30.36V24.504C130.224 20.1947 131.258 16.8987 133.328 14.616C135.418 12.3333 138.448 11.192 142.416 11.192C146.384 11.192 149.402 12.3333 151.472 14.616C153.562 16.8987 154.608 20.1947 154.608 24.504V30.36C154.608 34.6693 153.562 37.976 151.472 40.28C149.402 42.584 146.384 43.736 142.416 43.736ZM142.416 42.68C145.978 42.68 148.698 41.624 150.576 39.512C152.474 37.4 153.424 34.3493 153.424 30.36V24.504C153.424 20.536 152.485 17.5067 150.608 15.416C148.73 13.304 146 12.248 142.416 12.248C138.832 12.248 136.101 13.304 134.224 15.416C132.346 17.5067 131.408 20.536 131.408 24.504V30.36C131.408 34.3493 132.346 37.4 134.224 39.512C136.101 41.624 138.832 42.68 142.416 42.68Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M113.505 34.168C109.75 34.168 106.859 33.2827 104.833 31.512C102.827 29.7413 101.825 27.128 101.825 23.672V21.944C101.825 19.9173 102.209 18.1253 102.977 16.568C103.745 15.0107 104.961 13.7733 106.625 12.856C108.31 11.9387 110.507 11.4587 113.217 11.416L127.905 11.128V12.248L115.937 12.12L115.905 11.96C118.23 12.1947 120.054 12.7707 121.377 13.688C122.721 14.584 123.67 15.736 124.225 17.144C124.801 18.552 125.089 20.1307 125.089 21.88V23.768C125.089 27.224 124.107 29.8267 122.145 31.576C120.182 33.304 117.302 34.168 113.505 34.168ZM113.345 53.752H113.889C116.193 53.752 118.23 53.56 120.001 53.176C121.771 52.8133 123.158 52.1947 124.161 51.32C125.185 50.4667 125.697 49.304 125.697 47.832V47.704C125.697 46.0827 125.099 44.792 123.905 43.832C122.731 42.8933 120.758 42.3173 117.985 42.104L109.825 41.464L110.881 41.432C109.089 41.6453 107.499 41.9867 106.113 42.456C104.747 42.9253 103.67 43.5867 102.881 44.44C102.113 45.2933 101.729 46.392 101.729 47.736V47.832C101.729 49.3467 102.219 50.5307 103.201 51.384C104.203 52.2587 105.579 52.8667 107.329 53.208C109.078 53.5707 111.083 53.752 113.345 53.752ZM113.345 54.84C110.827 54.84 108.609 54.6267 106.689 54.2C104.769 53.7733 103.265 53.048 102.177 52.024C101.089 51.0213 100.545 49.6453 100.545 47.896V47.768C100.545 46.2533 100.961 45.0267 101.793 44.088C102.625 43.1493 103.723 42.4453 105.089 41.976C106.454 41.4853 107.937 41.176 109.537 41.048L109.473 41.24C106.998 41.048 105.206 40.6 104.097 39.896C103.009 39.192 102.465 38.232 102.465 37.016V36.984C102.465 36.216 102.657 35.5653 103.041 35.032C103.425 34.4773 104.043 34.0507 104.897 33.752C105.771 33.4533 106.902 33.304 108.289 33.304V32.888L111.841 33.976H109.377C107.201 33.9973 105.686 34.2533 104.833 34.744C104.001 35.2347 103.585 35.96 103.585 36.92V36.952C103.585 37.9547 104.118 38.7333 105.185 39.288C106.251 39.8427 108.107 40.2373 110.753 40.472L118.145 41.112C121.259 41.3893 123.489 42.0827 124.833 43.192C126.198 44.3227 126.881 45.8053 126.881 47.64V47.768C126.881 49.496 126.326 50.872 125.217 51.896C124.129 52.9413 122.603 53.688 120.641 54.136C118.699 54.6053 116.449 54.84 113.889 54.84H113.345ZM113.505 33.112C115.787 33.112 117.697 32.76 119.233 32.056C120.769 31.352 121.931 30.3067 122.721 28.92C123.51 27.512 123.905 25.7947 123.905 23.768V21.88C123.905 19.896 123.521 18.2 122.753 16.792C121.985 15.384 120.843 14.3173 119.329 13.592C117.835 12.8453 115.979 12.472 113.761 12.472H113.441C110.966 12.472 108.961 12.8773 107.425 13.688C105.889 14.4987 104.769 15.6187 104.065 17.048C103.361 18.4773 103.009 20.1093 103.009 21.944V23.672C103.009 25.7413 103.393 27.48 104.161 28.888C104.95 30.2747 106.123 31.3307 107.681 32.056C109.238 32.76 111.179 33.112 113.505 33.112Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M94.3166 43V23.16C94.3166 20.8987 94.0073 18.968 93.3886 17.368C92.7913 15.768 91.8099 14.5413 90.4446 13.688C89.0793 12.8133 87.2553 12.376 84.9726 12.376C82.8606 12.376 81.0153 12.8027 79.4366 13.656C77.8793 14.488 76.6313 15.6507 75.6926 17.144C74.7539 18.616 74.1353 20.3013 73.8366 22.2L73.2606 20.984H73.6126C73.8046 19.2347 74.3593 17.6347 75.2766 16.184C76.2153 14.712 77.5059 13.5387 79.1486 12.664C80.7913 11.768 82.7539 11.32 85.0366 11.32C87.6179 11.32 89.6659 11.8 91.1806 12.76C92.7166 13.6987 93.8153 15.0533 94.4766 16.824C95.1593 18.5733 95.5006 20.664 95.5006 23.096V43H94.3166ZM72.8766 43V11.928H74.0606L73.9326 20.056H74.0606V43H72.8766Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M54.2831 43.736C50.2937 43.736 47.2644 42.584 45.1951 40.28C43.1257 37.976 42.0911 34.6693 42.0911 30.36V24.504C42.0911 20.1947 43.1257 16.8987 45.1951 14.616C47.2857 12.3333 50.3151 11.192 54.2831 11.192C58.2511 11.192 61.2697 12.3333 63.3391 14.616C65.4297 16.8987 66.4751 20.1947 66.4751 24.504V30.36C66.4751 34.6693 65.4297 37.976 63.3391 40.28C61.2697 42.584 58.2511 43.736 54.2831 43.736ZM54.2831 42.68C57.8457 42.68 60.5657 41.624 62.4431 39.512C64.3417 37.4 65.2911 34.3493 65.2911 30.36V24.504C65.2911 20.536 64.3524 17.5067 62.4751 15.416C60.5977 13.304 57.8671 12.248 54.2831 12.248C50.6991 12.248 47.9684 13.304 46.0911 15.416C44.2137 17.5067 43.2751 20.536 43.2751 24.504V30.36C43.2751 34.3493 44.2137 37.4 46.0911 39.512C47.9684 41.624 50.6991 42.68 54.2831 42.68Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M0.0240479 43L2.00805 2.104H4.69605L17.656 37.304H18.2L31.16 2.104H33.8801L35.832 43H34.5841L33.6561 22.456L32.76 3.16001H32.024L19.096 38.36H16.76L3.83205 3.16001H3.12805L2.23205 22.488L1.30405 43H0.0240479Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M354.196 9L354.381 2.61H356.851L357.766 6.17H357.831L358.746 2.61H361.211L361.396 9H359.646L359.616 7.105L359.581 4.655H359.506L358.576 8.245H357.016L356.081 4.655H356.001L355.971 7.11L355.946 9H354.196Z",
        fill: "black"
      }
    ),
    /* @__PURE__ */ jsx("path", { d: "M350.085 9V2.965H351.9V9H350.085ZM348.37 4.115V2.61H353.61V4.115H348.37Z", fill: "black" })
  ] });
};

const ActionableNotification = ({ title, variant, subtitle, closeOnEscape = true, inline = true, onClose }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (closeOnEscape) {
      const handleKeyDown = (event) => {
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
  return /* @__PURE__ */ jsx(Alert, { ref, className: "bg-white " + (inline ? "inline-block" : "block"), variant, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(AlertTitle, { children: title }),
      subtitle ? /* @__PURE__ */ jsx("p", { children: subtitle }) : null
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "ml-4 -mt-1 -mr-2", children: /* @__PURE__ */ jsx(XIcon, { className: "w-4 h-4" }) })
  ] }) });
};

const loader$6 = async ({ request }) => {
  const user = await requireUser(request, "/login?redirect=/profile");
  const connections = await getUserDbConnections(user.id);
  const session = await getUserSession(request);
  const connection = session.get("connection");
  return Response.json(
    { current: connection, connections },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};
const validate = ({
  allowDiskUse,
  name,
  connectionString,
  tls,
  tlsAllowInvalidCertificates,
  tlsCAFile,
  tlsCertificateKeyFile,
  tlsCertificateKeyFilePassword,
  maxPoolSize,
  whitelist,
  blacklist
}) => {
  const errors = {};
  if (!name || name.trim() == "" || name.length < 3) {
    errors["name"] = "Name must be at least 3 characters long";
  }
  if (!connectionString || connectionString.trim() == "" || !validateMongoConnectionString(connectionString)) {
    errors["connectionString"] = "Invalid connection string";
  }
  if (tls) {
    if (!tlsCAFile || tlsCAFile.trim() == "") {
      errors["tlsCAFile"] = "CA file is required";
    }
    if (!tlsCertificateKeyFile || tlsCertificateKeyFile.trim() == "") {
      errors["tlsCertificateKeyFile"] = "Certificate key file is required";
    }
    if (!tlsCertificateKeyFilePassword || tlsCertificateKeyFilePassword.trim() == "") {
      errors["tlsCertificateKeyFilePassword"] = "Certificate key file password is required";
    }
  }
  if (maxPoolSize < 0 || maxPoolSize > 100) {
    errors["maxPoolSize"] = "Max pool size must be between 0 and 100";
  }
  if (whitelist.trim() != "") {
    const dbs = whitelist.split(",");
    for (const db2 of dbs) {
      if (db2.trim() == "" || !isValidDatabaseName(db2)) {
        errors["whitelist"] = "Invalid database name";
        break;
      }
    }
  }
  if (blacklist.trim() != "") {
    const dbs = blacklist.split(",");
    for (const db2 of dbs) {
      if (db2.trim() == "" || !isValidDatabaseName(db2)) {
        errors["blacklist"] = "Invalid database name";
        break;
      }
    }
  }
  return errors;
};
const action$4 = async ({ request }) => {
  const jsonQuery = await request.json();
  if (jsonQuery.connect) {
    const { id } = jsonQuery.connect;
    if (!id || typeof id != "string") {
      return {
        status: "error",
        message: "Connection is invalid or doesn't exist"
      };
    }
    const userId = await getUserId(request);
    if (!userId || typeof userId != "string") {
      return {
        status: "error",
        message: "Your session expired, Please login again"
      };
    }
    try {
      const connection = await getUserDbConnection(userId, id);
      if (connection) {
        const mongo = await connect(connection);
        await mongo.getDatabases();
        const session = await getUserSession(request);
        session.set("connection", connection);
        return Response.json(
          {
            status: "success",
            redirect: "/"
          },
          {
            headers: {
              "Set-Cookie": await commitSession(session)
            }
          }
        );
      }
      return {
        status: "error",
        message: "Connection is invalid or doesn't exist"
      };
    } catch (e) {
      return {
        status: "error",
        message: e.message
      };
    }
  } else if (jsonQuery.add) {
    const {
      allowDiskUse,
      name,
      connectionString,
      tls,
      tlsAllowInvalidCertificates,
      tlsCAFile,
      tlsCertificateKeyFile,
      tlsCertificateKeyFilePassword,
      maxPoolSize,
      whitelist,
      blacklist
    } = jsonQuery.add;
    const errors = validate(jsonQuery.add);
    if (Object.keys(errors).length > 0) {
      return Response.json({
        status: "error",
        message: "Please fix the field errors and try again",
        errors
      });
    }
    const userId = await getUserId(request);
    if (!userId || typeof userId != "string") {
      return Response.json({
        status: "error",
        message: "Your session expired, Please login again"
      });
    }
    try {
      await connect({
        name: "admin",
        connectionString,
        tls,
        tlsAllowInvalidCertificates,
        tlsCAFile,
        tlsCertificateKeyFile,
        tlsCertificateKeyFilePassword,
        maxPoolSize,
        whitelist,
        blacklist,
        allowDiskUse
      });
      await addUserDbConnection(userId, {
        name,
        connectionString,
        tls,
        tlsAllowInvalidCertificates,
        tlsCAFile,
        tlsCertificateKeyFile,
        tlsCertificateKeyFilePassword,
        maxPoolSize,
        whitelist,
        blacklist,
        allowDiskUse
      });
      return Response.json({
        status: "success",
        message: "Connection added successfully"
      });
    } catch (e) {
      return Response.json({
        status: "error",
        message: e.message
      });
    }
  } else if (jsonQuery.delete) {
    const { id } = jsonQuery.delete;
    if (!id || typeof id != "string") {
      return Response.json({
        status: "error",
        message: "Connection is invalid or doesn't exist"
      });
    }
    const userId = await getUserId(request);
    if (!userId || typeof userId != "string") {
      return Response.json({
        status: "error",
        message: "Your session expired, Please login again"
      });
    }
    try {
      await removeUserDbConnection(userId, id);
      return Response.json({
        status: "success",
        message: "Connection delete successfully"
      });
    } catch (e) {
      return Response.json({
        status: "error",
        message: e.message
      });
    }
  } else if (jsonQuery.edit) {
    const {
      id,
      allowDiskUse,
      name,
      connectionString,
      tls,
      tlsAllowInvalidCertificates,
      tlsCAFile,
      tlsCertificateKeyFile,
      tlsCertificateKeyFilePassword,
      maxPoolSize,
      whitelist,
      blacklist
    } = jsonQuery.edit;
    if (!id || typeof id != "string") {
      return Response.json({
        status: "error",
        message: "Connection is invalid or doesn't exist"
      });
    }
    const errors = validate(jsonQuery.edit);
    if (Object.keys(errors).length > 0) {
      return Response.json({
        status: "error",
        message: "Please fix the field errors and try again",
        errors
      });
    }
    const userId = await getUserId(request);
    if (!userId || typeof userId != "string") {
      return Response.json({
        status: "error",
        message: "Your session expired, Please login again"
      });
    }
    try {
      await connect({
        name,
        connectionString,
        tls,
        tlsAllowInvalidCertificates,
        tlsCAFile,
        tlsCertificateKeyFile,
        tlsCertificateKeyFilePassword,
        maxPoolSize,
        whitelist,
        blacklist,
        allowDiskUse
      });
      await updateUserDbConnection(userId, id, {
        name,
        connectionString,
        tls,
        tlsAllowInvalidCertificates,
        tlsCAFile,
        tlsCertificateKeyFile,
        tlsCertificateKeyFilePassword,
        maxPoolSize,
        whitelist,
        blacklist,
        allowDiskUse
      });
      return Response.json({
        status: "success",
        message: "Connection updated successfully"
      });
    } catch (e) {
      return Response.json({
        status: "error",
        message: e.message
      });
    }
  }
  return Response.json({ status: "error", message: "Invalid submit" });
};
function Dashboard$3() {
  const loaderData = useLoaderData();
  const { connections } = loaderData;
  const [error, setError] = React__default.useState(null);
  const [current, setCurrent] = React__default.useState(null);
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state == "submitting") {
      toast({
        duration: 1e4,
        type: "background",
        title: "Connecting, Please wait...",
        description: `Connecting to "${current?.name}"`,
        variant: "warning"
      });
    }
  }, [fetcher.state]);
  useEffect(() => {
    if (fetcher.data && fetcher.data.status == "success") {
      let redirectTo = fetcher.data.redirect || "/";
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1e3);
      return;
    } else if (fetcher.data && fetcher.data.status == "error") {
      setError(fetcher.data.message || null);
    }
    setCurrent(null);
  }, [fetcher.data]);
  const [connectionModal, setConnectionModal] = React__default.useState({
    mode: "add",
    open: false,
    connection: null
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 mx-auto my-16 mb-16 bg-white border border-solid border-neutral-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-4xl font-bold", children: /* @__PURE__ */ jsx(Logo, { className: "h-8" }) }),
      /* @__PURE__ */ jsx("p", { className: "mb-10 text-sm", children: "Welcome to MongoCarbon, Please select or create a new connection below:" }),
      /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "overflow-hidden ", children: connections.map((connection, index) => /* @__PURE__ */ jsxs(AccordionItem, { value: connection.id, title: connection.name, className: "bg-neutral-100", children: [
        /* @__PURE__ */ jsx(AccordionTrigger, { className: "px-4 border-t border-solid border-neutral-200", children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: connection.name }) }),
        /* @__PURE__ */ jsxs(AccordionContent, { className: "px-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 break-all", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col py-2 border-t border-b border-solid border-neutral-200", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Connection String:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: connection.connectionString })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex py-2 text-sm border-b border-solid border-neutral-200", children: [
              /* @__PURE__ */ jsx("span", { children: "Max Pool Size:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "ml-2", children: connection.maxPoolSize })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex py-2 text-sm border-b border-solid border-neutral-200", children: [
              /* @__PURE__ */ jsx("span", { children: "Allow Disk Use:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "ml-2", children: connection.allowDiskUse ? "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col py-2 text-sm border-b border-solid border-neutral-200", children: [
              /* @__PURE__ */ jsx("span", { children: "Whitelist:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "ml-2", children: connection.whitelist })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col py-2 text-sm border-b border-solid border-neutral-200", children: [
              /* @__PURE__ */ jsx("span", { children: "Blacklist:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "ml-2", children: connection.blacklist })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex w-full gap-2 mt-4", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "default",
                loading: !!current && current.id == connection.id,
                icon: /* @__PURE__ */ jsx(VersionsIcon, {}),
                onClick: () => {
                  setCurrent(connection);
                  fetcher.submit(
                    {
                      connect: connection
                    },
                    {
                      method: "POST",
                      encType: "application/json",
                      action: `/connections`
                    }
                  );
                },
                children: "Connect"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                icon: /* @__PURE__ */ jsx(PencilIcon, {}),
                onClick: () => {
                  setConnectionModal({ mode: "edit", open: true, connection });
                },
                className: "ml-auto",
                children: "Edit"
              }
            )
          ] })
        ] })
      ] }, `${connection.id}-${index}`)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: "secondary",
          icon: /* @__PURE__ */ jsx(VersionsIcon, {}),
          onClick: () => {
            setConnectionModal({ mode: "add", open: true, connection: null });
          },
          children: "Add Connection"
        }
      ) })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "fixed -translate-x-1/2 left-1/2 bottom-10", children: /* @__PURE__ */ jsx(ActionableNotification, { variant: "error", title: "Error", subtitle: error, closeOnEscape: true, inline: false, onClose: () => setError(null) }) }),
    /* @__PURE__ */ jsx(
      ConnectionModal,
      {
        open: connectionModal.open,
        mode: connectionModal.mode,
        initialData: connectionModal.connection,
        onSuccess: () => window.location.reload(),
        onClose: () => {
          setConnectionModal({ ...connectionModal, open: false, connection: null });
        }
      }
    )
  ] });
}

const route4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: Dashboard$3,
  loader: loader$6
}, Symbol.toStringTag, { value: 'Module' }));

const loader$5 = async ({ request }) => {
  const user = await requireUser(request, "/login?redirect=/profile");
  return Response.json(
    { user },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};
const action$3 = async ({ request }) => {
  const user = await requireUser(request, "/login?redirect=/profile");
  const formData = await request.formData();
  const password = formData.get("password");
  const confirm_password = formData.get("confirm_password");
  if (typeof password !== "string" || typeof confirm_password !== "string") {
    return Response.json({
      formError: `Please enter a valid password.`
    });
  }
  const fields = { password, confirm_password };
  const fieldErrors = {
    password: validatePassword(password)
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return Response.json({ fieldErrors, fields, formError: validatePassword(password) });
  }
  if (password !== confirm_password) {
    return Response.json({
      fields,
      formError: `Passwords do not match.`,
      fieldErrors: {
        confirm_password: "Confirm password do not match."
      }
    });
  }
  try {
    await updatePassword(user.id, password);
    await logout(request);
    return redirect("/");
  } catch (e) {
    return Response.json({
      fields,
      formError: e.message
    });
  }
};
function Dashboard$2() {
  const loaderData = useLoaderData();
  const [user, setUser] = useState(loaderData?.user);
  const navigate = useNavigate();
  const [state, setState] = useState({
    password: "",
    confirm_password: ""
  });
  const actionData = useActionData();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (actionData && actionData.formError) {
      setOpen(true);
    }
    if (actionData && actionData.fields) {
      setState(actionData.fields);
    }
  }, [actionData]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 mx-auto my-16 mb-16 bg-white border border-solid border-neutral-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-4xl font-bold", children: "Welcome" }),
      /* @__PURE__ */ jsx("p", { className: "mb-10 text-sm", children: "Please use the form below to update your profile" }),
      /* @__PURE__ */ jsxs(Form, { method: "post", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 mb-2", children: [
          /* @__PURE__ */ jsx(Input, { id: "username", name: "username", readOnly: true, labelText: "Username", type: "text", value: user.username, autoComplete: "new-password", required: true }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              name: "password",
              labelText: "Password",
              type: "password",
              value: state.password,
              onChange: (e) => {
                setState({ ...state, password: e.target.value });
              },
              required: true,
              autoComplete: "new-password",
              invalid: Boolean(actionData?.fieldErrors?.password) || void 0,
              invalidText: actionData?.fieldErrors?.password ? actionData?.fieldErrors?.password : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "confirm_password",
              name: "confirm_password",
              labelText: "Confirm Password",
              type: "password",
              value: state.confirm_password,
              onChange: (e) => {
                setState({ ...state, confirm_password: e.target.value });
              },
              required: true,
              autoComplete: "new-password",
              invalid: Boolean(actionData?.fieldErrors?.confirm_password) || void 0,
              invalidText: actionData?.fieldErrors?.confirm_password ? actionData?.fieldErrors?.confirm_password : void 0
            }
          ),
          /* @__PURE__ */ jsx(Button, { size: "sm", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), type: "submit", children: "Update" })
        ] }),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              className: "mt-4",
              size: "sm",
              icon: /* @__PURE__ */ jsx(PlusIcon, {}),
              type: "button",
              variant: "secondary",
              onClick: () => {
                navigate("/create");
              },
              children: "Add User"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              hasIconOnly: true,
              className: "mt-4",
              size: "sm",
              icon: /* @__PURE__ */ jsx(VersionsIcon, {}),
              type: "button",
              variant: "ghost",
              onClick: () => {
                navigate("/connections");
              },
              children: "Go to Connections"
            }
          )
        ] })
      ] })
    ] }),
    open && /* @__PURE__ */ jsx("div", { className: "fixed -translate-x-1/2 left-1/2 bottom-10", children: /* @__PURE__ */ jsx(ActionableNotification, { variant: "error", title: "Error", subtitle: actionData?.formError, closeOnEscape: true, inline: false, onClose: () => setOpen(false) }) })
  ] });
}

const route5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: Dashboard$2,
  loader: loader$5
}, Symbol.toStringTag, { value: 'Module' }));

const action$2 = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/";
  if (typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
    return Response.json({
      status: "error",
      message: `Form not submitted correctly.`
    });
  }
  const errors = {
    username: validateUsername(username),
    password: validatePassword(password)
  };
  if (Object.values(errors).some(Boolean)) {
    return Response.json({ status: "error", errors });
  }
  const userExists = await userDb.user.findFirst({
    where: { username }
  });
  if (userExists) {
    return Response.json({ status: "error", message: `User with username ${username} already exists` });
  }
  const user = await register({ username, password });
  if (!user) {
    return Response.json({ status: "error", message: `Something went wrong trying to create a new user.` });
  }
  return Response.json({ status: "success", message: `User Created` });
};
function CreateUserRoute() {
  const actionData = useActionData();
  const [open, setOpen] = React__default.useState(false);
  useEffect(() => {
    if (actionData && actionData.message) {
      setOpen(true);
    }
  }, [actionData]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center flex-1 w-full h-screen", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx(Logo, { className: "h-10 mx-auto" }),
      /* @__PURE__ */ jsxs("div", { className: "w-full p-10 mt-5 border border-solid border-neutral-200 bg-neutral-50", children: [
        /* @__PURE__ */ jsx("h3", { className: "block mb-1 text-2xl font-bold", children: "New user account" }),
        /* @__PURE__ */ jsx("small", { className: "block mb-4 text-xs opacity-50 leading-1", children: "This will not create a mongodb database user, it will only create a user to access MongoCarbon admin portal" }),
        /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-10", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "username",
              labelText: "Username",
              name: "username",
              type: "text",
              autoComplete: "new-password",
              required: true,
              invalid: Boolean(actionData?.fieldErrors?.username) || void 0,
              invalidText: actionData?.fieldErrors?.username ? actionData?.fieldErrors?.username : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              labelText: "Password",
              type: "password",
              name: "password",
              required: true,
              autoComplete: "new-password",
              pattern: "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}",
              invalid: Boolean(actionData?.fieldErrors?.password) || void 0,
              invalidText: actionData?.fieldErrors?.password ? actionData?.fieldErrors?.password : void 0
            }
          ),
          /* @__PURE__ */ jsx(Button, { size: "sm", type: "submit", icon: /* @__PURE__ */ jsx(PlusIcon, {}), children: "Create User" })
        ] }) })
      ] })
    ] }) }),
    open && /* @__PURE__ */ jsx("div", { className: "fixed -translate-x-1/2 left-1/2 bottom-10", children: /* @__PURE__ */ jsx(
      ActionableNotification,
      {
        variant: actionData?.status == "error" ? "error" : "success",
        title: actionData?.status == "error" ? "Error" : "Info",
        subtitle: actionData?.message,
        closeOnEscape: true,
        inline: false,
        onClose: () => setOpen(false)
      }
    ) })
  ] });
}

const route6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: CreateUserRoute
}, Symbol.toStringTag, { value: 'Module' }));

const loader$4 = async ({ request }) => {
  const session = await getUserSession(request);
  const connection = session.get("connection");
  let mongo;
  try {
    mongo = await connect(connection);
  } catch (error) {
    return Response.json({ status: "error", message: "Could not connect to MongoDB" }, { status: 500 });
  }
  const adminDb = mongo.mainClient?.adminDb || void 0;
  const info = await adminDb.serverStatus();
  return Response.json(
    { info, versions: process.versions },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};
function Dashboard$1() {
  const loaderData = useLoaderData();
  const info = loaderData?.info;
  const versions = loaderData?.versions;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "pb-4", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xl font-medium", children: "Server Information" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "Version: ",
        info.version
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col pb-4 lg:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full", children: [
        /* @__PURE__ */ jsx(Table, { className: "bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Hostname" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.host })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Uptime" }),
            /* @__PURE__ */ jsxs(TableCell, { className: "px-4 py-2", children: [
              info.uptime,
              " seconds ",
              info.uptime > 86400 ? `(${Math.floor(info.uptime / 86400)} days)` : null
            ] })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Server Time" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.localTime })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Current Connections" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.connections.current })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Active Clients" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.activeClients.total })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Clients Reading" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.activeClients.readers })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Read Lock Queue" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.currentQueue.readers })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Disk Flushes" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.backgroundFlushing ? info.backgroundFlushing.flushes : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Time Spent Flushing" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.backgroundFlushing ? `${info.backgroundFlushing.total_ms} ms` : "N/A" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Total Inserts" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.opcounters.insert })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Total Updates" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.opcounters.update })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full", children: [
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "MongoDB Version" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.version })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Node Version" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: versions.node })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "V8 Version" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: versions.v8 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Available Connections" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.connections.available })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Queued Operations" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.currentQueue.total })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Clients Writing" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.activeClients.writers })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Write Lock Queue" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.globalLock.currentQueue.writers })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Last Flush" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.backgroundFlushing ? info.backgroundFlushing.last_finished : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Average Flush Time" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.backgroundFlushing ? `${info.backgroundFlushing.average_ms} ms` : "N/A" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Table, { className: "flex-1 w-full mt-4 bg-neutral-100 text-md", children: /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Total Queries" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.opcounters.query })
          ] }),
          /* @__PURE__ */ jsxs(TableRow, { className: "border-b", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2 font-semibold", children: "Total Deletes" }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-2", children: info.opcounters.delete })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}

const route7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Dashboard$1,
  loader: loader$4
}, Symbol.toStringTag, { value: 'Module' }));

const action$1 = async ({ request }) => {
  return logout(request);
};
const loader$3 = async ({ request }) => {
  return logout(request);
};

const route8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$3
}, Symbol.toStringTag, { value: 'Module' }));

const name = "mongocarbon";
const version = "0.0.8";
const sideEffects = false;
const type = "module";
const scripts = {
	build: "run-s build:*",
	"build:css": "sass --quiet --load-path=node_modules/ app/:app/ --style=compressed --no-source-map",
	"build:remix": "remix vite:build",
	dev: "run-p dev:*",
	"dev:css": "sass --quiet --load-path=node_modules/ --watch app/:app/",
	"dev:remix": "remix vite:dev",
	prisma: "prisma generate && prisma db push",
	lint: "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
	start: "NODE_OPTIONS=--trace-warnings remix-serve ./build/server/index.js",
	typecheck: "tsc",
	preinstall: "echo \"Welcome to Mongo Carbon\"",
	postinstall: "npm run build && node console/install.js",
	test: "echo \"Error: No tests are added\""
};
const dependencies = {
	"@codeium/react-code-editor": "^1.0.12",
	"@json2csv/plainjs": "^7.0.6",
	"@primer/octicons-react": "^19.14.0",
	"@primer/react": "^37.8.0",
	"@prisma/client": "^6.0.0",
	"@radix-ui/react-accordion": "^1.2.2",
	"@radix-ui/react-alert-dialog": "^1.1.4",
	"@radix-ui/react-aspect-ratio": "^1.1.1",
	"@radix-ui/react-avatar": "^1.1.2",
	"@radix-ui/react-checkbox": "^1.1.3",
	"@radix-ui/react-collapsible": "^1.1.2",
	"@radix-ui/react-context-menu": "^2.2.4",
	"@radix-ui/react-dropdown-menu": "^2.1.4",
	"@radix-ui/react-hover-card": "^1.1.4",
	"@radix-ui/react-label": "^2.1.1",
	"@radix-ui/react-menubar": "^1.1.4",
	"@radix-ui/react-navigation-menu": "^1.2.3",
	"@radix-ui/react-popover": "^1.1.4",
	"@radix-ui/react-progress": "^1.1.1",
	"@radix-ui/react-radio-group": "^1.2.2",
	"@radix-ui/react-scroll-area": "^1.2.2",
	"@radix-ui/react-select": "^2.1.4",
	"@radix-ui/react-separator": "^1.1.1",
	"@radix-ui/react-slider": "^1.2.2",
	"@radix-ui/react-switch": "^1.1.2",
	"@radix-ui/react-tabs": "^1.1.2",
	"@radix-ui/react-toast": "^1.2.4",
	"@radix-ui/react-toggle": "^1.1.1",
	"@radix-ui/react-toggle-group": "^1.1.1",
	"@radix-ui/react-tooltip": "^1.1.6",
	"@remix-run/node": "^2.14.0",
	"@remix-run/react": "^2.14.0",
	"@remix-run/serve": "^2.14.0",
	"app-root-path": "^3.1.0",
	bcryptjs: "^2.4.3",
	bson: "^6.10.0",
	chalk: "^5.3.0",
	"class-variance-authority": "^0.7.1",
	cmdk: "^1.0.4",
	commander: "^12.1.0",
	dotenv: "^16.4.5",
	"dotenv-cli": "^7.4.4",
	"embla-carousel-react": "^8.5.1",
	"input-otp": "^1.4.1",
	isbot: "^4.1.0",
	"lodash.isequal": "^4.5.0",
	"lucide-react": "^0.468.0",
	mongodb: "^6.10.0",
	"mongodb-query-parser": "^4.2.6",
	"next-themes": "^0.4.4",
	prisma: "^6.0.0",
	react: "^18.2.0",
	"react-day-picker": "^9.4.4",
	"react-dom": "^18.2.0",
	"react-resizable-panels": "^2.1.7",
	recharts: "^2.15.0",
	"scroll-into-view-if-needed": "^3.1.0",
	sonner: "^1.7.1",
	"tailwind-merge": "^2.5.5",
	"textarea-caret": "^3.1.0",
	validator: "^13.12.0",
	vaul: "^1.1.2"
};
const devDependencies = {
	"@remix-run/dev": "^2.14.0",
	"@types/bcryptjs": "^2.4.6",
	"@types/react": "^18.2.20",
	"@types/react-dom": "^18.2.7",
	"@types/validator": "^13.12.2",
	"@typescript-eslint/eslint-plugin": "^6.7.4",
	"@typescript-eslint/parser": "^6.7.4",
	"@vitejs/plugin-react": "^4.3.3",
	autoprefixer: "^10.4.19",
	eslint: "^8.38.0",
	"eslint-import-resolver-typescript": "^3.6.1",
	"eslint-plugin-import": "^2.28.1",
	"eslint-plugin-jsx-a11y": "^6.7.1",
	"eslint-plugin-react": "^7.33.2",
	"eslint-plugin-react-hooks": "^4.6.0",
	"npm-run-all": "^4.1.5",
	postcss: "^8.4.38",
	"run-p": "^0.0.0",
	"run-s": "^0.0.0",
	sass: "^1.63.6",
	tailwindcss: "^3.4.4",
	typescript: "^5.1.6",
	vite: "^5.1.0",
	"vite-tsconfig-paths": "^4.2.1"
};
const engines = {
	node: ">=20.0.0"
};
const packageJson = {
	name: name,
	version: version,
	"private": false,
	sideEffects: sideEffects,
	type: type,
	scripts: scripts,
	dependencies: dependencies,
	devDependencies: devDependencies,
	engines: engines
};

const Footer = () => {
  return /* @__PURE__ */ jsx("footer", { className: "fixed bottom-0 right-0 z-50 px-5 py-1 text-center text-white border-t border-solid rounded-tl-xl bg-neutral-900 border-neutral-200", children: /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
    "© Copyright, 2024 MongoCarbon v",
    packageJson.version
  ] }) });
};

const SkipToContent = ({ text = "Skip to main content", href = "#main-content" }) => {
  return /* @__PURE__ */ jsx("a", { href, className: "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-blue-600 focus:text-white focus:p-4 focus:z-50", children: text });
};

const defaultElement = "a";
const HeaderName = ({ as, className, name, to = "/", children, ...rest }) => {
  const Component = as ?? defaultElement;
  if (to) {
    rest.href = to;
  }
  return /* @__PURE__ */ jsx(Component, { ...rest, className: cn("text-xl font-bold", className), children: children ? children : /* @__PURE__ */ jsx("h1", { children: name }) });
};
const HeaderActions = ({ className, children }) => {
  return /* @__PURE__ */ jsx("div", { className: cn("flex items-center gap-4", className), children });
};
const HeaderAction = React__default.forwardRef(function HeaderAction2({ "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, children, className: customClassName, onClick, isActive, tooltipAlignment, hasIconOnly = true, ...rest }, ref) {
  const className = cn("flex items-center gap-4", customClassName);
  const accessibilityLabel = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy
  };
  return /* @__PURE__ */ jsx(
    Button,
    {
      ...rest,
      ...accessibilityLabel,
      variant: "none",
      size: hasIconOnly ? "icon" : "sm",
      className,
      onClick,
      type: "button",
      hasIconOnly,
      tooltip: ariaLabel,
      tooltipPosition: "bottom",
      tooltipAlignment,
      ref,
      children
    }
  );
});
const Header = ({ className, children, ...rest }) => {
  return /* @__PURE__ */ jsx("header", { ...rest, className: cn("flex absolute left-0 w-full items-center justify-between gap-4 px-4 py-2", className), children });
};
const HeaderNavigation = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className: customClassName,
  containerClassName: customContainerClassName,
  ...rest
}) => {
  const className = cn("flex gap-2", customClassName);
  const containerClassName = cn("", customContainerClassName);
  return /* @__PURE__ */ jsx("nav", { ...rest, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className: containerClassName, children: /* @__PURE__ */ jsx("ul", { className, children }) });
};
const menuItemDefaultElement = Button;
const HeaderMenuItem = React__default.forwardRef(function HeaderMenuItemRenderFunction({ as, className, variant, isActive, isCurrentPage, "aria-current": ariaCurrent, children, role, tabIndex = 0, ...rest }, ref) {
  if (isCurrentPage) {
    isActive = isCurrentPage;
  }
  const customClassName = cn("flex items-center gap-2", isActive && ariaCurrent !== "page" ? "bg-red-400" : "", className);
  const Component = as ?? menuItemDefaultElement;
  return /* @__PURE__ */ jsx(Component, { className: customClassName, size: "sm", variant: variant || "ghost", role, "aria-current": ariaCurrent, ref, tabIndex, ...rest, children: /* @__PURE__ */ jsx("span", { className: `text-ellipsis overflow-hidden`, children }) });
});
const HeaderMenuButton = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className: customClassName,
  renderMenuIcon,
  renderCloseIcon,
  isActive,
  isCollapsible,
  ...rest
}) => {
  const className = cn(isActive ? "active" : "", !isCollapsible ? "not-collapsible" : "", customClassName);
  const menuIcon = renderMenuIcon;
  const closeIcon = renderCloseIcon;
  return /* @__PURE__ */ jsx("button", { ...rest, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, title: ariaLabel, type: "button", children: isActive ? closeIcon : menuIcon });
};

const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Root, { ref, className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className), ...props }));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Image, { ref, className: cn("aspect-square h-full w-full", className), ...props })
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Fallback, { ref, className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className), ...props })
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const loader$2 = async ({ request }) => {
  try {
    const user = await requireUser(request, "/login");
    return Response.json(
      { user },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return redirect$1("/login");
  }
};
function Dashboard() {
  const { user } = useLoaderData();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Header, { "aria-label": "", children: [
      /* @__PURE__ */ jsx(SkipToContent, {}),
      /* @__PURE__ */ jsx(HeaderName, { name: "MongoCarbon", as: "a", to: "/", children: /* @__PURE__ */ jsx(Logo, { className: "h-5" }) }),
      /* @__PURE__ */ jsxs(HeaderActions, { children: [
        /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "User Profile", children: /* @__PURE__ */ jsx(Link, { to: "/profile", children: /* @__PURE__ */ jsx(Avatar, { className: "bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(AvatarFallback, { children: user.username.substring(0, 2).toUpperCase() }) }) }) }),
        /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "Logout", children: /* @__PURE__ */ jsx(Link, { to: "/logout", children: /* @__PURE__ */ jsx(SignOutIcon, { size: 20 }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen overflow-auto bg-neutral-100", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start justify-start flex-1 w-full mx-auto", children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(Footer, {})
    ] })
  ] });
}

const route9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Dashboard,
  loader: loader$2
}, Symbol.toStringTag, { value: 'Module' }));

const ChevronUp = ({ className }) => /* @__PURE__ */ jsx("svg", { className, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M7 14.5L12 9.5L17 14.5", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }) });
const ChevronDown = ({ className }) => /* @__PURE__ */ jsx("svg", { className, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M17 9.5L12 14.5L7 9.5", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }) });
const Download = () => /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", width: "32", height: "32", children: /* @__PURE__ */ jsx("path", { d: "M26 24v4H6v-4H4v6h24v-6zM16 22l7-7-1.4-1.4-4.6 4.6V4h-2v14.2l-4.6-4.6L9 15z" }) });
const Fork = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", children: [
  /* @__PURE__ */ jsx("path", { d: "M4.603 5.347l5.653 7.11a10.347 10.347 0 0 1 .477-1.022L5.397 4.741zM18.244 5H15V4h5v5h-1V5.656l-4.872 5.265A7.91 7.91 0 0 0 12 16.294V21h-1v-4.706a8.908 8.908 0 0 1 2.394-6.051z" }),
  /* @__PURE__ */ jsx("path", { fill: "none", d: "M0 0h24v24H0z" })
] });
const LogoGithub = ({ className }) => /* @__PURE__ */ jsx("svg", { className, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", width: "32", height: "32", children: /* @__PURE__ */ jsx("path", { d: "M16 2.05a14 14 0 0 0-4.42 27.26c.7.13.96-.3.96-.66v-2.34c-3.9.85-4.72-1.88-4.72-1.88a3.72 3.72 0 0 0-1.56-2.05c-1.28-.88.1-.86.1-.86a2.94 2.94 0 0 1 2.14 1.44 3 3 0 0 0 4.1 1.17 3 3 0 0 1 .9-1.88c-3.11-.35-6.38-1.55-6.38-6.9a5.4 5.4 0 0 1 1.44-3.74 5 5 0 0 1 .14-3.68s1.17-.37 3.84 1.43a13.2 13.2 0 0 1 7 0c2.67-1.8 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.68 5.4 5.4 0 0 1 1.44 3.74c0 5.36-3.28 6.55-6.4 6.9a3.36 3.36 0 0 1 1 2.61v3.87c0 .36.26.8 1 .66A14 14 0 0 0 16 2.05z" }) });
const Watch = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", fill: "none", children: [
  /* @__PURE__ */ jsx("path", { stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 1.5, d: "M29 16c0 3-5.82 9-13 9S3 19 3 16s5.82-9 13-9 13 6 13 9z" }),
  /* @__PURE__ */ jsx("circle", { cx: 16, cy: 16, r: 5, stroke: "currentColor", strokeLinejoin: "round", strokeWidth: 1.5 })
] });
const Star = ({ className }) => /* @__PURE__ */ jsx("svg", { className, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx(
  "path",
  {
    d: "M14.65 8.93274L12.4852 4.30901C12.2923 3.89699 11.7077 3.897 11.5148 4.30902L9.35002 8.93274L4.45559 9.68243C4.02435 9.74848 3.84827 10.2758 4.15292 10.5888L7.71225 14.2461L6.87774 19.3749C6.80571 19.8176 7.27445 20.1487 7.66601 19.9317L12 17.5299L16.334 19.9317C16.7256 20.1487 17.1943 19.8176 17.1223 19.3749L16.2878 14.2461L19.8471 10.5888C20.1517 10.2758 19.9756 9.74848 19.5444 9.68243L14.65 8.93274Z",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) });
const GithubButton = ({ repo, version, title }) => {
  const [vendorName, repoName] = repo.split("/");
  const repoUrl = `http://github.com/${vendorName}/${repoName}`;
  return /* @__PURE__ */ jsx("div", { className: "inline-flex items-center", children: /* @__PURE__ */ jsxs(
    "a",
    {
      target: "_blank",
      className: "inline-flex w-9 overflow-hidden lg:w-auto items-center gap-2 px-2 py-1.5 text-sm border border-solid  border-neutral-300 bg-neutral-50",
      href: repoUrl,
      children: [
        /* @__PURE__ */ jsx(LogoGithub, { className: "flex-shrink-0 w-5 h-5" }),
        " ",
        title,
        " ",
        version ? /* @__PURE__ */ jsxs("b", { children: [
          "v",
          version
        ] }) : null
      ]
    }
  ) });
};
const GitHubWidget = ({ repo, travis, title, version }) => {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorName, repoName] = repo.split("/");
  const vendorUrl = `http://github.com/${vendorName}`;
  const repoUrl = `http://github.com/${vendorName}/${repoName}`;
  const travisImgUrl = `https://travis-ci.org/${vendorName}/${repoName}.png?branch=master`;
  const travisUrl = `https://travis-ci.org/${vendorName}/${repoName}/builds`;
  const [expand, setExpand] = useState(false);
  useEffect(() => {
    const url = `https://api.github.com/repos/${repo}`;
    const fetchRepoData = async () => {
      try {
        const cachedData = localStorage.getItem(url);
        let elapsedMinutes;
        if (cachedData) {
          const cachedAtUnix = JSON.parse(cachedData)._cachedAt;
          const elapsed = (/* @__PURE__ */ new Date()).getTime() - cachedAtUnix;
          elapsedMinutes = elapsed / 1e3 / 60;
        }
        if (elapsedMinutes && elapsedMinutes < 20 && cachedData) {
          setRepoData(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const response = await fetch(url);
          const data = await response.json();
          if (data.message && /Rate Limit/i.test(data.message)) {
            if (cachedData) {
              setRepoData(JSON.parse(cachedData));
            } else {
              setError("Rate limit exceeded");
            }
          } else {
            data._cachedAt = (/* @__PURE__ */ new Date()).getTime();
            localStorage.setItem(url, JSON.stringify(data));
            setRepoData(data);
          }
          setLoading(false);
        }
      } catch (error2) {
        setError("Failed to fetch repository data");
        setLoading(false);
      }
    };
    fetchRepoData();
  }, [repo]);
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "text-red-500", children: error });
  }
  if (!repoData) {
    return null;
  }
  const date = new Date(repoData.pushed_at);
  const pushedAt = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  let output = null;
  if (loading) {
    output = /* @__PURE__ */ jsx("div", { children: "Loading..." });
  } else if (error) {
    output = /* @__PURE__ */ jsx("div", { className: "text-red-500", children: error });
  } else if (!repoData) {
    output = /* @__PURE__ */ jsx("div", { className: "text-red-500", children: "No data" });
  } else {
    output = /* @__PURE__ */ jsx("div", { className: "overflow-hidden transition-all duration-500 " + (expand ? "max-h-48" : "max-h-0"), children: /* @__PURE__ */ jsxs("div", { className: "p-4 overflow-auto h-full  border border-solid  border-neutral-300 bg-neutral-50 ", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pb-2 mb-2", children: [
        /* @__PURE__ */ jsxs("h3", { className: "flex gap-0.5 font-semibold text-neutral-600 text-md", children: [
          /* @__PURE__ */ jsx(LogoGithub, { className: "w-6 h-6 mr-1" }),
          /* @__PURE__ */ jsx("a", { className: "text-blue-500", href: vendorUrl, children: vendorName }),
          "/",
          /* @__PURE__ */ jsx("a", { className: "text-blue-500", href: repoUrl, children: repoName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              target: "_blank",
              className: "flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600",
              href: `${repoUrl}/watchers`,
              children: [
                /* @__PURE__ */ jsx(Watch, { className: "h-5 mr-1" }),
                repoData.watchers
              ]
            }
          ),
          /* @__PURE__ */ jsxs("a", { target: "_blank", className: "flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600", href: `${repoUrl}/fork`, children: [
            /* @__PURE__ */ jsx(Fork, { className: "h-5 mr-0.5" }),
            repoData.forks
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              target: "_blank",
              className: "flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600",
              href: `${repoUrl}/stargazers`,
              children: [
                /* @__PURE__ */ jsx(Star, { className: "h-5" }),
                repoData.stargazers_count
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2 ", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-600", children: [
          repoData.description,
          /* @__PURE__ */ jsxs("span", { className: "block", children: [
            "—",
            " ",
            /* @__PURE__ */ jsx("a", { target: "_blank", className: "text-blue-500", href: `${repoUrl}#readme`, children: "Read More" })
          ] })
        ] }),
        repoData.homepage && /* @__PURE__ */ jsx("p", { className: "text-sm", children: /* @__PURE__ */ jsx("a", { target: "_blank", className: "text-blue-500", href: repoData.homepage, children: repoData.homepage }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-600 updated", children: [
          "Latest commit to the ",
          /* @__PURE__ */ jsx("strong", { children: "master" }),
          " branch on ",
          pushedAt
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start mt-2 ml-2 space-x-2", children: [
          travis && /* @__PURE__ */ jsx("a", { href: travisUrl, children: /* @__PURE__ */ jsx("img", { className: "travis", src: travisImgUrl, alt: "Build status" }) }),
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-solid  text-neutral-600 border-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200",
              href: `${repoUrl}/zipball/master`,
              children: /* @__PURE__ */ jsx(Download, {})
            }
          )
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "inline-flex mb-4 border border-solid  border-neutral-300 bg-neutral-50", children: [
      /* @__PURE__ */ jsxs("a", { target: "_blank", className: "inline-flex items-center gap-2 px-2 py-1 my-1 text-sm ", href: repoUrl, children: [
        /* @__PURE__ */ jsx(LogoGithub, { className: "w-6 h-6" }),
        " ",
        title,
        " ",
        /* @__PURE__ */ jsxs("b", { children: [
          "v",
          version
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "a",
        {
          onClick: (e) => {
            e.preventDefault();
            setExpand(!expand);
          },
          className: "inline-flex items-center gap-2 px-2 py-1 my-1 ml-2 text-sm border-l border-solid border-neutral-200",
          href: repoUrl,
          children: expand ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5" })
        }
      )
    ] }),
    output
  ] });
};

const TreeView = ({
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
}) => {
  const treeClasses = cn(className, `tree`, size ? `tree--${size}` : "");
  const treeRootRef = useRef(null);
  const treeWalker = useRef(treeRootRef?.current);
  function resetNodeTabIndices() {
    Array.prototype.forEach.call(treeRootRef?.current?.querySelectorAll('[tabIndex="0"]') ?? [], (item) => {
      item.tabIndex = -1;
    });
  }
  function handleTreeSelect(event, node = {}) {
    const nodeId = node.id;
    if (multiselect && (event.metaKey || event.ctrlKey)) {
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
  const nodesWithProps = children ? React__default.Children.map(children, (_node) => {
    const node = _node;
    const sharedNodeProps = {
      depth: 0,
      onNodeFocusEvent: handleFocusEvent,
      onTreeSelect: handleTreeSelect,
      tabIndex: !node.props.disabled && -1 || void 0
    };
    if (!focusTarget && !node.props.disabled) {
      sharedNodeProps.tabIndex = 0;
      focusTarget = true;
    }
    if (React__default.isValidElement(node)) {
      return React__default.cloneElement(node, sharedNodeProps);
    }
  }) : null;
  function handleKeyDown(event) {
    event.stopPropagation();
    if (matches(event, [ArrowUpKey, ArrowDownKey, HomeKey, EndKey, { code: "KeyA" }])) {
      event.preventDefault();
    }
    if (!treeWalker.current) {
      return;
    }
    treeWalker.current.currentNode = event.target;
    let nextFocusNode = null;
    if (match(event, ArrowUpKey)) {
      nextFocusNode = treeWalker.current.previousNode();
    }
    if (match(event, ArrowDownKey)) {
      nextFocusNode = treeWalker.current.nextNode();
    }
    if (matches(event, [HomeKey, EndKey, { code: "KeyA" }])) {
      const nodeIds = [];
      if (matches(event, [HomeKey, EndKey])) {
        if (multiselect && event.shiftKey && event.ctrlKey && treeWalker.current.currentNode instanceof Element && !treeWalker.current.currentNode.getAttribute("aria-disabled") && !treeWalker.current.currentNode.classList.contains(`hidden`)) {
          nodeIds.push(treeWalker.current.currentNode?.id);
        }
        while (match(event, HomeKey) ? treeWalker.current.previousNode() : treeWalker.current.nextNode()) {
          nextFocusNode = treeWalker.current.currentNode;
          if (multiselect && event.shiftKey && event.ctrlKey && nextFocusNode instanceof Element && !nextFocusNode.getAttribute("aria-disabled") && !nextFocusNode.classList.contains(`hidden`)) {
            nodeIds.push(nextFocusNode?.id);
          }
        }
      }
      if (match(event, { code: "KeyA" }) && event.ctrlKey) {
        treeWalker.current.currentNode = treeWalker.current.root;
        while (treeWalker.current.nextNode()) {
          if (treeWalker.current.currentNode instanceof Element && !treeWalker.current.currentNode.getAttribute("aria-disabled") && !treeWalker.current.currentNode.classList.contains(`hidden`)) {
            nodeIds.push(treeWalker.current.currentNode?.id);
          }
        }
      }
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
    treeWalker.current = treeWalker.current ?? document.createTreeWalker(treeRootRef?.current, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function(node) {
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
      }
    });
  }, []);
  const TreeLabel = () => !hideLabel ? /* @__PURE__ */ jsx("label", { className: `flex bg-red-400`, children: label }) : null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(TreeLabel, {}),
    /* @__PURE__ */ jsx(
      "ul",
      {
        ...rest,
        "aria-label": hideLabel ? label : void 0,
        "aria-multiselectable": multiselect || void 0,
        className: treeClasses,
        onKeyDown: handleKeyDown,
        ref: treeRootRef,
        role: "tree",
        children: nodesWithProps
      }
    )
  ] });
};
const TreeNode = React__default.forwardRef(
  ({
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
  }, forwardedRef) => {
    const depth = propDepth;
    const currentNode = useRef(null);
    const currentNodeLabel = useRef(null);
    const setRefs = (element) => {
      currentNode.current = element;
      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };
    const nodesWithProps = React__default.Children.map(children, (node) => {
      if (React__default.isValidElement(node)) {
        return React__default.cloneElement(node, {
          depth: depth + 1,
          onTreeSelect,
          tabIndex: !node.props.disabled && -1 || null
        });
      }
    });
    const treeNodeClasses = cn(
      " py-0",
      className,
      disabled ? "disabled opacity-50 cursor-not-allowed" : "",
      icon ? "with-icon" : "",
      !children ? "hover:bg-tree/10" : "py-0"
    );
    const treeLabelClasses = cn(
      active ? "border-l-4 border-solid border-primary bg-tree" : "border-l-4 border-solid border-transparent hover:bg-tree opacity-70"
    );
    const toggleClasses = isExpanded ? "rotate-90" : "";
    function handleToggleClick(event) {
      if (disabled) {
        return;
      }
      event.stopPropagation();
      onToggle?.(event, { isExpanded: !isExpanded, label, value });
    }
    function handleClick(event) {
      event.stopPropagation();
      if (!disabled) {
        onTreeSelect?.(event, { label, value });
        onNodeSelect?.(event, { label, value });
        rest?.onClick?.(event);
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
        const findParentTreeNode = (node) => {
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
          const parentNode = findParentTreeNode(currentNode.current?.parentElement || null);
          if (parentNode instanceof HTMLElement) {
            parentNode.focus();
          }
        }
      }
      if (children && match(event, ArrowRightKey)) {
        if (isExpanded) {
          (currentNode.current?.lastChild?.firstChild).focus();
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
    const treeNodeProps = {
      ...rest,
      ["aria-current"]: active || void 0,
      ["aria-disabled"]: disabled,
      onBlur: handleFocusEvent,
      onClick: handleClick,
      onFocus: handleFocusEvent,
      onKeyDown: handleKeyDown,
      role: "treeitem"
    };
    let paddingLeft = depth ? `${depth}rem` : void 0;
    if (!children) {
      return /* @__PURE__ */ jsx("li", { ...treeNodeProps, className: treeNodeClasses, ref: setRefs, children: /* @__PURE__ */ jsxs("div", { style: { paddingLeft }, className: "flex items-center gap-2 py-2 transition " + treeLabelClasses, ref: currentNodeLabel, children: [
        icon,
        label
      ] }) });
    }
    return /* @__PURE__ */ jsxs("li", { style: { paddingLeft }, ...treeNodeProps, className: treeNodeClasses, "aria-expanded": !!isExpanded, ref: setRefs, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center transition cursor-pointer hover:bg-tree/10 " + treeLabelClasses, ref: currentNodeLabel, children: [
        /* @__PURE__ */ jsx("span", { className: "w-6 py-2 pl-3 pr-2 mr-2 -ml-2", onClick: handleToggleClick, children: /* @__PURE__ */ jsx(TriangleRightIcon, { className: "h-4 " + toggleClasses }) }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
          icon,
          label
        ] })
      ] }),
      /* @__PURE__ */ jsx("ul", { role: "group", className: cn("flex flex-col pt-0 pb-2 py-px", !isExpanded ? "hidden" : ""), children: nodesWithProps })
    ] });
  }
);

const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

const Sheet = DialogPrimitive.Root;
const SheetPortal = DialogPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4  opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] }),
        children
      ]
    }
  )
] }));
SheetContent.displayName = DialogPrimitive.Content.displayName;
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("animate-pulse  bg-primary/10", className),
      ...props
    }
  );
}

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "24rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(Tooltip, { delayDuration: 0, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
      ref,
      ...props,
      children
    }
  ) }) });
});
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx("div", { className: cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className), ref, ...props, children });
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsx(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: /* @__PURE__ */ jsx("div", { className: "flex flex-col w-full h-full", children })
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      className: "hidden group peer md:block text-sidebar-foreground",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]: group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                children
              }
            )
          }
        )
      ]
    }
  );
});
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeft, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      "data-sidebar": "rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle Sidebar",
      className: cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
});
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "main",
    {
      ref,
      className: cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      ),
      ...props
    }
  );
});
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(Input, { ref, "data-sidebar": "input", className: cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className), ...props });
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "header", className: cn("flex flex-col gap-2 p-2", className), ...props });
});
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "footer", className: cn("flex flex-col gap-2 p-2", className), ...props });
});
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(Separator, { ref, "data-sidebar": "separator", className: cn("mx-2 w-auto bg-sidebar-border", className), ...props });
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "content",
      className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
      ...props
    }
  );
});
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "group", className: cn("relative flex w-full min-w-0 flex-col p-2", className), ...props });
});
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "duration-200 flex h-8 shrink-0 items-center  px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center  p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "group-content", className: cn("w-full text-md", className), ...props }));
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("ul", { ref, "data-sidebar": "menu", className: cn("flex w-full min-w-0 flex-col gap-1", className), ...props }));
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, "data-sidebar": "menu-item", className: cn("group/menu-item relative", className), ...props }));
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden  p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = React.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(Comp, { ref, "data-sidebar": "menu-button", "data-size": size, "data-active": isActive, className: cn(sidebarMenuButtonVariants({ variant, size }), className), ...props });
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsx(Tooltip, { side: "right", align: "center", open: state !== "collapsed" || isMobile, ...tooltip, children: button });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center  p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    "data-sidebar": "menu-badge",
    className: cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center  px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    ),
    ...props
  }
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, "data-sidebar": "menu-skeleton", className: cn(" h-8 flex gap-2 px-2 items-center", className), ...props, children: [
    showIcon && /* @__PURE__ */ jsx(Skeleton, { className: " size-4", "data-sidebar": "menu-skeleton-icon" }),
    /* @__PURE__ */ jsx(
      Skeleton,
      {
        className: "h-4 flex-1 max-w-[--skeleton-width]",
        "data-sidebar": "menu-skeleton-text",
        style: {
          "--skeleton-width": width
        }
      }
    )
  ] });
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "ul",
  {
    ref,
    "data-sidebar": "menu-sub",
    className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className),
    ...props
  }
));
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, ...props }));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden  px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

const loader$1 = async ({ request, params }) => {
  try {
    const user = await requireUser(request, "/login");
    const session = await getUserSession(request);
    const connections = await getUserDbConnections(user.id);
    let connection = session.get("connection");
    if (!connection || connections.length == 0) {
      if (connections.length == 1) {
        session.set("connection", connections[0]);
        await commitSession(session);
        connection = connections[0];
      } else {
        return redirect$1("/connections", 301);
      }
    }
    let mongo;
    try {
      mongo = await connect(connection);
    } catch (error) {
      return Response.json({ status: "error", message: "Error: " + error.message }, { status: 500 });
    }
    const databases = await mongo.getDatabases();
    const collections = {};
    for (let i in databases) {
      collections[databases[i]] = await mongo.getCollections({ dbName: databases[i] });
    }
    const gridFSBuckets = colsToGrid(collections);
    const result = { selectedDb: params.db || null, selectedCollection: params.db ? params.col || null : null, user, databases, connections, connection, collections, gridFSBuckets };
    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return redirect$1(`/error?message=${e.message}`);
  }
};
function Layout$1() {
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [isCreateDatabase, setIsCreateDatabase] = useState(false);
  let _currentDb = loaderData.selectedDb ? loaderData.selectedDb : "";
  let _currentCollection = loaderData.selectedCollection ? loaderData.selectedCollection : "";
  const [current, setCurrent] = useState({
    db: _currentDb,
    collection: _currentCollection
  });
  useEffect(() => {
    if (loaderData.selectedDb != current.db || loaderData.selectedCollection != current.collection) {
      let _currentDb2 = loaderData.selectedDb ? loaderData.selectedDb : "";
      let _currentCollection2 = loaderData.selectedCollection ? loaderData.selectedCollection : "";
      setCurrent({
        db: _currentDb2,
        collection: _currentCollection2
      });
    }
  }, [loaderData.selectedDb]);
  let collectionsElms = [];
  if (loaderData) {
    const databases = Object.keys(loaderData.collections);
    databases.sort((a, b) => {
      return a > b ? 1 : -1;
    });
    collectionsElms = databases.map((database, indexDb) => {
      const collections = loaderData.collections[database].sort((a, b) => {
        return a.name > b.name ? 1 : -1;
      });
      return /* @__PURE__ */ jsx(
        TreeNode,
        {
          active: database == current.db,
          isExpanded: database == current.db,
          onSelect: () => {
            setCurrent({
              db: database,
              collection: ""
            });
            navigate(`/database/${database}`);
          },
          label: database,
          onToggle: (e, node) => {
            const isExpanded = node?.isExpanded;
            setCurrent(
              isExpanded ? {
                db: database,
                collection: ""
              } : {
                db: "",
                collection: ""
              }
            );
            console.log("Toggle", node);
          },
          tabIndex: 0,
          children: collections.map((collection, indexCol) => {
            return /* @__PURE__ */ jsx(
              TreeNode,
              {
                active: database == current.db && collection.name == current.collection,
                onSelect: () => {
                  setCurrent({
                    db: database,
                    collection: collection.name
                  });
                  navigate(`/database/${database}/${collection.name}`);
                },
                icon: /* @__PURE__ */ jsx(DatabaseIcon, {}),
                label: collection.name,
                onToggle: (e, node) => {
                  setCurrent({
                    db: database,
                    collection: collection.name
                  });
                  console.log("Toggle", node);
                }
              },
              `${database}-${collection.name}`
            );
          })
        },
        database
      );
    });
  }
  const onCreateDatabase = () => {
    setIsCreateDatabase(true);
  };
  const { pathname } = useLocation();
  const treeView = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2 bg-neutral-100", children: [
      /* @__PURE__ */ jsx("span", { className: "block text-xs uppercase opacity-50", children: "Databases" }),
      /* @__PURE__ */ jsx(Link, { className: "text-xs uppercase opacity-50 hover:underline hover:opacity-100", to: "/database", children: /* @__PURE__ */ jsx(EyeIcon, {}) })
    ] }),
    /* @__PURE__ */ jsx(TreeView, { size: "sm", multiselect: false, hideLabel: true, label: "Databases", "aria-expanded": true, className: "bg-neutral-100", children: collectionsElms })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(SidebarProvider, { defaultOpen: true, open: isSideNavExpanded, children: [
      /* @__PURE__ */ jsx(Sidebar, { children: /* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsx(SidebarGroup, { children: /* @__PURE__ */ jsxs(SidebarGroupContent, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-4", children: [
          /* @__PURE__ */ jsx(HeaderMenuItem, { as: "div", className: "flex items-center mr-4", children: /* @__PURE__ */ jsx(SwitchConnection, { current: loaderData.connection, connections: loaderData.connections }) }),
          /* @__PURE__ */ jsx(HeaderNavigation, { "aria-label": "New Database", children: /* @__PURE__ */ jsx(HeaderMenuItem, { variant: "outline", icon: /* @__PURE__ */ jsx(PlusIcon, {}), onClick: onCreateDatabase, children: "New Database" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "relative top-0 left-0 w-full h-full overflow-auto", children: treeView })
      ] }) }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full overflow-hidden transition", children: [
        /* @__PURE__ */ jsxs(Header, { className: "z-50 bg-white shadow", "aria-label": "Header", children: [
          /* @__PURE__ */ jsx(SkipToContent, {}),
          /* @__PURE__ */ jsxs(HeaderActions, { children: [
            /* @__PURE__ */ jsx(
              HeaderMenuButton,
              {
                "aria-label": "Open menu",
                renderMenuIcon: /* @__PURE__ */ jsx(ThreeBarsIcon, {}),
                renderCloseIcon: /* @__PURE__ */ jsx(XIcon, {}),
                onClick: () => {
                  setIsSideNavExpanded(!isSideNavExpanded);
                },
                isActive: isSideNavExpanded
              }
            ),
            /* @__PURE__ */ jsx(HeaderName, { as: "a", to: "/", children: /* @__PURE__ */ jsx(Logo, { className: "h-5" }) }),
            /* @__PURE__ */ jsx(HeaderNavigation, { "aria-label": "Connections", children: /* @__PURE__ */ jsx(HeaderMenuItem, { as: "div", className: "flex items-center mr-4", children: /* @__PURE__ */ jsx(SwitchConnection, { current: loaderData.connection, connections: loaderData.connections }) }) }),
            /* @__PURE__ */ jsx(HeaderNavigation, { "aria-label": "New Database", children: /* @__PURE__ */ jsx(HeaderMenuItem, { onClick: onCreateDatabase, children: "New Database" }) })
          ] }),
          /* @__PURE__ */ jsxs(HeaderActions, { children: [
            /* @__PURE__ */ jsx(GithubButton, { repo: "n-for-all/mongocarbon", version: packageJson.version, title: "MongoCarbon" }),
            /* @__PURE__ */ jsx(Link, { to: "/profile", children: /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "User Profile", children: /* @__PURE__ */ jsx(Avatar, { className: "bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(AvatarFallback, { children: loaderData.user.username.substring(0, 2).toUpperCase() }) }) }) }),
            /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "Logout", children: /* @__PURE__ */ jsx(Link, { to: "/logout", children: /* @__PURE__ */ jsx(SignOutIcon, { size: 20 }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-screen overflow-auto", children: /* @__PURE__ */ jsx("div", { className: "pt-12 pb-12 pl-0 pr-0", children: /* @__PURE__ */ jsx("div", { className: "h-full pt-5 mr-0 ", children: /* @__PURE__ */ jsx("div", { className: "px-4 lg:px-8", children: /* @__PURE__ */ jsx(Outlet, {}, pathname + "-content") }) }) }) }),
        /* @__PURE__ */ jsx(Footer, {})
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      DatabaseAddModal,
      {
        open: isCreateDatabase,
        onClose: () => {
          setIsCreateDatabase(false);
        },
        onSuccess: (dbName, collectionName) => {
          setIsCreateDatabase(false);
          navigate(`/database/${dbName}/${collectionName}`, { replace: true });
        }
      }
    )
  ] });
}

const route10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Layout$1,
  loader: loader$1
}, Symbol.toStringTag, { value: 'Module' }));

const loader = async ({ request, params }) => {
  let url = new URL(request.url);
  let message = url.searchParams.get("message");
  try {
    return Response.json(
      { message },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (e) {
    return redirect$1(`/error?message=${e.message}`);
  }
};
function Layout() {
  const loaderData = useLoaderData();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Header, { "aria-label": "", children: [
      /* @__PURE__ */ jsx(SkipToContent, {}),
      /* @__PURE__ */ jsx(
        HeaderMenuButton,
        {
          "aria-label": "Open menu",
          renderMenuIcon: /* @__PURE__ */ jsx(ThreeBarsIcon, {}),
          renderCloseIcon: /* @__PURE__ */ jsx(XIcon, {}),
          onClick: () => {
            setIsSideNavExpanded(!isSideNavExpanded);
          },
          isActive: isSideNavExpanded
        }
      ),
      /* @__PURE__ */ jsx(HeaderName, { as: "a", to: "/", children: /* @__PURE__ */ jsx(Logo, { className: "h-5" }) }),
      /* @__PURE__ */ jsxs(HeaderActions, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/profile", children: /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "User Profile", children: /* @__PURE__ */ jsx(Avatar, { className: "bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(AvatarFallback, { children: loaderData.user.username.substring(0, 2).toUpperCase() }) }) }) }),
        /* @__PURE__ */ jsx(HeaderAction, { "aria-label": "Logout", children: /* @__PURE__ */ jsx(Link, { to: "/logout", children: /* @__PURE__ */ jsx(SignOutIcon, { size: 20 }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-screen pt-12", children: /* @__PURE__ */ jsx("div", { className: "max-w-xl pl-0 pr-0", children: /* @__PURE__ */ jsx("div", { className: "h-full pt-5 mr-0 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-4 border border-red-300 border-solid", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-5 text-2xl font-bold text-red-600", children: "Error" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4", children: loaderData?.message }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", as: "a", to: "/", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), children: "Dashboard" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", as: "a", to: "/connections", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), children: "Connections" })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}

const route11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Layout,
  loader
}, Symbol.toStringTag, { value: 'Module' }));

const action = async ({ request }) => {
  try {
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo") || "/";
    if (typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
      return Response.json({
        formError: `Form not submitted correctly.`
      });
    }
    const errors = {
      username: validateUsername(username),
      password: !password || password.trim() == "" ? "Please enter your password" : false
    };
    if (Object.values(errors).some(Boolean)) {
      return Response.json({ status: "error", errors });
    }
    const user = await login({ username, password });
    if (!user) {
      return Response.json({
        status: "error",
        message: `The Username and Password combination is incorrect`
      });
    }
    checkUserSession(request);
    return createUserSession(user.id, redirectTo);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return Response.json({
      status: "error",
      message: e.message
    });
  }
};
function LoginRoute() {
  const actionData = useActionData();
  const { toast } = useToast();
  useEffect(() => {
    if (actionData && actionData.message) {
      toast({
        variant: "error",
        title: actionData?.status == "error" ? "Error" : "Success",
        description: actionData?.message,
        action: /* @__PURE__ */ jsx(ToastAction, { altText: "Close", children: "Close" })
      });
    }
  }, [actionData]);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-screen", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mx-auto", children: [
    /* @__PURE__ */ jsx(Logo, { className: "h-10 mx-auto" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full p-10 mt-5 border border-solid bg-neutral-50 border-neutral-100", children: [
      /* @__PURE__ */ jsx("h3", { className: "block mb-1 text-3xl font-bold", children: "Login" }),
      /* @__PURE__ */ jsx("small", { className: "block mb-6 text-xs opacity-50 leading-1", children: "Please enter your username and password below:" }),
      /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-10", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "username",
            name: "username",
            labelText: "Username",
            type: "text",
            autoComplete: "new-password",
            required: true,
            invalid: Boolean(actionData?.errors?.username) || void 0,
            invalidText: actionData?.errors?.username ? actionData?.errors?.username : void 0
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "password",
            name: "password",
            labelText: "Password",
            type: "password",
            required: true,
            autoComplete: "new-password",
            invalid: Boolean(actionData?.errors?.password) || void 0,
            invalidText: actionData?.errors?.password ? actionData?.errors?.password : void 0
          }
        ),
        /* @__PURE__ */ jsx(Button, { iconPosition: "right", size: "sm", icon: /* @__PURE__ */ jsx(ArrowRightIcon, {}), type: "submit", children: "Login" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center mt-4", children: /* @__PURE__ */ jsx(GitHubWidget, { repo: "n-for-all/mongocarbon", version: packageJson.version, title: "MongoCarbon" }) })
  ] }) }) });
}

const route12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action,
  default: LoginRoute
}, Symbol.toStringTag, { value: 'Module' }));

const serverManifest = {'entry':{'module':'/assets/entry.client-D-yrOLDe.js','imports':['/assets/components-BPOIHgDc.js'],'css':[]},'routes':{'root':{'id':'root','parentId':undefined,'path':'','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/root-BpWHqv2o.js','imports':['/assets/components-BPOIHgDc.js','/assets/x-OohQberg.js','/assets/toast-hIcI356p.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js'],'css':['/assets/root-Dciun49d.css']},'routes/_user.database.$db._index':{'id':'routes/_user.database.$db._index','parentId':'routes/_user','path':'database/:db','index':true,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_user.database._db._index-H-1x1CL0.js','imports':['/assets/components-BPOIHgDc.js','/assets/button-ZrFu6W_T.js','/assets/collection-CQRtENl6.js','/assets/database-D9MPVr0e.js','/assets/functions-DMKVu1r-.js','/assets/accordion-Cy3lx65E.js','/assets/alert-Do9tp9-j.js','/assets/input-ChpOE9Lf.js','/assets/select-Cem4k-Od.js','/assets/table-CX2GO18n.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js','/assets/x-OohQberg.js'],'css':[]},'routes/_user.database.$db.$col':{'id':'routes/_user.database.$db.$col','parentId':'routes/_user','path':'database/:db/:col','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_user.database._db._col-Dmn7Omo_.js','imports':['/assets/components-BPOIHgDc.js','/assets/button-ZrFu6W_T.js','/assets/functions-DMKVu1r-.js','/assets/collection-CQRtENl6.js','/assets/accordion-Cy3lx65E.js','/assets/table-CX2GO18n.js','/assets/index-CZUknZXM.js','/assets/x-OohQberg.js','/assets/select-Cem4k-Od.js','/assets/utils-DcAaEMf9.js','/assets/input-ChpOE9Lf.js'],'css':[]},'routes/_user.database._index':{'id':'routes/_user.database._index','parentId':'routes/_user','path':'database','index':true,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_user.database._index-CRcUl7DD.js','imports':['/assets/components-BPOIHgDc.js','/assets/functions-DMKVu1r-.js','/assets/button-ZrFu6W_T.js','/assets/database-D9MPVr0e.js','/assets/select-Cem4k-Od.js','/assets/alert-Do9tp9-j.js','/assets/input-ChpOE9Lf.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js','/assets/x-OohQberg.js'],'css':[]},'routes/_base.connections':{'id':'routes/_base.connections','parentId':'routes/_base','path':'connections','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_base.connections-DFD7X86d.js','imports':['/assets/components-BPOIHgDc.js','/assets/connection-DQWmmeEw.js','/assets/logo-COugf1Vw.js','/assets/accordion-Cy3lx65E.js','/assets/button-ZrFu6W_T.js','/assets/actionable-notification-DDLqphrE.js','/assets/x-OohQberg.js','/assets/index-CZUknZXM.js','/assets/select-Cem4k-Od.js','/assets/utils-DcAaEMf9.js','/assets/input-ChpOE9Lf.js','/assets/alert-Do9tp9-j.js'],'css':[]},'routes/_base.profile':{'id':'routes/_base.profile','parentId':'routes/_base','path':'profile','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_base.profile-63As5LFj.js','imports':['/assets/components-BPOIHgDc.js','/assets/button-ZrFu6W_T.js','/assets/actionable-notification-DDLqphrE.js','/assets/input-ChpOE9Lf.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js','/assets/alert-Do9tp9-j.js'],'css':[]},'routes/_base.create':{'id':'routes/_base.create','parentId':'routes/_base','path':'create','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_base.create-BRASXI-l.js','imports':['/assets/components-BPOIHgDc.js','/assets/button-ZrFu6W_T.js','/assets/logo-COugf1Vw.js','/assets/input-ChpOE9Lf.js','/assets/actionable-notification-DDLqphrE.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js','/assets/alert-Do9tp9-j.js'],'css':[]},'routes/_user._index':{'id':'routes/_user._index','parentId':'routes/_user','path':undefined,'index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_user._index-AIFGYrER.js','imports':['/assets/components-BPOIHgDc.js','/assets/table-CX2GO18n.js','/assets/utils-DcAaEMf9.js'],'css':[]},'routes/logout':{'id':'routes/logout','parentId':'root','path':'logout','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/logout-D0ECua74.js','imports':[],'css':[]},'routes/_base':{'id':'routes/_base','parentId':'root','path':undefined,'index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_base-D2uRlujz.js','imports':['/assets/components-BPOIHgDc.js','/assets/avatar-iLqlscfN.js','/assets/logo-COugf1Vw.js','/assets/button-ZrFu6W_T.js','/assets/package-B8KgwFrP.js','/assets/utils-DcAaEMf9.js','/assets/index-CZUknZXM.js'],'css':[]},'routes/_user':{'id':'routes/_user','parentId':'root','path':undefined,'index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_user-DVIsT9j6.js','imports':['/assets/components-BPOIHgDc.js','/assets/package-B8KgwFrP.js','/assets/button-ZrFu6W_T.js','/assets/avatar-iLqlscfN.js','/assets/connection-DQWmmeEw.js','/assets/database-D9MPVr0e.js','/assets/github_widget-R1gwNBdG.js','/assets/logo-COugf1Vw.js','/assets/utils-DcAaEMf9.js','/assets/index-CZUknZXM.js','/assets/input-ChpOE9Lf.js','/assets/select-Cem4k-Od.js','/assets/x-OohQberg.js'],'css':[]},'routes/error':{'id':'routes/error','parentId':'root','path':'error','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/error-DfLKPCel.js','imports':['/assets/components-BPOIHgDc.js','/assets/avatar-iLqlscfN.js','/assets/logo-COugf1Vw.js','/assets/button-ZrFu6W_T.js','/assets/package-B8KgwFrP.js','/assets/utils-DcAaEMf9.js','/assets/index-CZUknZXM.js'],'css':[]},'routes/login':{'id':'routes/login','parentId':'root','path':'login','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/login-_Arp4IVU.js','imports':['/assets/components-BPOIHgDc.js','/assets/button-ZrFu6W_T.js','/assets/logo-COugf1Vw.js','/assets/input-ChpOE9Lf.js','/assets/x-OohQberg.js','/assets/toast-hIcI356p.js','/assets/github_widget-R1gwNBdG.js','/assets/package-B8KgwFrP.js','/assets/index-CZUknZXM.js','/assets/utils-DcAaEMf9.js'],'css':[]}},'url':'/assets/manifest-61bf3a2a.js','version':'61bf3a2a'};

/**
       * `mode` is only relevant for the old Remix compiler but
       * is included here to satisfy the `ServerBuild` typings.
       */
      const mode = "production";
      const assetsBuildDirectory = "build/client";
      const basename = "/";
      const future = {"v3_fetcherPersist":true,"v3_relativeSplatPath":true,"v3_throwAbortReason":true,"v3_routeConfig":false,"v3_singleFetch":true,"v3_lazyRouteDiscovery":true,"unstable_optimizeDeps":false};
      const isSpaMode = false;
      const publicPath = "/";
      const entry = { module: entryServer };
      const routes = {
        "root": {
          id: "root",
          parentId: undefined,
          path: "",
          index: undefined,
          caseSensitive: undefined,
          module: route0
        },
  "routes/_user.database.$db._index": {
          id: "routes/_user.database.$db._index",
          parentId: "routes/_user",
          path: "database/:db",
          index: true,
          caseSensitive: undefined,
          module: route1
        },
  "routes/_user.database.$db.$col": {
          id: "routes/_user.database.$db.$col",
          parentId: "routes/_user",
          path: "database/:db/:col",
          index: undefined,
          caseSensitive: undefined,
          module: route2
        },
  "routes/_user.database._index": {
          id: "routes/_user.database._index",
          parentId: "routes/_user",
          path: "database",
          index: true,
          caseSensitive: undefined,
          module: route3
        },
  "routes/_base.connections": {
          id: "routes/_base.connections",
          parentId: "routes/_base",
          path: "connections",
          index: undefined,
          caseSensitive: undefined,
          module: route4
        },
  "routes/_base.profile": {
          id: "routes/_base.profile",
          parentId: "routes/_base",
          path: "profile",
          index: undefined,
          caseSensitive: undefined,
          module: route5
        },
  "routes/_base.create": {
          id: "routes/_base.create",
          parentId: "routes/_base",
          path: "create",
          index: undefined,
          caseSensitive: undefined,
          module: route6
        },
  "routes/_user._index": {
          id: "routes/_user._index",
          parentId: "routes/_user",
          path: undefined,
          index: true,
          caseSensitive: undefined,
          module: route7
        },
  "routes/logout": {
          id: "routes/logout",
          parentId: "root",
          path: "logout",
          index: undefined,
          caseSensitive: undefined,
          module: route8
        },
  "routes/_base": {
          id: "routes/_base",
          parentId: "root",
          path: undefined,
          index: undefined,
          caseSensitive: undefined,
          module: route9
        },
  "routes/_user": {
          id: "routes/_user",
          parentId: "root",
          path: undefined,
          index: undefined,
          caseSensitive: undefined,
          module: route10
        },
  "routes/error": {
          id: "routes/error",
          parentId: "root",
          path: "error",
          index: undefined,
          caseSensitive: undefined,
          module: route11
        },
  "routes/login": {
          id: "routes/login",
          parentId: "root",
          path: "login",
          index: undefined,
          caseSensitive: undefined,
          module: route12
        }
      };

export { serverManifest as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, mode, publicPath, routes };

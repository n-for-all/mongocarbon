import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function matches(event, array) {
    for (let i = 0; i < array.length; i++) {
        if (match(event, array[i])) {
            return true;
        }
    }
    return false;
}

export function match(
    eventOrCode,
    {
        key,
        which,
        keyCode,
        code,
    }: {
        key?: string | string[];
        which?: number;
        keyCode?: number;
        code?: string;
    } = {}
) {
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

export const isArraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export const EnterKey = {
    key: "Enter",
    which: 13,
    keyCode: 13,
    code: "Enter",
};

export const EscapeKey = {
    key: ["Escape", "Esc"],
    which: 27,
    keyCode: 27,
    code: "Esc",
};

export const SpaceKey = {
    key: " ",
    which: 32,
    keyCode: 32,
    code: "Space",
};

export const ArrowLeftKey = {
    key: "ArrowLeft",
    which: 37,
    keyCode: 37,
    code: "ArrowLeft",
};

export const ArrowUpKey = {
    key: "ArrowUp",
    which: 38,
    keyCode: 38,
    code: "ArrowUp",
};

export const ArrowRightKey = {
    key: "ArrowRight",
    which: 39,
    keyCode: 39,
    code: "ArrowRight",
};

export const ArrowDownKey = {
    key: "ArrowDown",
    which: 40,
    keyCode: 40,
    code: "ArrowDown",
};

export const HomeKey = {
    key: "Home",
    which: 36,
    keyCode: 36,
    code: "Numpad7",
};

export const EndKey = {
    key: "End",
    which: 35,
    keyCode: 35,
    code: "Numpad1",
};

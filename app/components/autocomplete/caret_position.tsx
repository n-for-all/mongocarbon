"use strict";

export default function (el) {
	let start = 0,
		end = 0;

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

export function setCaretPosition(elem, caretPos) {
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

import React, { useState, useEffect, useRef } from "react";
import getCaretCoordinates from "textarea-caret";
import getInputSelection, { setCaretPosition } from "./caret_position";
import scrollIntoView from "scroll-into-view-if-needed";
import isEqual from "lodash.isequal";

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;

const OPTION_LIST_MIN_WIDTH = 100;

interface AutocompleteTextFieldProps {
	Component?: React.ElementType;
	defaultValue?: string;
	disabled?: boolean;
	maxOptions?: number;
	onBlur?: (e: React.FocusEvent) => void;
	onChange?: (value: string) => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	onRequestOptions?: (query: string) => void;
	onSelect?: (value: string) => void;
	changeOnSelect?: (trigger: string, slug: string) => string;
	options?: { [key: string]: string[] } | string[];
	regex?: string;
	matchAny?: boolean;
	minChars?: number;
	requestOnlyIfNoOptions?: boolean;
	spaceRemovers?: string[];
	spacer?: string;
	trigger?: string | string[];
	value?: string;
	offsetX?: number;
	offsetY?: number;
	passThroughEnter?: boolean;
	passThroughTab?: boolean;
	triggerMatchWholeWord?: boolean;
	triggerCaseInsensitive?: boolean;
	className: string;
	attributes?: { [x: string]: any };
}

const AutocompleteTextField: React.FC<AutocompleteTextFieldProps> = ({
	Component = "textarea",
	defaultValue = "",
	disabled = false,
	maxOptions = 6,
	onBlur = () => {},
	onChange = () => {},
	onKeyDown = () => {},
	onRequestOptions = () => {},
	onSelect = () => {},
	changeOnSelect = (trigger, slug) => {
		if (slug.substring(0, 1) == trigger) {
			return slug;
		}
		return trigger + slug;
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
	attributes,
}) => {
	const [state, setState] = useState<{
		helperVisible: boolean;
		left: number;
		trigger: string | null;
		matchLength: number;
		matchStart: number;
		options: string[];
		selection: number;
		top: number;
		caret: number;
	}>({
		helperVisible: false,
		left: 0,
		trigger: null,
		matchLength: 0,
		matchStart: 0,
		options: [] as string[],
		selection: 0,
		top: 0,
		caret: 0,
	});

	const recentValue = useRef(defaultValue);
	const enableSpaceRemovers = useRef(false);
	const refInput = useRef<HTMLTextAreaElement>(null);
	const refCurrent = useRef<HTMLLIElement>(null);
	const refParent = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const handleResize = () => setState((prevState) => ({ ...prevState, helperVisible: false }));
		window.addEventListener("resize", handleResize);
		window.addEventListener("scroll", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("scroll", handleResize);
		};
	}, []);

	// useEffect(() => {
	// 	const { caret } = state;
	// 	updateHelper(recentValue.current, caret, options);
	// }, [options]);

	useEffect(() => {
		const { helperVisible } = state;

		if (helperVisible && refCurrent.current) {
			scrollIntoView(refCurrent.current, { boundary: refParent.current, scrollMode: "if-needed" });
		}
	}, [state.caret, state.helperVisible]);

	const getMatch = (str: string, caret: number, providedOptions: { [key: string]: string[] } | string[]) => {
		const re = new RegExp(regex);

		let triggers: string[] = [];
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
		let slugData: any = null;

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
					const options = triggerOptions.filter((slug) => {
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
							options,
						};
					} else {
						slugData = {
							...slugData,
							trigger: currTrigger,
							matchStart: matchStart - 1,
							matchLength,
							options,
						};
					}
				}
			}
		}

		return slugData;
	};

	const arrayTriggerMatch = (triggers: string[], re: RegExp) => {
		return triggers.map((trigger) => ({
			triggerStr: trigger,
			triggerMatch: trigger.match(re),
			triggerLength: trigger.length,
		}));
	};

	const isTrigger = (trigger: string, str: string, i: number) => {
		if (!trigger || !trigger.length) {
			return true;
		}

		if (triggerMatchWholeWord && i > 0 && str.charAt(i - 1).match(/[\w]/)) {
			return false;
		}

		if (str.substr(i, trigger.length) === trigger || (triggerCaseInsensitive && str.substr(i, trigger.length).toLowerCase() === trigger.toLowerCase())) {
			return true;
		}

		return false;
	};

	const handleBlur = (e: React.FocusEvent) => {
		resetHelper();
		if (onBlur) {
			onBlur(e);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
					if (
						i >= 2 &&
						str[i - 1] === spacer &&
						spaceRemovers.indexOf(str[i - 2]) === -1 &&
						spaceRemovers.indexOf(str[i]) !== -1 &&
						getMatch(str.substring(0, i - 2), caret - 3, options)
					) {
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

	const handleKeyDown = (event: React.KeyboardEvent) => {
		const { helperVisible, options, selection } = state;

		const optionsCount = maxOptions > 0 ? Math.min(options.length, maxOptions) : options.length;

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

	const handleSelection = (idx: number) => {
		const { matchStart, matchLength, options, trigger } = state;

		const slug = options[idx];
		const value = recentValue.current;
		if (trigger) {
			const part1 = trigger.length === 0 ? "" : value.substring(0, matchStart - trigger.length);
			const part2 = value.substring(matchStart + matchLength);

			const event = { target: refInput.current };
			const changedStr = changeOnSelect(trigger, slug);

			if (event.target) {
				event.target.value = `${part1}${changedStr}${spacer}${part2}`;
				handleChange(event as React.ChangeEvent<HTMLTextAreaElement>);
				onSelect(event.target.value);
			}

			resetHelper();

			const advanceCaretDistance = part1.length + changedStr.length + (spacer ? spacer.length : 1);

			updateCaretPosition(advanceCaretDistance);

			enableSpaceRemovers.current = true;
		}
	};

	const updateCaretPosition = (caret: number) => {
		setState((prevState) => {
			const newState = { ...prevState, caret };
			setCaretPosition(refInput.current, caret);
			return newState;
		});
	};

	const updateHelper = (str: string, caret: number, options: { [key: string]: string[] } | string[]) => {
		const input = refInput.current;

		const slug = getMatch(str, caret, options);

		if (slug && input) {
			const caretPos = getCaretCoordinates(input, caret);
			const rect = input.getBoundingClientRect();

			const top = caretPos.top + rect.top - input.scrollTop;
			const left = Math.min(caretPos.left + rect.left - input.scrollLeft, window.innerWidth - OPTION_LIST_MIN_WIDTH);

			if (
				slug.matchLength >= minChars &&
				(slug.options.length > 1 || (slug.options.length === 1 && (slug.options[0].length !== slug.matchLength || slug.options[0].length === 1)))
			) {
				setState({
					...state,
					helperVisible: true,
					top,
					left,
					...slug,
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
		const { helperVisible, left, matchStart, matchLength, options, selection, top } = state;

		if (!helperVisible) {
			return null;
		}

		if (options.length === 0) {
			return null;
		}

		if (selection >= options.length) {
			setState((prevState) => ({ ...prevState, selection: 0 }));

			return null;
		}

		const optionNumber = maxOptions === 0 ? options.length : maxOptions;

		const helperOptions = options.slice(0, optionNumber).map((val, idx) => {
			let highlightStart = 0;
			if (value) {
				highlightStart = val.toLowerCase().indexOf(value.substr(matchStart, matchLength).toLowerCase());
			}
			return (
				<li
					className={"cursor-pointer px-2 py-1 text-xs" + (idx === selection ? " bg-neutral-200" : "")}
					ref={idx === selection ? refCurrent : null}
					key={val}
					onClick={() => {
						handleSelection(idx);
					}}
					onMouseDown={(e) => {
						e.preventDefault();
					}}
					onMouseEnter={() => {
						setState((prevState) => ({ ...prevState, selection: idx }));
					}}>
					{val.slice(0, highlightStart)}
					<strong className="font-bold">{val.substr(highlightStart, matchLength)}</strong>
					{val.slice(highlightStart + matchLength)}
				</li>
			);
		});

		const maxWidth = window.innerWidth - left - offsetX - 5;
		const maxHeight = window.innerHeight - top - offsetY - 5;

		return (
			<ul
				className="fixed bottom-auto z-50 block p-px mt-1 overflow-y-scroll text-xs text-left bg-white border border-solid bg-clip-padding border-neutral-100"
				style={{
					left: left + offsetX,
					top: top + offsetY,
					maxHeight,
					maxWidth,
				}}
				ref={refParent}>
				{helperOptions}
			</ul>
		);
	};
	return (
		<>
			<Component
				{...attributes}
				className={className}
				disabled={disabled}
				onBlur={handleBlur}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				ref={refInput}
				value={value}
			/>
			{renderAutocompleteList()}
		</>
	);
};

export default AutocompleteTextField;

import React, { useState, useEffect, useRef } from "react";

interface SuggestProps {
	top: number;
	left: number;
	activeIndex: number;
	suggests: Array<string>;
	isOpen: boolean;
	limitToParent: boolean;
	char: string;
	showCharInList: boolean;
	listClass: string;
	inactiveItemStyle: { [x: string]: string };
	activeItemStyle: { [x: string]: string };
	activeItemClass: string;
	inactiveItemClass: string;
	charStyle: { [x: string]: string };

	textareaEl: React.RefObject<HTMLTextAreaElement>;
}

const styles = {
	panel: {
		position: "absolute" as any,
		minWidth: "150px",
		minHeight: "34px",
		background: "#FFF",
		boxShadow: "1px 3px 28px rgba(0,0,0,0.4)",
		animation: "200ms ease-out",
		willChange: "transform, opacity",
		borderRadius: "5px",
		margin: 0,
		padding: 0,
	},

	item: {
		background: "#FFF",
		color: "#222",
		listStyle: "none",
		padding: ".5em .5em",
	},

	itemActive: {
		background: "#3f51b5",
		color: "#FFF",
		listStyle: "none",
		padding: ".5em .5em",
	},

	char: {
		marginRight: ".2em",
	},
};

const Suggest = (props: SuggestProps) => {
	const [left, setLeft] = useState(0);
	const panelRef = useRef<HTMLUListElement | null>(null);

	useEffect(() => {
		// Restrict ul list position in the parent's width
		const { current } = panelRef;
		const width = parseFloat((current?.clientWidth || 100).toString());

		const parentWidth = props.textareaEl.current?.offsetWidth;
		let nextLeft = props.left - width / 2;
		if (parentWidth && props.limitToParent) {
			// It's fixed left position
			if (nextLeft < 0) nextLeft = 0;
			if (nextLeft + width > parentWidth) nextLeft = parentWidth - width;
		}
		if (nextLeft !== left) {
			setLeft(nextLeft);
		}
	}, [props.isOpen]);

	const { suggests, activeIndex, char, showCharInList, isOpen, listClass, inactiveItemStyle, activeItemStyle, activeItemClass, inactiveItemClass, charStyle } = props;

	const suggestStyles = {
		left,
		top: `${suggests.length * 36}px`,
		opacity: isOpen ? "1" : "0",
		transition: "opacity 200ms ease-out",
		zIndex: isOpen ? "1000" : "-1",
	};

	const endListStyles = {
		...styles.panel,
		...suggestStyles,
	};

	const itemStyleInactive = {
		...styles.item,
		...inactiveItemStyle,
	};

	const itemStyleActive = {
		...styles.itemActive,
		...activeItemStyle,
	};

	const charStyles = {
		...styles.char,
		...charStyle,
	};

	return (
		<ul style={endListStyles} className={listClass} ref={panelRef}>
			{suggests.map((suggest, index) => (
				<li key={suggest} style={index === activeIndex ? itemStyleActive : itemStyleInactive} className={index === activeIndex ? activeItemClass : inactiveItemClass}>
					{showCharInList ? <span style={charStyles}>{char}</span> : ""}
					{suggest}
				</li>
			))}
		</ul>
	);
};

export default Suggest;

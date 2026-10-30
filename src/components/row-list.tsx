import type * as React from "react";
import { useEffect, useRef } from "react";

export type RowListProps<T> = {
	items: readonly T[];
	selectedId: string | null;
	onSelect: (item: T) => void;
	renderRow: (
		item: T,
		state: { isSelected: boolean; isFocused: boolean },
	) => React.ReactNode;
	getKey: (item: T) => string;
	ariaLabel: string;
	className?: string;
	onRowKeyDown?: (item: T, e: React.KeyboardEvent<HTMLDivElement>) => void;
};

export function RowList<T>({
	items,
	selectedId,
	onSelect,
	renderRow,
	getKey,
	ariaLabel,
	className,
	onRowKeyDown,
}: RowListProps<T>) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	// Compute active focused index/key
	// If selectedId exists and matches an item, that is our focused item.
	// Otherwise, default to first item if available, or none if items is empty.
	const selectedIndex = items.findIndex((item) => getKey(item) === selectedId);
	const activeIndex =
		selectedIndex !== -1 ? selectedIndex : items.length > 0 ? 0 : -1;
	const activeItem = activeIndex !== -1 ? items[activeIndex] : null;
	const activeKey = activeItem ? getKey(activeItem) : null;

	// Scroll active element into view smoothly when activeKey changes
	useEffect(() => {
		if (!activeKey) return;
		const el = rowRefs.current.get(activeKey);
		if (el) {
			el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [activeKey]);

	const moveFocusToIndex = (newIndex: number) => {
		if (items.length === 0) return;
		const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
		const targetItem = items[clampedIndex];
		const targetKey = getKey(targetItem);

		onSelect(targetItem);

		const el = rowRefs.current.get(targetKey);
		if (el) {
			el.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (items.length === 0) return;

		// Directional navigation keys (ignore if Alt key is pressed for reordering)
		if (!e.altKey && e.key === "ArrowDown") {
			e.preventDefault();
			const currentIndex =
				selectedIndex !== -1
					? selectedIndex
					: activeIndex !== -1
						? activeIndex
						: 0;
			moveFocusToIndex(currentIndex + 1);
			return;
		}

		if (!e.altKey && e.key === "ArrowUp") {
			e.preventDefault();
			const currentIndex =
				selectedIndex !== -1
					? selectedIndex
					: activeIndex !== -1
						? activeIndex
						: 0;
			moveFocusToIndex(currentIndex - 1);
			return;
		}

		if (e.key === "Home") {
			e.preventDefault();
			moveFocusToIndex(0);
			return;
		}

		if (e.key === "End") {
			e.preventDefault();
			moveFocusToIndex(items.length - 1);
			return;
		}
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
		<div
			ref={containerRef}
			role="grid"
			aria-label={ariaLabel}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			className={className}
		>
			{items.map((item, index) => {
				const key = getKey(item);
				const isSelected = selectedId !== null && key === selectedId;
				const isFocused = activeKey !== null ? key === activeKey : index === 0;

				return (
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
					<div
						key={key}
						ref={(node) => {
							if (node) {
								rowRefs.current.set(key, node);
							} else {
								rowRefs.current.delete(key);
							}
						}}
						role="row"
						aria-selected={isSelected}
						tabIndex={isSelected ? 0 : isFocused ? 0 : -1}
						onClick={() => onSelect(item)}
						onKeyDown={onRowKeyDown ? (e) => onRowKeyDown(item, e) : undefined}
						onFocus={() => {
							if (!isSelected) {
								onSelect(item);
							}
						}}
						className="focus-ring-inset outline-none"
					>
						{renderRow(item, { isSelected, isFocused })}
					</div>
				);
			})}
		</div>
	);
}

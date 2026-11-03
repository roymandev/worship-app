export type WorkspacePanelTarget = "playlist" | "stage" | "live";

const FALLBACK_FOCUSABLE_SELECTOR =
	'button:not([disabled]), a[href], [role="grid"], [role="row"], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focuses the specified workspace panel using Container DOM Delegation.
 *
 * 1. Locates the container element with `[data-workspace-panel="${target}"]`.
 * 2. Searches inside that container for an active roving item (`[tabindex="0"]`).
 * 3. If found, calls `.focus()` on the roving item.
 * 4. If not found, falls back to accessible focusable controls within the panel:
 *    `button:not([disabled]), a[href], [role="grid"], [role="row"]`, etc.
 * 5. Returns `true` if an element was successfully focused, `false` otherwise.
 */
export function focusWorkspacePanel(target: WorkspacePanelTarget): boolean {
	if (typeof document === "undefined") {
		return false;
	}

	const panel = document.querySelector<HTMLElement>(
		`[data-workspace-panel="${target}"]`,
	);

	if (!panel) {
		return false;
	}

	const rovingItem = panel.querySelector<HTMLElement>('[tabindex="0"]');
	if (rovingItem) {
		rovingItem.focus();
		return true;
	}

	const fallbackInteractive = panel.querySelector<HTMLElement>(
		FALLBACK_FOCUSABLE_SELECTOR,
	);
	if (fallbackInteractive) {
		fallbackInteractive.focus();
		return true;
	}

	return false;
}

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import packageJson from "../../package.json" with { type: "json" };

GlobalRegistrator.register();

// biome-ignore lint/suspicious/noExplicitAny: Global compile-time version injected into test runtime
(globalThis as any).__APP_VERSION__ = packageJson.version;

// biome-ignore lint/suspicious/noExplicitAny: React act testing environment flag on globalThis
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof HTMLDialogElement !== "undefined") {
	if (!HTMLDialogElement.prototype.showModal) {
		HTMLDialogElement.prototype.showModal = function () {
			this.setAttribute("open", "");
		};
	}
	if (!HTMLDialogElement.prototype.close) {
		HTMLDialogElement.prototype.close = function () {
			this.removeAttribute("open");
		};
	}
}

if (typeof globalThis.ResizeObserver === "undefined") {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (typeof window.matchMedia === "undefined") {
	window.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

if (typeof Element.prototype.scrollIntoView === "undefined") {
	Element.prototype.scrollIntoView = () => {};
}

const { expect } = await import("bun:test");
// biome-ignore lint/suspicious/noExplicitAny: matchers namespace type compatibility with expect.extend
const matchers = (await import("@testing-library/jest-dom/matchers")) as any;

expect.extend(matchers);

function formatElement(el: unknown): string {
	if (!el || typeof el !== "object" || !("tagName" in el)) {
		return String(el);
	}
	const node = el as Element;
	const parts: string[] = [node.tagName?.toLowerCase() || "element"];
	const role = node.getAttribute?.("role");
	if (role) parts.push(`role="${role}"`);
	const ariaLabel = node.getAttribute?.("aria-label");
	if (ariaLabel) parts.push(`aria-label="${ariaLabel}"`);
	const testId = node.getAttribute?.("data-testid");
	if (testId) parts.push(`data-testid="${testId}"`);
	if (node.id) parts.push(`id="${node.id}"`);
	if (node.className && typeof node.className === "string") {
		parts.push(`class="${node.className}"`);
	}
	return `<${parts.join(" ")}>`;
}

expect.extend({
	toHaveFocus(received: unknown) {
		const el = (
			received && typeof received === "object" && "ownerDocument" in received
				? received
				: null
		) as Element | null;
		const doc = el?.ownerDocument ?? globalThis.document;
		const activeElement = doc?.activeElement;
		const pass = Boolean(el && doc && el === activeElement);
		return {
			pass,
			message: () =>
				pass
					? `expected element not to have focus, but it has focus: ${formatElement(received)}`
					: `expected element to have focus: ${formatElement(received)}\nreceived: ${formatElement(activeElement)}`,
		};
	},
});

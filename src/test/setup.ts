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

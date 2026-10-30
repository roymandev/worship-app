import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "bun:test" {
	// biome-ignore lint/suspicious/noExplicitAny: matchers interface augmentation requires any for generic matcher typing
	interface Matchers<T = any>
		extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}

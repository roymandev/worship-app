import { describe, expect, it } from "bun:test";
import releasePleaseManifest from "../../.release-please-manifest.json" with {
	type: "json",
};
import packageJson from "../../package.json" with { type: "json" };
import releasePleaseConfig from "../../release-please-config.json" with {
	type: "json",
};
import { APP_VERSION } from "./version";

describe("APP_VERSION", () => {
	it("is defined and matches SemVer format", () => {
		expect(APP_VERSION).toBeDefined();
		expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
	});

	it("matches package.json version", () => {
		expect(APP_VERSION).toBe(packageJson.version);
	});
});

describe("Release Please config and manifest integrity", () => {
	it("parses .release-please-manifest.json and matches packageJson.version", () => {
		expect(releasePleaseManifest).toBeDefined();
		expect(typeof releasePleaseManifest).toBe("object");
		expect(releasePleaseManifest["."]).toBe(packageJson.version);
	});

	it("parses release-please-config.json and contains valid pre-release, bootstrap, and tag settings", () => {
		expect(releasePleaseConfig).toBeDefined();
		expect(typeof releasePleaseConfig).toBe("object");
		expect(releasePleaseConfig["include-component-in-tag"]).toBe(false);
		expect(releasePleaseConfig["bootstrap-sha"]).toBe(
			"c8d9d5d8cdaf7499a3b8042626e2806aa5fdf830",
		);
		expect(releasePleaseConfig.packages?.["."]?.prerelease).toBe(true);
		expect(releasePleaseConfig.packages?.["."]?.["prerelease-type"]).toBe(
			"alpha",
		);
		expect(releasePleaseConfig.packages?.["."]?.["release-as"]).toBe(
			"2.0.0-alpha.0",
		);
	});
});

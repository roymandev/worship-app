import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs UI component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders tablist with triggers and default active content", () => {
		render(
			<Tabs defaultValue="general">
				<TabsList>
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="background">Background</TabsTrigger>
				</TabsList>
				<TabsContent value="general">General Tab Content</TabsContent>
				<TabsContent value="background">Background Tab Content</TabsContent>
			</Tabs>,
		);

		const tablist = screen.getByRole("tablist");
		expect(tablist).toBeInTheDocument();

		const generalTab = screen.getByRole("tab", { name: "General" });
		const backgroundTab = screen.getByRole("tab", { name: "Background" });

		expect(generalTab).toBeInTheDocument();
		expect(backgroundTab).toBeInTheDocument();
		expect(generalTab).toHaveAttribute("aria-selected", "true");
		expect(backgroundTab).toHaveAttribute("aria-selected", "false");

		expect(screen.getByText("General Tab Content")).toBeInTheDocument();
		expect(
			screen.queryByText("Background Tab Content"),
		).not.toBeInTheDocument();
	});

	it("switches active tab and content on click", async () => {
		const user = userEvent.setup();
		render(
			<Tabs defaultValue="general">
				<TabsList>
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="background">Background</TabsTrigger>
				</TabsList>
				<TabsContent value="general">General Tab Content</TabsContent>
				<TabsContent value="background">Background Tab Content</TabsContent>
			</Tabs>,
		);

		const generalTab = screen.getByRole("tab", { name: "General" });
		const backgroundTab = screen.getByRole("tab", { name: "Background" });

		await user.click(backgroundTab);

		expect(backgroundTab).toHaveAttribute("aria-selected", "true");
		expect(generalTab).toHaveAttribute("aria-selected", "false");
		expect(screen.getByText("Background Tab Content")).toBeInTheDocument();
		expect(screen.queryByText("General Tab Content")).not.toBeInTheDocument();
	});

	it("supports keyboard navigation with arrow keys and activation", async () => {
		const user = userEvent.setup();
		render(
			<Tabs defaultValue="general">
				<TabsList>
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="background">Background</TabsTrigger>
				</TabsList>
				<TabsContent value="general">General Tab Content</TabsContent>
				<TabsContent value="background">Background Tab Content</TabsContent>
			</Tabs>,
		);

		const generalTab = screen.getByRole("tab", { name: "General" });
		const backgroundTab = screen.getByRole("tab", { name: "Background" });

		generalTab.focus();
		expect(generalTab).toHaveFocus();

		await user.keyboard("{ArrowRight}");
		expect(backgroundTab).toHaveFocus();

		// Activate via Space or Enter if not activateOnFocus
		await user.keyboard("{Enter}");
		expect(backgroundTab).toHaveAttribute("aria-selected", "true");
		expect(screen.getByText("Background Tab Content")).toBeInTheDocument();
	});
});

import { HotkeysProvider } from "@tanstack/react-hotkeys";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { appHotkeys } from "@/features/workspace/hotkeys";

export const Route = createRootRoute({
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: RootErrorComponent,
	pendingComponent: PendingComponent,
});

function RootComponent() {
	return (
		<HotkeysProvider
			appHotkeys={appHotkeys}
			defaultOptions={{ hotkey: { ignoreInputs: "auto" } }}
		>
			<Outlet />
		</HotkeysProvider>
	);
}

function NotFoundComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
			<h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
				404
			</h1>
			<p className="mt-4 text-lg text-gray-600">
				Sorry, we couldn&apos;t find the page you&apos;re looking for.
			</p>
			<div className="mt-6">
				<Link
					to="/"
					className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					Go back home
				</Link>
			</div>
		</div>
	);
}

function RootErrorComponent({
	error,
	reset,
}: {
	error: unknown;
	reset: () => void;
}) {
	const errorMessage =
		error instanceof Error
			? error.message
			: "An unexpected error occurred while loading this page.";

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
			<h1 className="text-3xl font-bold tracking-tight text-red-600 sm:text-4xl">
				Something went wrong
			</h1>
			<p className="mt-4 max-w-md text-sm text-gray-600">{errorMessage}</p>
			<div className="mt-6">
				<button
					type="button"
					onClick={reset}
					className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
				>
					Retry
				</button>
			</div>
		</div>
	);
}

function PendingComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<output
				className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent inline-block"
				aria-label="Loading"
			/>
		</div>
	);
}

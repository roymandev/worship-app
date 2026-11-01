/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
	__db?: {
		db: import("./db").WorshipDatabase;
		resetDatabase: typeof import("./db").resetDatabase;
		seedDemoData: typeof import("./db").seedDemoData;
	};
}

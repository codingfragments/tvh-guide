/// <reference types="@sveltejs/kit" />

declare namespace App {
	interface Locals {
		user: string;
		db: import('$lib/server/types/database').DataStore;
	}
}

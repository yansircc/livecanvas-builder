"use server";

import { signIn, signOut } from "@/server/auth";

export async function login(
	provider: string,
	options?: { callbackUrl?: string },
) {
	await signIn(provider, options);
}

export async function logout(options?: { redirectTo?: string }) {
	await signOut(options);
}

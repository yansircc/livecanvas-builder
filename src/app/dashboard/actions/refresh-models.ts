"use server";

import { revalidateModelListCache } from "@/server/cache";

export async function refreshModels() {
	console.log("Refreshing models");
	await revalidateModelListCache();
}

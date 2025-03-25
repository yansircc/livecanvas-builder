"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Define return types
interface UserData {
	id: string;
	name: string;
	email: string;
	image: string | null;
	backgroundInfo: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface AuthSuccess {
	success: true;
	user: UserData;
}

interface AuthError {
	success: false;
	error: string;
}

type AuthResult = AuthSuccess | AuthError;

// Separate non-cached function to get session (uses headers)
export async function getCurrentUser(): Promise<AuthResult> {
	const session = await auth();

	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	return getUserData(session.user.id);
}

// Cached function that accepts user ID as a parameter
async function getUserData(userId: string): Promise<AuthResult> {
	"use cache";

	const userData = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});

	if (!userData) {
		return { success: false, error: "User not found" };
	}

	return {
		success: true,
		user: {
			id: userData.id,
			name: userData.name,
			email: userData.email,
			image: userData.image,
			backgroundInfo: userData.backgroundInfo,
			createdAt: userData.createdAt,
			updatedAt: userData.updatedAt,
		},
	};
}

export async function updateUserProfile(formData: {
	name: string;
	image?: string | null;
	backgroundInfo?: string | null;
}) {
	const session = await auth();

	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	const { name, image, backgroundInfo } = formData;

	if (!name || name.trim() === "") {
		return { success: false, error: "Name is required" };
	}

	await db
		.update(user)
		.set({
			name,
			image,
			backgroundInfo,
			updatedAt: new Date(),
		})
		.where(eq(user.id, session.user.id));

	const updatedUser = await db.query.user.findFirst({
		where: eq(user.id, session.user.id),
	});

	if (!updatedUser) {
		return { success: false, error: "Failed to update user" };
	}

	return {
		success: true,
		message: "Updated successfully",
		user: {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			image: updatedUser.image,
			backgroundInfo: updatedUser.backgroundInfo,
		},
	};
}

/**
 * This example shows how to cache data and revalidate it by tag
 * Note that this is the canary version of the latest nextjs
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/dynamicIO
 * @see https://nextjs.org/docs/app/api-reference/directives/use-cache
 * @see https://nextjs.org/docs/app/api-reference/functions/cacheTag
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife
 */

import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Session } from "next-auth";
import { unstable_cacheLife as cacheLife, revalidateTag } from "next/cache";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Must use this wrapper function since the auth session data is not cached by default
async function getCachedSessionData(sessionData: Session) {
  addAuthCacheTags(sessionData.user.id);

  // Simulate a loading delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return sessionData;
}

async function getRandomNumber() {
  "use cache";
  cacheLife("minutes"); // cache for 1 minute, available options: "seconds", "minutes", "hours", "days", "weeks", "max"

  await new Promise((resolve) => setTimeout(resolve, 1500));
  return Math.random();
}

// Function to revalidate the cache by tag, must use "use server"
async function revalidateUserProfile() {
  "use server";
  revalidateTag("auth");
}

// Must set a suspense component to cache the data
async function SuspenseUserProfile() {
  const sessionData = await auth();
  if (!sessionData) {
    return <p>Not logged in</p>;
  }
  const session = await getCachedSessionData(sessionData);
  return <p>Logged in as {session.user?.name}</p>;
}

const SuspenseRandomNumber = () => {
  const randomNumber = getRandomNumber();
  return <p>Random number: {randomNumber}</p>;
};

const SuspenseFallback = () => {
  return <p>Loading...</p>;
};

const ErrorFallback = () => {
  return <p>Error</p>;
};

export default async function Home() {
  return (
    <main>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<SuspenseFallback />}>
          <SuspenseUserProfile />
        </Suspense>
        <form action={revalidateUserProfile}>
          <button type="submit">Revalidate</button>
        </form>
      </ErrorBoundary>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<SuspenseFallback />}>
          <SuspenseRandomNumber />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

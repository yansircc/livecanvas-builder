export default function ProfileLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading profile information...</p>
      </div>
    </div>
  )
}

export default function DaisyPreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="preview-layout">{children}</div>
}

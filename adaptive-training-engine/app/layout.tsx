import "./globals.css"

export const metadata = {
  title: "Adaptive Training Engine",
  description: "AI Based Strength Optimization System"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


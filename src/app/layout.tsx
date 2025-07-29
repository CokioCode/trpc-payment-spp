import TrpcProvider from "@/providers/TrpcProvider";
import { AuthProvider } from "../context/auth-context";
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <TrpcProvider>{children}</TrpcProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

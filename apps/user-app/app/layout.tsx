import "./globals.css";
import { Providers } from "../provider";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <Providers>
        {children}
      </Providers>
    </html>
  );
}

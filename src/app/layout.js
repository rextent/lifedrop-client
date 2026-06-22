import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalToaster from "@/components/GlobalToaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Blood Donation Platform",
  description: "A platform to connect blood donors with recipients",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="light" 
    >
      <body
        className={`${poppins.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}
      >
        <GlobalToaster />
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
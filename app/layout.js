import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Mentora Edutors | Structured Home Learning for Classes 6–12",
  description:
    "Personalised home tutoring and competitive prep (JEE, NEET, CUET) for students from Class 6 to 12.",
};

const App = ({ children }) => {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-background font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
};

export default App;

import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MentorLeap - Leadership Training & Executive Coaching for Professionals",
  description: "Transform into a confident communicator & strategic leader. Expert guidance in executive presence, public speaking & professional development by Mridu Bhandari.",
  keywords: ["leadership training", "executive coaching", "public speaking bootcamp", "communication skills", "professional development"],
  authors: [{ name: "Mridu Bhandari" }],
  metadataBase: new URL("https://www.mentorleap.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MentorLeap - Leadership Training & Executive Coaching",
    description: "Transform into a confident communicator & strategic leader. Expert guidance in executive presence and public speaking.",
    url: "https://www.mentorleap.co",
    siteName: "MentorLeap",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MentorLeap Leadership Training",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorLeap - Leadership Training & Executive Coaching",
    description: "Transform into a confident communicator & strategic leader.",
    creator: "@mridubhandari",
    images: ["/twitter-image.jpg"],
  },
  verification: {
    google: "YwhLDLrnsBrguQBbhtemBTKCpTr4NJRvsLVtaxhqI_Y",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 Placeholder */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
        {/* Organization Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MentorLeap",
              "url": "https://www.mentorleap.co",
              "description": "Leadership training and executive coaching for professionals",
              "founder": "Mridu Bhandari",
              "sameAs": [
                "https://facebook.com/mentorleap",
                "https://twitter.com/mentorleap",
                "https://instagram.com/mentorleap",
                "https://linkedin.com/company/mentorleap",
                "https://youtube.com/@mentorleap"
              ]
            })
          }}
        />
      </head>
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{
          background: "#020617",
          overflowX: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
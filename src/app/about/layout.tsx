import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MentorLeap - Mridu Bhandari's Leadership Training",
  description: "Learn about MentorLeap's mission to empower professionals through communication and leadership training, led by founder Mridu Bhandari.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

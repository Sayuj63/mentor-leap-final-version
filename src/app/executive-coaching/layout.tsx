import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Coaching for Leaders & Professionals - MentorLeap",
  description: "1-on-1 executive coaching to develop leadership presence, communication skills & strategic thinking for senior professionals and founders with Mridu Bhandari.",
  alternates: {
    canonical: "/executive-coaching",
  },
};

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Events & Bootcamps - MentorLeap Leadership Training",
  description: "Join MentorLeap's high-impact live learning experiences, communication bootcamps, and leadership workshops for professionals.",
  alternates: {
    canonical: "/events",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

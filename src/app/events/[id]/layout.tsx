import { Metadata } from "next";

async function getEvent(id: string) {
  try {
    const res = await fetch(`https://www.mentorleap.co/api/events/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  
  if (!event) {
    return {
      title: "Event Details - MentorLeap",
    };
  }

  const title = `${event.title} - Communication & Leadership Bootcamp | MentorLeap`;
  const description = event.description || "Join this high-impact live training designed for executive presence and instant impact.";

  return {
    title,
    description,
    alternates: {
      canonical: `/events/${id}`,
    },
    openGraph: {
      title,
      description,
      images: [event.banner || "/og-image.jpg"],
    },
  };
}

export default async function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Speak With Impact Bootcamp",
            "description": "Master public speaking and leadership communication",
            "organizer": {
              "@type": "Organization",
              "name": "MentorLeap",
              "url": "https://www.mentorleap.co"
            }
          })
        }}
      />
      {children}
    </>
  );
}

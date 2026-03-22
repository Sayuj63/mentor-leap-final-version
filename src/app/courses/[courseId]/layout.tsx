import { Metadata } from "next";

async function getCourse(id: string) {
  try {
    const res = await fetch(`https://www.mentorleap.co/api/courses/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  
  if (!course) {
    return {
      title: "Course Details - MentorLeap",
    };
  }

  const title = `${course.title} | Executive Coaching Course | MentorLeap`;
  const description = course.description || "Master leadership communication and strategic presence in this comprehensive online course.";

  return {
    title,
    description,
    alternates: {
      canonical: `/courses/${courseId}`,
    },
    openGraph: {
      title,
      description,
      images: [course.thumbnail || "/og-image.jpg"],
    },
  };
}

export default async function CourseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Communication & Leadership Masterclass",
            "description": "Master strategic communication and building an influential personal brand for professionals.",
            "provider": {"@type": "Organization", "name": "MentorLeap"}
          })
        }}
      />
      {children}
    </>
  );
}

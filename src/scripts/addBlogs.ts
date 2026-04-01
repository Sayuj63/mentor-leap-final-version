import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/firebaseAdmin";

const BLOG_POSTS = [
    {
        title: "Executive Presence: How to Command Any Room",
        category: "Leadership",
        excerpt: "Learn the secrets to appearing confident, authoritative, and poised in high-stakes meetings and presentations.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
        readTime: "6 Min Read",
        date: new Date("2026-03-25")
    },
    {
        title: "The Pyramid Principle: Structuring Your Thoughts Like a Leader",
        category: "Communication",
        excerpt: "Discover the powerful framework used by top consulting firms to deliver clear, concise, and impactful messages.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
        readTime: "5 Min Read",
        date: new Date("2026-03-24")
    },
    {
        title: "Overcoming Stage Fright: A TV Journalist's Perspective",
        category: "Public Speaking",
        excerpt: "Mridu Bhandari shares her 20 years of experience on how to manage nerves and turn anxiety into peak performance.",
        image: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=800&q=80",
        readTime: "7 Min Read",
        date: new Date("2026-03-23")
    },
    {
        title: "Body Language for Virtual Meetings: Setting the Right Tonality",
        category: "Virtual Presence",
        excerpt: "Practical tips on framing, eye contact, and vocal modulation to make your digital presence as powerful as in-person.",
        image: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&q=80",
        readTime: "4 Min Read",
        date: new Date("2026-03-22")
    }
];

async function addBlogs() {
    console.log("--- Seeding Blog Posts ---");
    const blogCollection = db.collection("blogs");
    
    // Clear existing
    const snapshot = await blogCollection.get();
    for (const doc of snapshot.docs) {
        await doc.ref.delete();
    }
    
    for (const post of BLOG_POSTS) {
        const docRef = await blogCollection.add({
            ...post,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`Added blog: ${post.title} (ID: ${docRef.id})`);
    }
    console.log("--- Seeding Complete ---");
}

addBlogs().catch(console.error);

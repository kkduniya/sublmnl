// This script seeds the FAQ and Testimonials content into the database for the CMS
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sublmnl';
const client = new MongoClient(uri);

const faqItems = [
  {
    type: 'faq',
    title: 'What are subliminal affirmations?',
    content: 'Subliminal affirmations are positive statements designed to be perceived by your subconscious mind without conscious awareness. Our technology embeds these affirmations within background music at a volume below the conscious hearing threshold, allowing them to bypass critical thinking and directly influence your subconscious.',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
  {
    type: 'faq',
    title: 'How do subliminal affirmations work?',
    content: 'Your conscious mind can’t hear subliminal affirmations, so it can’t reject them. Instead, they go straight to your subconscious, where they’re accepted as truth. When your subconscious believes something, your thoughts, habits, and behaviors begin to align with it automatically. That’s the foundation of manifestation: what you believe dictates your reality. This process is backed by neuroscience and the brain’s ability to rewire itself through repetition and belief. ',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
  {
    type: 'faq',
    title: 'How often should I listen to my Sublmnl track?',
    content: 'Most users find that listening for around 30 minutes a day creates noticeable shifts over time. The key is consistency - gentle, regular exposure helps rewire your subconscious more effectively than long, occasional sessions. Find moments in your day that feel natural - whether it’s during a walk, while getting ready, or as part of your wind-down routine.',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
  // ...add all other FAQ items from your hardcoded array
];

const testimonialItems = [
  {
    type: 'testimonials',
    title: 'Sarah J.',
    content: JSON.stringify({
      quote: 'I’m a huge fan of subliminal affirmations and have listened to tons of generic ones on YouTube, but of course these weren’t personalized to me. Sublmnl is the first place I found where I could actually customize my own track, instantly. The AI helped me create the perfect affirmations for my goals, and the track was ready in seconds. Amazing!!',
      author: 'Sarah J.',
      role: 'Sales Manager',
      avatar: '/placeholder.svg?height=80&width=80'
    }),
    order: 1,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
  {
    type: 'testimonials',
    title: 'Michael T.',
    content: JSON.stringify({
      quote: 'I’ve listened to my custom affirmation track every day for two weeks and I noticed my mindset has completely transformed. I find myself thinking more positively without trying. It’s like these affirmations planted seeds of confidence that just keep growing. Plus, the music is very very catchy. It makes the whole experience feel effortless.',
      author: 'Michael T.',
      role: 'Software Engineer',
      avatar: '/placeholder.svg?height=80&width=80'
    }),
    order: 2,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
  {
    type: 'testimonials',
    title: 'Simi B.',
    content: JSON.stringify({
      quote: 'I’ve always struggled with traditional manifestation methods because deep down, it was hard to fully believe what I was saying. But with Sublmnl, it’s completely different, I don’t have to force anything or repeat affirmations out loud. I just play the music and let it work in the background. It’s the easiest and most natural way I’ve ever manifested positive changes. ',
      author: 'Simi B.',
      role: 'Consultant',
      avatar: '/placeholder.svg?height=80&width=80'
    }),
    order: 3,
    isActive: true,
    createdAt: new Date(),
    createdBy: null,
  },
];

const seed = async () => {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('content');
    await collection.insertMany([...faqItems, ...testimonialItems]);
    console.log('FAQ and Testimonials seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
};

seed(); 
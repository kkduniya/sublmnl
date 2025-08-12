// Using the provided categories
export const categories = [
    {
      id: "career",
      name: "Career",
      color: "bg-amber-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      affirmations: [
        "I am confident in my abilities and decisions.",
        "I trust myself to handle any challenge that comes my way.",
        "I am worthy of success and happiness.",
        "My confidence grows stronger every day.",
        // "I believe in myself completely.",
        "My energy, effort, and ideas are valued and well-compensated.",
        // "I radiate confidence, certainty, and self-assurance.",
        "Money flows to me because my work is powerful, aligned, and in demand.",
      ],
      image:"",
    },
    {
      id: "relationships",
      name: "Relationships",
      color: "bg-rose-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      affirmations: [
        "I attract positive and loving relationships into my life.",
        "I am worthy of love and respect from others.",
        "My relationships are healthy, balanced, and nurturing.",
        "I communicate my needs clearly and compassionately.",
        "I give and receive love freely and openly.",
        "I release all toxic relationships with grace and ease.",
      ],
      image:"",
    },
    {
      id: "health",
      name: "Health",
      color: "bg-green-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity-icon lucide-activity"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
      ),
      affirmations: [
        "My body is healthy, strong, and full of energy.",
        "I make choices that nourish my body and mind.",
        "I am grateful for my health and vitality.",
        "I prioritize my well-being every day.",
        "My body heals quickly and efficiently.",
        "I deserve to be healthy and feel good.",
      ],
      image:"",
    },
    {
      id: "wealth",
      name: "Wealth",
      color: "bg-blue-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      // Adding affirmations for the wealth category
      affirmations: [
        "I am a money magnet, and prosperity flows to me easily.",
        "I deserve abundance and financial success.",
        "My income increases constantly from multiple sources.",
        "I make smart financial decisions that grow my wealth.",
        "Money comes to me in expected and unexpected ways.",
        "I am open and receptive to all the wealth life offers me.",
      ],
      image:"",
    },

    {
      id: "overall",
      name: "Overall",
      color: "bg-purple-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor"><path d="M9 10c0 3.866 3 7 3 7s3-3.134 3-7s-3-7-3-7s-3 3.134-3 7"/><path d="M6.33 8C4.115 7.046 2 7 2 7s.096 4.381 2.857 7.143S12 17 12 17s4.381-.096 7.143-2.857S22 7 22 7s-2.114.046-4.33 1m-5.65 9c-.166 1.333.64 4 3.494 4c1.995 0 2.993-2 6.486 0c-.4-2-1.2-3.28-2.367-4m-7.654 0c.167 1.333-.64 4-3.492 4C6.49 21 5.493 19 2 21c.4-2 1.2-3.28 2.367-4"/></g></svg>
      ),
      affirmations: [
        "I am aligned with my highest purpose.",
        "Every day is an opportunity to grow and evolve.",
        "I trust the journey of life and embrace each moment.",
        "I am at peace with myself and the world around me.",
        "My life is a reflection of balance and inner harmony.",
        "I honor my needs, dreams, and potential in all areas of life.",
      ],
      image:"",
    },
  ]
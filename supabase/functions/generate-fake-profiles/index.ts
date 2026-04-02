import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FIRST_NAMES_MALE = [
  "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore",
  "Jack", "Ethan", "Michael", "Alexander", "Owen", "Daniel", "Matthew", "Leo", "John", "David",
  "Joseph", "Jackson", "Samuel", "Sebastian", "Gabriel", "Carter", "Anthony", "Dylan", "Luke", "Isaac"
];

const FIRST_NAMES_FEMALE = [
  "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Charlotte", "Amelia", "Mia", "Harper", "Evelyn",
  "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett", "Grace", "Chloe", "Victoria",
  "Riley", "Aria", "Lily", "Aubrey", "Zoey", "Penelope", "Hannah", "Layla", "Nora", "Addison"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
];

const MAJORS = [
  "Computer Science", "Business Administration", "Psychology", "Biology", "Engineering",
  "English", "Political Science", "Economics", "Communications", "Nursing",
  "Mathematics", "History", "Chemistry", "Sociology", "Marketing",
  "Finance", "Mechanical Engineering", "Pre-Med", "Environmental Science", "Art",
  "Education", "Criminal Justice", "Graphic Design", "Music", "Theater",
  "Journalism", "Philosophy", "Anthropology", "Architecture", "Data Science"
];

const BIOS = [
  "Coffee enthusiast and bookworm. Love late night study sessions and weekend adventures.",
  "Aspiring entrepreneur. Passionate about innovation and making a difference.",
  "Outdoor lover. When I'm not in class, you'll find me hiking or at the gym.",
  "Music is life. Always down for concerts and discovering new artists.",
  "Foodie exploring all the best spots on and off campus.",
  "Sports fan and intramural champion. Let's catch a game together!",
  "Art lover and creative soul. Constantly seeking inspiration.",
  "Travel enthusiast collecting memories around the world.",
  "Fitness junkie and wellness advocate. Healthy mind, healthy body.",
  "Movie buff and Netflix connoisseur. Always up for a film debate.",
  "Bookworm with a passion for storytelling and writing.",
  "Tech geek building the future, one line of code at a time.",
  "Sustainability advocate trying to make the world a better place.",
  "Aspiring chef experimenting in the kitchen whenever possible.",
  "Dance enthusiast expressing myself through movement.",
  "Photography lover capturing life's beautiful moments.",
  "Gaming nerd and esports follower. PC or console, I play it all.",
  "Volunteer at local shelters. Giving back to the community matters.",
  "Yoga practitioner finding balance in a busy college life.",
  "Podcast addict always looking for new recommendations."
];

const INTERESTS = [
  "Sports", "Music", "Art", "Photography", "Travel", "Movies", "Reading",
  "Gaming", "Cooking", "Fitness", "Hiking", "Coffee", "Food", "Fashion",
  "Technology", "Science", "Politics", "Volunteering", "Dancing", "Yoga"
];

const UNIVERSITIES = [
  "Stanford University", "UC Berkeley", "UCLA", "MIT", "Harvard University",
  "Yale University", "Princeton University", "Columbia University", "University of Pennsylvania",
  "Cornell University", "Dartmouth College", "Brown University", "Northwestern University",
  "Duke University", "University of Chicago", "Rice University", "Vanderbilt University",
  "University of Southern California", "NYU", "Boston University"
];

const PHOTO_URLS = [
  "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg",
  "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg",
  "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg",
  "https://images.pexels.com/photos/1845534/pexels-photo-1845534.jpeg",
  "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
  "https://images.pexels.com/photos/2709388/pexels-photo-2709388.jpeg",
  "https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg",
  "https://images.pexels.com/photos/3094215/pexels-photo-3094215.jpeg",
  "https://images.pexels.com/photos/3778912/pexels-photo-3778912.jpeg",
  "https://images.pexels.com/photos/4946604/pexels-photo-4946604.jpeg",
  "https://images.pexels.com/photos/5490965/pexels-photo-5490965.jpeg",
  "https://images.pexels.com/photos/5764100/pexels-photo-5764100.jpeg",
  "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg",
  "https://images.pexels.com/photos/7013617/pexels-photo-7013617.jpeg",
  "https://images.pexels.com/photos/8159657/pexels-photo-8159657.jpeg",
  "https://images.pexels.com/photos/8422087/pexels-photo-8422087.jpeg",
  "https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg",
  "https://images.pexels.com/photos/9159036/pexels-photo-9159036.jpeg"
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomInterests(): string[] {
  const count = randomInt(3, 7);
  const selected: string[] = [];
  const available = [...INTERESTS];

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }

  return selected;
}

function generateLatLong(university: string): { lat: number; lon: number } {
  const coords: Record<string, { lat: number; lon: number }> = {
    "Stanford University": { lat: 37.4275, lon: -122.1697 },
    "UC Berkeley": { lat: 37.8719, lon: -122.2585 },
    "UCLA": { lat: 34.0689, lon: -118.4452 },
    "MIT": { lat: 42.3601, lon: -71.0942 },
    "Harvard University": { lat: 42.3770, lon: -71.1167 },
    "Yale University": { lat: 41.3163, lon: -72.9223 },
    "Princeton University": { lat: 40.3430, lon: -74.6514 },
    "Columbia University": { lat: 40.8075, lon: -73.9626 },
    "University of Pennsylvania": { lat: 39.9522, lon: -75.1932 },
    "Cornell University": { lat: 42.4534, lon: -76.4735 },
    "Dartmouth College": { lat: 43.7044, lon: -72.2887 },
    "Brown University": { lat: 41.8268, lon: -71.4025 },
    "Northwestern University": { lat: 42.0565, lon: -87.6753 },
    "Duke University": { lat: 36.0014, lon: -78.9382 },
    "University of Chicago": { lat: 41.7886, lon: -87.5987 },
    "Rice University": { lat: 29.7174, lon: -95.4018 },
    "Vanderbilt University": { lat: 36.1447, lon: -86.8027 },
    "University of Southern California": { lat: 34.0224, lon: -118.2851 },
    "NYU": { lat: 40.7295, lon: -73.9965 },
    "Boston University": { lat: 42.3505, lon: -71.1054 }
  };

  const baseCoords = coords[university] || { lat: 37.7749, lon: -122.4194 };

  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
    lon: baseCoords.lon + (Math.random() - 0.5) * 0.02
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const count = parseInt(url.searchParams.get("count") || "50");

    const profiles = [];
    const authUsers = [];

    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? "Male" : "Female";
      const firstName = gender === "Male" ? randomElement(FIRST_NAMES_MALE) : randomElement(FIRST_NAMES_FEMALE);
      const lastName = randomElement(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;
      const university = randomElement(UNIVERSITIES);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@${university.toLowerCase().replace(/\s+/g, '')}.edu`;
      const age = randomInt(18, 25);
      const graduationYear = 2024 + randomInt(0, 4);
      const coords = generateLatLong(university);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: "Test123!",
        email_confirm: true,
      });

      if (authError) {
        console.error(`Error creating user ${email}:`, authError);
        continue;
      }

      authUsers.push(authData.user.id);

      const profile = {
        id: authData.user.id,
        full_name: fullName,
        bio: randomElement(BIOS),
        university,
        major: randomElement(MAJORS),
        graduation_year: graduationYear,
        age,
        gender,
        looking_for: Math.random() > 0.7 ? "Everyone" : (gender === "Male" ? "Female" : "Male"),
        photo_url: randomElement(PHOTO_URLS),
        additional_photos: [],
        interests: randomInterests(),
        latitude: coords.lat,
        longitude: coords.lon,
        last_location_update: new Date().toISOString(),
      };

      profiles.push(profile);
    }

    const { error: insertError } = await supabase
      .from("profiles")
      .insert(profiles);

    if (insertError) {
      throw insertError;
    }

    const swipes = [];
    const matches = [];
    const messages = [];

    for (let i = 0; i < authUsers.length; i++) {
      const swipeCount = randomInt(10, 30);
      const likedUsers: string[] = [];

      for (let j = 0; j < swipeCount; j++) {
        let targetIdx = randomInt(0, authUsers.length - 1);
        while (targetIdx === i) {
          targetIdx = randomInt(0, authUsers.length - 1);
        }

        const liked = Math.random() > 0.4;

        swipes.push({
          swiper_id: authUsers[i],
          swiped_id: authUsers[targetIdx],
          liked,
        });

        if (liked) {
          likedUsers.push(authUsers[targetIdx]);
        }
      }

      const alreadyMatched = new Set<string>();
      for (const likedUser of likedUsers) {
        if (Math.random() > 0.3 && !alreadyMatched.has(likedUser)) {
          const matchId = crypto.randomUUID();
          const user1 = authUsers[i] < likedUser ? authUsers[i] : likedUser;
          const user2 = authUsers[i] < likedUser ? likedUser : authUsers[i];

          matches.push({
            id: matchId,
            user1_id: user1,
            user2_id: user2,
            created_at: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
            last_message_at: new Date(Date.now() - randomInt(0, 5) * 24 * 60 * 60 * 1000).toISOString(),
          });

          alreadyMatched.add(likedUser);

          const messageCount = randomInt(3, 15);
          const chatMessages = [
            "Hey! How's it going?",
            "Hi! Pretty good, how about you?",
            "Not bad! What's your major?",
            "I'm studying {major}. You?",
            "Nice! I'm in {major} too!",
            "Cool! Have you checked out the new cafe on campus?",
            "Not yet, but I've heard great things!",
            "We should go sometime!",
            "That sounds fun!",
            "What are you up to this weekend?",
            "Probably studying and maybe catching a movie. You?",
            "Same here! Let me know if you want to study together",
            "Definitely! I could use a study buddy",
            "Perfect! See you soon",
            "Looking forward to it!"
          ];

          for (let k = 0; k < Math.min(messageCount, chatMessages.length); k++) {
            const senderId = k % 2 === 0 ? user1 : user2;
            let content = chatMessages[k];

            if (content.includes("{major}")) {
              const senderProfile = profiles.find(p => p.id === senderId);
              content = content.replace("{major}", senderProfile?.major || "Computer Science");
            }

            messages.push({
              match_id: matchId,
              sender_id: senderId,
              content,
              created_at: new Date(Date.now() - (messageCount - k) * 60 * 60 * 1000).toISOString(),
              read: Math.random() > 0.3,
            });
          }
        }
      }
    }

    if (swipes.length > 0) {
      await supabase.from("swipes").insert(swipes);
    }

    if (matches.length > 0) {
      await supabase.from("matches").insert(matches);
    }

    if (messages.length > 0) {
      await supabase.from("messages").insert(messages);
    }

    return new Response(
      JSON.stringify({
        success: true,
        profiles_created: profiles.length,
        swipes_created: swipes.length,
        matches_created: matches.length,
        messages_created: messages.length,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

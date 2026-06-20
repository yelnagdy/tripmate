import { Injectable } from '@angular/core';
import { Article } from '../../models/home.models';

export const NEWS_ARTICLES: Article[] = [
  {
    id: 1,
    category: 'Cultural',
    categoryColor: 'teal',
    date: '11 Sep 2024',
    readTime: '4 min',
    comments: 36,
    title: 'Ultimate Travel Planning Guide: 10 Tips for a Seamless Journey',
    image: 'assets/images/article-1.jpeg',
    author: { name: 'Annie Evan', avatar: 'assets/images/author-1.jpeg' },
    excerpt: 'Planning a trip can feel overwhelming, but with the right steps in place you will breeze through every stage — from booking to boarding.',
    content: [
      'Every great trip begins with a solid plan. Start by defining your travel goals: are you looking for adventure, relaxation, culture, or a mix of all three? Once you know what you want from the journey, everything else falls into place naturally.',
      'Booking early is one of the most powerful weapons in a traveler\'s arsenal. Flights booked 6–8 weeks in advance can be up to 40% cheaper than last-minute fares. Use fare comparison tools and set price alerts so you never miss a deal. Flexible dates — even shifting by a single day — can unlock significant savings.',
      'Create a travel folder (digital or physical) containing copies of your passport, insurance documents, hotel confirmations, and emergency contacts. Having everything in one place prevents the frantic search that derails even the most experienced travelers. Cloud backups mean you can access key documents from anywhere in the world.',
      'Pack light and pack smart. The single biggest mistake new travelers make is overpacking. Stick to versatile clothing that can be mixed and matched, and always leave room for souvenirs. A carry-on-only policy saves both money and time — no checked-bag fees and no waiting at baggage claim.',
      'Finally, embrace spontaneity within your structure. Over-planning kills the magic of discovery. Leave gaps in your itinerary for unexpected cafes, chance encounters, and detours that become the highlights of the whole trip.',
    ],
  },
  {
    id: 2,
    category: 'Travel',
    categoryColor: 'orange',
    date: '11 Sep 2024',
    readTime: '4 min',
    comments: 36,
    title: 'Top 15 Travel Hacks for Budget-Conscious Adventurers',
    image: 'assets/images/article-2.jpeg',
    author: { name: 'John Chris', avatar: 'assets/images/author-2.jpeg' },
    excerpt: 'Seeing the world does not have to drain your savings. These tried-and-tested hacks help savvy travelers do more for less.',
    content: [
      'Budget travel is an art, not a compromise. The most seasoned backpackers know that spending less often means experiencing more — skipping tourist traps in favour of local markets, neighbourhood restaurants, and free walking tours run by passionate residents.',
      'Travel on weekdays whenever possible. Tuesday and Wednesday flights are consistently cheaper than weekend departures, and mid-week hotel rates can be 20–30% lower. Pair this with shoulder-season timing — visiting just before or after peak season — and you will find the same destinations with smaller crowds and far better prices.',
      'Food is where budgets leak fastest. Eat breakfast at your accommodation, grab lunch from street vendors or supermarkets, and save restaurants for one special dinner per city. Many countries\' street food is not only cheaper but also more authentic than anything on the tourist-restaurant menu.',
      'Transportation hacks stack up quickly. City transit cards, overnight buses that double as accommodation, and ride-sharing apps all cut costs dramatically. Walking a city for 2–3 hours also reveals details no tour bus ever shows you.',
      'Finally, travel insurance is the one area never to cut corners. A single emergency evacuation can cost more than your entire trip budget. Policies cost as little as $2 a day and cover far more than most travelers realise.',
    ],
  },
  {
    id: 3,
    category: 'Discover',
    categoryColor: 'blue',
    date: '11 Sep 2024',
    readTime: '4 min',
    comments: 36,
    title: 'Discovering Hidden Gems: 10 Off-the-Beaten-Path Travel Tips',
    image: 'assets/images/article-3.jpeg',
    author: { name: 'Emma Grey', avatar: 'assets/images/author-3.jpeg' },
    excerpt: 'The world\'s best-kept secrets are hiding just beyond the tourist trail. Here is how to find them and make them your own.',
    content: [
      'Every over-touristed city has a shadow city beside it — a quieter version filled with authentic life, affordable eats, and residents who are genuinely happy to see you. Finding it requires nothing more than a willingness to walk one neighbourhood further than your guidebook suggests.',
      'Talk to locals. This sounds obvious but most travelers never do it. Hotel concierges are incentivised to send you to partner restaurants. Instead, ask the person cooking your breakfast, the taxi driver, or the shopkeeper where they go on their day off. Their answer will almost always lead somewhere worth visiting.',
      'Use satellite imagery to explore areas before you arrive. Zoom into the map and look for clusters of small streets, open-air markets, or parks with no tourist labels attached. These blank spaces on the tourist map are often the richest areas to visit.',
      'Travel during local holidays, not in spite of them. While other tourists avoid national festivals for fear of crowds, those same festivals reveal a destination\'s true character. The food, music, and human warmth on display during a local celebration is irreplaceable.',
      'Keep a running list of places that friends, strangers, and fellow travelers mention in passing. The most reliable travel tip you will ever receive is an enthusiastic, unsolicited recommendation from someone who has just come from exactly where you are headed.',
    ],
  },
  {
    id: 4,
    category: 'Adventure',
    categoryColor: 'orange',
    date: '18 Oct 2024',
    readTime: '5 min',
    comments: 24,
    title: 'Explore the World on a Budget: Smart Strategies for Low-Cost Travel',
    image: 'assets/images/destination-turkey.jpeg',
    author: { name: 'Mark Levi', avatar: 'assets/images/author-1.jpeg' },
    excerpt: 'Adventure does not require a big budget — just creative thinking, flexible dates, and the courage to go off script.',
    content: [
      'The notion that adventure travel costs a fortune is one of the most persistent myths in the industry. In reality, the experiences that stay with you longest — sunrise treks, open-water swims, canyon hikes — are almost always free or cost very little.',
      'House-sitting and home-swapping platforms have quietly revolutionised long-term budget travel. By caring for someone\'s home while they are away, you unlock free accommodation in cities and countryside retreats that would otherwise cost hundreds per night.',
      'Work exchange programmes like WWOOFing let you trade a few hours of daily labour — farming, hostel maintenance, teaching — for free food and lodging. This model stretches a travel budget almost indefinitely while providing deeper cultural immersion than any hotel stay.',
      'Learn to read airline loyalty programmes. Even infrequent flyers accumulate enough points for one or two free regional flights a year if they use co-branded credit cards for everyday spending. Combined with airline status challenges during off-peak periods, the rewards mount faster than most people realise.',
      'Budget accommodation has been transformed by the hostel boom. Modern hostels offer private rooms, co-working spaces, and social events alongside dormitory beds. Many are better designed and more characterful than mid-range hotels at a third of the price.',
    ],
  },
  {
    id: 5,
    category: 'Culture',
    categoryColor: 'teal',
    date: '02 Nov 2024',
    readTime: '6 min',
    comments: 18,
    title: 'A Deep Dive Into Egyptian Culture: What Every Traveler Should Know',
    image: 'assets/images/destination-egypt.jpeg',
    author: { name: 'Laila Hassan', avatar: 'assets/images/author-2.jpeg' },
    excerpt: 'Egypt is far more than its pyramids. Understanding the culture, customs, and daily rhythms will transform a sightseeing trip into a genuine encounter.',
    content: [
      'Egypt carries five thousand years of unbroken civilisation in its streets. To walk through Cairo\'s Islamic quarter — past medieval mosques, Coptic churches, and ancient synagogues standing within metres of each other — is to walk through layers of history that overlap and coexist in ways that feel impossible until you see them.',
      'Egyptian hospitality is legendary and genuine. An invitation for tea is never merely polite — it is a sincere offer of connection. Accept it. Sitting with a shop owner or a family in their home over mint tea is where Egypt reveals itself most fully, in conversation and laughter rather than in monuments.',
      'Dress codes matter deeply outside the resort areas. Women covering shoulders and knees are treated with immediate respect and encounter far less hassle in markets and religious sites. Men in lightweight long trousers signal the same cultural awareness. A small scarf in your day bag solves every situation.',
      'Learn a handful of Arabic phrases. Egyptians light up when visitors attempt even basic greetings. "Ahlan wa sahlan" (welcome), "Shukran" (thank you), and "Inshallah" (God willing — used for everything from meeting times to weather predictions) will generate more warmth than any guided tour script.',
      'The food is the soul of the country. Ful medames, koshari, ta\'meya, and Om Ali are not tourist dishes — they are what Egyptians eat every day, and street stalls serving them do so with pride. Budget around $3–5 for a full meal and eat alongside locals, not in restaurants designed for foreign palates.',
    ],
  },
  {
    id: 6,
    category: 'Luxury',
    categoryColor: 'blue',
    date: '15 Nov 2024',
    readTime: '3 min',
    comments: 42,
    title: 'Dubai\'s Skyline & Beyond: The Ultimate Luxury City Guide',
    image: 'assets/images/destination-dubai.jpeg',
    author: { name: 'Rania Nour', avatar: 'assets/images/author-3.jpeg' },
    excerpt: 'Dubai has redefined what a modern city can be. Behind the spectacle lies a destination that genuinely rewards those who explore it.',
    content: [
      'Dubai moves at a pace unlike anywhere else on earth. A city that barely existed fifty years ago now hosts the world\'s tallest building, the world\'s largest shopping mall, and an artificial archipelago visible from space. Yet for all its superlatives, the city\'s most compelling quality is its ambition — the sense that nothing here is considered finished.',
      'The old city — Al Fahidi Historic District — stands in beautiful contrast to the glass towers. Wind-tower architecture, narrow lanes, and the Dubai Museum tell the story of a trading port that predates the oil era. An abra (traditional wooden boat) crossing the Dubai Creek for one dirham remains one of the most atmospheric ten minutes in the Gulf.',
      'Dining in Dubai is extraordinary. The city\'s diverse expatriate population has produced a restaurant scene of global depth. A single evening could move from Lebanese mezze in Deira to Japanese omakase in the DIFC to Emirati saloona in a heritage house in Al Seef.',
      'For accommodation, the choice between iconic landmark hotels and the city\'s newer boutique offerings is genuinely difficult. The Burj Al Arab is worth at least an afternoon tea for the theatre of it. But smaller properties in the Design District offer a different Dubai — creative, contemporary, and considerably more relaxed.',
    ],
  },
  {
    id: 7,
    category: 'Travel',
    categoryColor: 'orange',
    date: '28 Nov 2024',
    readTime: '5 min',
    comments: 11,
    title: 'Pack Like a Pro: The Minimalist Traveler\'s Complete Packing Checklist',
    image: 'assets/images/article-1.jpeg',
    author: { name: 'Annie Evan', avatar: 'assets/images/author-1.jpeg' },
    excerpt: 'Everything you own can fit in a carry-on. Minimalist packing is not about sacrifice — it is about liberation.',
    content: [
      'The minimalist packing revolution started with a simple observation: travelers who checked luggage spent enormous amounts of time and energy managing their bags, while those with carry-ons glided through airports and arrived at destinations immediately ready to explore.',
      'The capsule wardrobe principle works perfectly for travel. Choose a base colour — navy, grey, or black — and build around it with three or four pieces that mix and match into dozens of outfits. Merino wool is the traveler\'s best friend: lightweight, odour-resistant, quick-drying, and appropriate for both hiking trails and restaurant dinners.',
      'Electronics deserve their own audit. Most travelers carry far more than they use. One phone, one pair of earphones, one lightweight power bank, and one universal adapter covers 95% of real travel needs. The laptop stays home unless work demands it.',
      'Toiletries are the biggest space thief in any bag. Switch to solid shampoo bars, multi-use sunscreen-moisturisers, and two-in-one products wherever possible. Anything you can buy at your destination should be bought there — it saves space, weight, and the anxiety of liquids at security.',
      'The packing test: lay everything out, then put half of it back. If you have not used something in the last three trips, it does not earn its place. The weight you leave behind is freedom you carry with you.',
    ],
  },
  {
    id: 8,
    category: 'Cultural',
    categoryColor: 'teal',
    date: '10 Dec 2024',
    readTime: '7 min',
    comments: 29,
    title: 'Turkey\'s Ancient Wonders: From Istanbul\'s Bazaars to Cappadocia\'s Caves',
    image: 'assets/images/destination-turkey.jpeg',
    author: { name: 'John Chris', avatar: 'assets/images/author-2.jpeg' },
    excerpt: 'Turkey bridges two continents and three millennia of civilisation. A week here barely scratches the surface of what the country offers.',
    content: [
      'Standing on the Galata Bridge in Istanbul at dawn, watching fishing lines dangle above the Golden Horn while the minarets of the Süleymaniye Mosque turn gold in the morning light, it is impossible not to feel the weight of history. This is a city that has been the capital of three empires — Roman, Byzantine, and Ottoman — and wears all three identities simultaneously.',
      'The Grand Bazaar is often described as overwhelming, but approached with curiosity rather than urgency it reveals itself as one of the world\'s great social spaces. Over 4,000 shops covering 60 streets, vendors who have occupied the same stall for generations, and the smell of spices, leather, and fresh-brewed tea create an atmosphere that no modern shopping centre can replicate.',
      'Cappadocia is one of those places that looks like a dream even in photographs, and then exceeds expectation in person. The fairy chimneys — volcanic rock formations sculpted by millennia of erosion — rise from a landscape that feels borrowed from another planet. Hot-air balloon rides at sunrise are worth every penny of the price.',
      'The cave hotels of Göreme offer some of the most remarkable accommodation in the world. Rooms carved directly into ancient volcanic rock maintain a natural temperature year-round, and the silence inside is total — a profound rest after days of sightseeing.',
      'Turkish cuisine deserves its own trip. Meze tables laden with hummus, ezme, stuffed grape leaves, and grilled halloumi; slow-cooked lamb dishes; köfte in a hundred regional variations; and the ritual of çay (tea) drunk from tulip-shaped glasses at every pause in the day. Eating well in Turkey requires no effort at all.',
    ],
  },
  {
    id: 9,
    category: 'Adventure',
    categoryColor: 'blue',
    date: '22 Dec 2024',
    readTime: '4 min',
    comments: 15,
    title: 'Solo Travel Safety: Essential Tips for First-Time Independent Explorers',
    image: 'assets/images/article-2.jpeg',
    author: { name: 'Emma Grey', avatar: 'assets/images/author-3.jpeg' },
    excerpt: 'Solo travel is one of the most transformative experiences available to any human being. A little preparation makes it safer and more rewarding.',
    content: [
      'The moment you step off a plane alone in an unfamiliar city, something shifts. Every decision is yours — where to eat, what to see, when to rest. That freedom is the core appeal of solo travel, and millions of people discover it each year.',
      'Share your itinerary with someone at home before every new leg of the journey. This is not paranoia — it is the single most effective safety net available. A trusted contact who knows your expected movements can raise the alarm quickly if you go dark unexpectedly.',
      'Stay in social accommodation during your first nights in each new city. Hostels, guesthouses, and boutique hotels with common areas give you an immediate community of fellow travelers. Other solo travelers are the most reliable source of current, ground-level safety information for any destination.',
      'Trust your instincts aggressively. If a situation, person, or place gives you a bad feeling, leave immediately without explanation or apology. The discomfort of seeming rude costs nothing. Solo travelers who ignore instinct in favour of politeness are the ones who end up in trouble.',
      'Arrive in new cities during daylight whenever possible. That one rule eliminates the majority of situations that make solo travel genuinely risky. Night arrivals in unfamiliar places multiply disorientation, fatigue, and exposure to the small minority who prey on confused-looking tourists.',
    ],
  },
  {
    id: 10,
    category: 'Discover',
    categoryColor: 'teal',
    date: '05 Jan 2025',
    readTime: '6 min',
    comments: 33,
    title: 'The Art of Slow Travel: Why Less Is More When Exploring a New Place',
    image: 'assets/images/article-3.jpeg',
    author: { name: 'Mark Levi', avatar: 'assets/images/author-1.jpeg' },
    excerpt: 'Speed and travel have always made uneasy companions. The slow travel movement is reclaiming depth over distance.',
    content: [
      'The classic two-week European tour — twelve countries in fourteen days — has produced generations of travelers who can say they "did" Paris but have no memory of it beyond the Eiffel Tower photograph. Slow travel is the antidote: fewer places, longer stays, and the kind of familiarity that only time produces.',
      'Staying in one neighbourhood for a week rather than moving hotels every two nights transforms the experience. You find your café, your morning walk, your corner bakery. You start recognising faces. The city stops being a set of attractions to be checked off and becomes, briefly, a place you actually live.',
      'Slow travel is also dramatically cheaper. The hidden costs of constant movement — transfers, tourist-area restaurant prices, rushed decisions — disappear when you settle in. Renting a flat for a week costs less than seven separate hotel nights, and a kitchen means you can cook and eat like a resident.',
      'The psychological benefit is perhaps the most significant. Constant movement is exhausting in ways travelers do not always admit to themselves. Slow travel allows for genuine rest, for reading, for sitting in a park without an agenda. The brain needs unscheduled time to process and absorb what it has encountered.',
      'Try the experiment: on your next trip, cut your destination list in half and double the time you spend in each place. The richer, stranger, more personal stories you bring home will make the comparison self-evident.',
    ],
  },
  {
    id: 11,
    category: 'Travel',
    categoryColor: 'orange',
    date: '19 Jan 2025',
    readTime: '5 min',
    comments: 20,
    title: 'Flight Deals Decoded: How to Find Cheap Tickets Before Anyone Else',
    image: 'assets/images/article-1.jpeg',
    author: { name: 'Laila Hassan', avatar: 'assets/images/author-2.jpeg' },
    excerpt: 'Cheap flights exist in abundance — the trick is knowing where the algorithm hides them and when to strike.',
    content: [
      'Airline pricing algorithms are extraordinarily complex, but a few consistent patterns hold across carriers and markets. Understanding those patterns is the difference between paying $200 and $700 for the same seat on the same route.',
      'The 6-week window is real. For most international routes, prices hit their sweet spot between 3 and 8 weeks before departure. Inside that window, algorithms sense demand and raise prices. Outside it, carriers hedge against empty seats with early-booking premiums.',
      'Use incognito mode when searching for flights. While airlines deny that price cookies exist, the pattern of prices rising after repeated searches for the same route is consistent enough that the precaution costs nothing. Clear your cookies or use a private browser as a standard practice.',
      'Error fares — accidental mispricings by airline systems — appear several times a week across major routes. Dedicated fare-alert newsletters flag them within minutes of appearing. The window to book is often under two hours before airlines correct the mistake, but thousands of travelers fill confirmed seats at prices that should not exist.',
      'Positioning flights unlock a different tier of pricing. Flying from a secondary hub rather than your home airport often requires an extra short hop, but the saving on the main long-haul leg can be substantial enough to make the combined journey cheaper than a direct ticket from your doorstep.',
    ],
  },
  {
    id: 12,
    category: 'Luxury',
    categoryColor: 'blue',
    date: '03 Feb 2025',
    readTime: '8 min',
    comments: 47,
    title: 'World\'s Most Scenic Train Journeys You Need to Experience Before You Die',
    image: 'assets/images/article-2.jpeg',
    author: { name: 'Rania Nour', avatar: 'assets/images/author-3.jpeg' },
    excerpt: 'The train window is the best screen in the world. These routes serve landscapes so extraordinary that the journey outranks the destination.',
    content: [
      'There is a reason that every golden-age travel writer eventually wrote about trains. The rhythm of rail travel — the countryside sliding past, the unhurried pace, the dining car at dusk — creates a relationship with landscape that no other transport achieves. You are not cutting through a place; you are moving through it.',
      'The Glacier Express in Switzerland, often called the world\'s slowest express train, takes eight hours to connect Zermatt and St. Moritz across 291 bridges and through 91 tunnels. Every kilometre of the route delivers something extraordinary — the Landwasser Viaduct, the Oberalp Pass at 2,033 metres, the Rhine Gorge sometimes called the "Swiss Grand Canyon".',
      'The Indian Pacific crosses Australia from Sydney to Perth in four days and three nights — 4,352 kilometres of red desert, salt lakes, and the Nullarbor Plain\'s dead-straight track. The journey is as much a meditation on scale as it is a train ride. Nothing prepares you for the flatness and the silence of the Nullarbor.',
      'The Rovos Rail Pride of Africa, running between Cape Town and Dar es Salaam, is perhaps the most opulent train journey on earth. Edwardian private suites, five-course dinners in a restored dining car, and game-spotting from an open observation car across Kruger, Zimbabwe, and Zambia compress a continent into one extraordinary week.',
      'For accessible luxury, the Rocky Mountaineer through the Canadian Rockies runs in daylight only — so passengers see everything. The route between Vancouver and Banff delivers Emerald Lake, the Fraser Canyon, and peaks that seem too theatrical to be real. Dome-car seating means the sky is part of the view on all sides.',
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class NewsDataService {

  getAll(): Article[] {
    return NEWS_ARTICLES;
  }

  getById(id: number): Article | undefined {
    return NEWS_ARTICLES.find(a => a.id === id);
  }

  getPreview(): Article[] {
    return NEWS_ARTICLES.slice(0, 3);
  }

  getRelated(articleId: number, count = 3): Article[] {
    const article = this.getById(articleId);
    if (!article) return NEWS_ARTICLES.slice(0, count);
    return NEWS_ARTICLES
      .filter(a => a.id !== articleId && a.category === article.category)
      .slice(0, count)
      .concat(
        NEWS_ARTICLES.filter(a => a.id !== articleId && a.category !== article.category)
      )
      .slice(0, count);
  }
}

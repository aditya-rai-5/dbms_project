
const axios = require('axios');

const prisma = require('../src/config/prisma');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '00ce4434ecb42ea6fe9649ab13ef3302';

async function main() {
  console.log('Clearing existing records directly related to booking & shows...');
  
  // Need to clear data. We'll rely on CASCADE where applicable
  await prisma.seatLock.deleteMany({});
  await prisma.bookingSeat.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.waitlistEntry.deleteMany({});
  await prisma.show.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.screen.deleteMany({});
  await prisma.theatre.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Fetching Latest Movies from TMDB...');
  let tmdbMovies = [];
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`);
    tmdbMovies = res.data.results.slice(0, 10); // get top 10 for seeding
  } catch (err) {
    console.log(`\n⚠️ TMDB fetch failed: ${err.message}`);
    console.log('Using offline fallback movie data to initialize the system...\n');
    tmdbMovies = [
      {
        id: 533535,
        title: "Deadpool & Wolverine",
        original_title: "Deadpool & Wolverine",
        overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him.",
        backdrop_path: "/yDHYTfA3R0jFYba16ZAKAW5m40Q.jpg",
        poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        vote_average: 7.7,
        vote_count: 5500,
        popularity: 1540.23,
        original_language: "en",
        adult: false,
        release_date: "2024-07-24"
      },
      {
        id: 923667,
        title: "Kung Fu Panda 4",
        original_title: "Kung Fu Panda 4",
        overview: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.",
        backdrop_path: "/kYgQzzjNis5jJalYtIu4T0g1.jpg",
        poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        vote_average: 7.1,
        vote_count: 3420,
        popularity: 900.5,
        original_language: "en",
        adult: false,
        release_date: "2024-03-02"
      },
      {
        id: 1022789,
        title: "Inside Out 2",
        original_title: "Inside Out 2",
        overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!",
        backdrop_path: "/p5kpFS0P3AHYwB1D0bBmaBqGHI1.jpg",
        poster_path: "/vpnVM9B6NMmQpWeZvzRxqwWAXg1.jpg",
        vote_average: 7.6,
        vote_count: 4700,
        popularity: 1200.75,
        original_language: "en",
        adult: false,
        release_date: "2024-06-11"
      }
    ];
  }
  
  const movieIds = [];
  
  for (const tmdb of tmdbMovies) {
    try {
      const created = await prisma.movie.create({
        data: {
          id: tmdb.id, // Explicitly match TMDB
          tmdbId: tmdb.id,
          title: tmdb.title,
          originalTitle: tmdb.original_title,
          overview: tmdb.overview,
          backdropPath: tmdb.backdrop_path,
          posterPath: tmdb.poster_path,
          voteAverage: tmdb.vote_average,
          voteCount: tmdb.vote_count,
          popularity: tmdb.popularity,
          language: tmdb.original_language,
          adult: tmdb.adult || false,
          releaseDate: tmdb.release_date ? new Date(tmdb.release_date) : new Date(),
        }
      });
      movieIds.push(created.id);
      console.log(`Seeded Movie: ${created.title} (ID: ${created.id})`);
    } catch (e) {
      console.log(`Error seeding movie ${tmdb.id}, might already exist: `, e.message);
    }
  }

  console.log('\nCreating Theatres & Screens...');
  
  const theatresData = [
    { name: 'PVR: Nexus Mall', city: 'Mumbai', state: 'MH', address: 'Nexus Mall, Andheri', pincode: '400053' },
    { name: 'INOX: City Centre', city: 'Mumbai', state: 'MH', address: 'City Centre, Malad', pincode: '400064' },
    { name: 'Cinepolis: Grand', city: 'Delhi', state: 'DL', address: 'Grand Mall', pincode: '110001' },
  ];

  const dbTheatres = [];
  for (const t of theatresData) {
    const th = await prisma.theatre.create({ data: t });
    dbTheatres.push(th);
    console.log(`Seeded Theatre: ${th.name}`);
    
    // 2 screens per theatre
    for (let s = 1; s <= 2; s++) {
      const screen = await prisma.screen.create({
        data: {
          name: `Screen ${s}`,
          totalSeats: 20, // keep it small for easy mock
          theatreId: th.id
        }
      });
      
      // Create seats: 2 rows of 10
      const rows = ['A', 'B'];
      const seatPromises = [];
      for (const row of rows) {
        for (let number = 1; number <= 10; number++) {
          const type = row === 'B' ? 'PREMIUM' : 'STANDARD';
          const price = type === 'PREMIUM' ? 300 : 200;
          seatPromises.push(prisma.seat.create({
            data: {
              row,
              number,
              type,
              price,
              screenId: screen.id
            }
          }));
        }
      }
      await Promise.all(seatPromises);
    }
  }

  console.log('\nCreating Shows...');
  // For each movie, create a few shows in the screens
  const allScreens = await prisma.screen.findMany({});
  
  let showCount = 0;
  for (const mid of movieIds) {
    for (const screen of allScreens) {
      // 1-2 shows per movie, per screen, next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // 10:00 AM show
      tomorrow.setHours(10, 0, 0, 0);
      await prisma.show.create({
        data: {
          movieId: mid,
          screenId: screen.id,
          showTime: new Date(tomorrow),
          basePrice: 200,
          totalSeats: screen.totalSeats,
        }
      });
      
      // 14:00 PM show
      tomorrow.setHours(14, 0, 0, 0);
      await prisma.show.create({
        data: {
          movieId: mid,
          screenId: screen.id,
          showTime: new Date(tomorrow),
          basePrice: 200,
          totalSeats: screen.totalSeats,
        }
      });
      showCount += 2;
    }
  }

  console.log(`Seeded ${showCount} shows successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

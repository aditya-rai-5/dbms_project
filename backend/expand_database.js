
const axios = require('axios');

const prisma = require('./src/config/prisma');
const TMDB_API_KEY = process.env.TMDB_API_KEY || '00ce4434ecb42ea6fe9649ab13ef3302';

async function expandDatabase() {
  console.log('--- Starting Database Expansion ---');

  // 1. Fetch more movies from TMDB
  console.log('\nFetching Popular & Top Rated Movies from TMDB...');
  let tmdbMovies = [];
  try {
    const [popularRes, topRatedRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`),
      axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`)
    ]);
    const combined = [...popularRes.data.results, ...topRatedRes.data.results];
    
    // Remove duplicates
    const uniqueIds = new Set();
    tmdbMovies = combined.filter(m => {
      if (!uniqueIds.has(m.id)) {
        uniqueIds.add(m.id);
        return true;
      }
      return false;
    });
    console.log(`Successfully fetched ${tmdbMovies.length} unique movies from TMDB.`);
  } catch (err) {
    console.error('Failed to fetch from TMDB. Ensure you have an internet connection and a valid API key.');
    process.exit(1);
  }

  // 2. Insert Movies into DB
  console.log('\nInserting new Movies into Database...');
  const movieIds = [];
  for (const tmdb of tmdbMovies) {
    try {
      const existing = await prisma.movie.findUnique({ where: { tmdbId: tmdb.id } });
      if (!existing) {
        const created = await prisma.movie.create({
          data: {
            id: tmdb.id,
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
      } else {
        movieIds.push(existing.id);
      }
    } catch (e) {
      console.log(`Failed to process movie ${tmdb.title}:`, e.message);
    }
  }
  console.log(`Added/Verified ${movieIds.length} movies in the database.`);

  // 3. Insert more Theatres & Screens
  console.log('\nCreating 10 new Theatre venues...');
  const newTheatresData = [
    { name: 'PVR: Orion Mall', city: 'Bangalore', state: 'KA', address: 'Dr Rajkumar Rd', pincode: '560055' },
    { name: 'INOX: Forum Mall', city: 'Bangalore', state: 'KA', address: 'Koramangala', pincode: '560029' },
    { name: 'Cinepolis: Seasons', city: 'Pune', state: 'MH', address: 'Magarpatta City', pincode: '411028' },
    { name: 'PVR: Phoenix Marketcity', city: 'Pune', state: 'MH', address: 'Viman Nagar', pincode: '411014' },
    { name: 'AMB Cinemas', city: 'Hyderabad', state: 'TS', address: 'Gachibowli', pincode: '500032' },
    { name: 'Prasads IMAX', city: 'Hyderabad', state: 'TS', address: 'Necklace Road', pincode: '500063' },
    { name: 'SPI: Palazzo', city: 'Chennai', state: 'TN', address: 'Vadapalani', pincode: '600026' },
    { name: 'PVR: VR Mall', city: 'Chennai', state: 'TN', address: 'Anna Nagar', pincode: '600040' },
    { name: 'INOX: South City', city: 'Kolkata', state: 'WB', address: 'Prince Anwar Shah Rd', pincode: '700068' },
    { name: 'Cinepolis: Acropolis', city: 'Kolkata', state: 'WB', address: 'Rajdanga Main Road', pincode: '700107' },
  ];

  const screenIds = [];
  for (const t of newTheatresData) {
    try {
      const existing = await prisma.theatre.findFirst({ where: { name: t.name } });
      if (existing) continue; // skip if already added

      const th = await prisma.theatre.create({ data: t });
      
      // Create 3 screens per theatre
      for (let s = 1; s <= 3; s++) {
        const screen = await prisma.screen.create({
          data: {
            name: `Screen ${s}`,
            totalSeats: 30,
            theatreId: th.id
          }
        });
        screenIds.push(screen.id);
        
        // Create 3 rows of seats (A, B, C)
        const rows = ['A', 'B', 'C'];
        const seatPromises = [];
        for (const row of rows) {
          for (let number = 1; number <= 10; number++) {
            let type = 'STANDARD';
            let price = 200;
            if (row === 'B') { type = 'PREMIUM'; price = 300; }
            if (row === 'C') { type = 'VIP'; price = 500; }

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
      console.log(`Added Theatre: ${t.name}`);
    } catch (e) {
      console.log(`Failed to process theatre ${t.name}:`, e.message);
    }
  }

  // 4. Assign 5,000 new shows utilizing the new movies and new screens
  if (screenIds.length > 0 && movieIds.length > 0) {
    console.log(`\nGenerating 5,000 shows mapping new movies to new screens...`);
    const showsToInsert = [];
    const TOTAL_SHOWS = 5000;
    
    for (let i = 0; i < TOTAL_SHOWS; i++) {
      const randomMovieId = movieIds[Math.floor(Math.random() * movieIds.length)];
      const randomScreenId = screenIds[Math.floor(Math.random() * screenIds.length)];

      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 7);
      
      const randomTime = new Date(now.getTime() + Math.random() * (future.getTime() - now.getTime()));
      randomTime.setHours(9 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);

      showsToInsert.push({
        movieId: randomMovieId,
        screenId: randomScreenId,
        showTime: randomTime,
        basePrice: 200 + Math.floor(Math.random() * 100),
        totalSeats: 30, // from our seat creation
        bookedSeats: 0,
      });
    }

    try {
      const result = await prisma.show.createMany({
        data: showsToInsert,
        skipDuplicates: true,
      });
      console.log(`✅ Successfully injected ${result.count} new shows into the network!`);
    } catch (error) {
      console.error('Failed to bulk insert additional shows:', error.message);
    }
  } else {
    console.log('\nSkipped inserting shows (maybe venues already existed?).');
  }

  console.log('--- Database Expansion Complete! ---');
}

expandDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


const prisma = require('./src/config/prisma');

async function add10kShows() {
  console.log('Fetching local movies and screens...');
  const movies = await prisma.movie.findMany();
  const screens = await prisma.screen.findMany();

  if (movies.length === 0 || screens.length === 0) {
    console.error('No movies or screens found in the database. Please run npm run seed first.');
    process.exit(1);
  }

  console.log(`Found ${movies.length} movies and ${screens.length} screens.`);
  console.log('Generating 10,000 shows for the next 7 days...');

  const showsToInsert = [];
  const TOTAL_SHOWS = 10000;
  
  // Distribute over 7 days randomly
  const basePrice = 250;

  for (let i = 0; i < TOTAL_SHOWS; i++) {
    // Pick random movie and random screen
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    const randomScreen = screens[Math.floor(Math.random() * screens.length)];

    // Generate random datetime between now and next 7 days
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 7);
    
    // Pick a random time specifically between 9 AM and 11 PM for realism
    const randomTime = new Date(now.getTime() + Math.random() * (future.getTime() - now.getTime()));
    randomTime.setHours(9 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);

    showsToInsert.push({
      movieId: randomMovie.id,
      screenId: randomScreen.id,
      showTime: randomTime,
      basePrice: basePrice,
      totalSeats: randomScreen.totalSeats,
      bookedSeats: 0,
    });
  }

  console.log('Inserting 10,000 shows into the database via try/catch chunks...');
  
  // Since we are inserting 10k, createMany handles bulk but let's do it safely
  try {
    const result = await prisma.show.createMany({
      data: showsToInsert,
      skipDuplicates: true,
    });
    
    console.log(`✅ Successfully inserted ${result.count} shows!`);
  } catch (error) {
    console.error('Failed to bulk insert shows:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Done.');
  }
}

add10kShows();

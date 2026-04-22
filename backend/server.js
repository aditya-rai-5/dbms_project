require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');


const prisma = require('./src/config/prisma');

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.warn('⚠️ Database connection failed on startup, some features will be unavailable:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`🚀 ShowsNow API running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();

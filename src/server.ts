import app from './app.js';
import sequelize  from './config/database.js';
import { env } from './config/env.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    app.listen(env.PORT, () =>
      console.log(`🚀 Server running on port ${env.PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup error', err);
    process.exit(1);
  }
})();

// Start CSV import worker automatically

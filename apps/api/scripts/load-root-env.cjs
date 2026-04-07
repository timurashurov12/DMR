/**
 * Подгружает корневой .env (ayvan/.env) в process.env перед запуском Prisma.
 * Путь: scripts/ -> api/ -> apps/ -> корень репо (3 уровня вверх).
 */
const path = require('path');
const rootEnv = path.resolve(__dirname, '..', '..', '..', '.env');
require('dotenv').config({ path: rootEnv });

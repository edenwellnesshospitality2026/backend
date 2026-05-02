/**
 * Legacy SQL migrations are not used with MongoDB.
 * Schema is defined via Mongoose models; run `npm run db:seed` to seed admin + defaults.
 */
// eslint-disable-next-line no-console
console.log(
  "MongoDB uses Mongoose models — no SQL migrations. Use: npm run db:seed"
);
process.exit(0);

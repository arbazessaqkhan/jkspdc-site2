const { Client } = require('d:/jkspdc-main-site/backend/node_modules/pg');

async function migrate() {
  const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/jkspdc?schema=public' });
  await client.connect();
  console.log('Connected to DB');

  await client.query(`
    ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
    ALTER TABLE "GalleryItem" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
  `);
  console.log('Columns added successfully');

  const res = await client.query(`
    SELECT table_name, column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name IN ('Notification', 'GalleryItem') AND column_name = 'status';
  `);
  console.log('Verified columns:', res.rows);

  await client.end();
}

migrate().catch(console.error);


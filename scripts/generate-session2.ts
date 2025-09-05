import 'dotenv/config';
import { createClient } from '@libsql/client';
import { Argon2id } from 'oslo/password';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { sessions, users } from '../src/lib/drizzle/schema';
import { getDb } from '../src/lib/drizzle/db';

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  if (!emailArg || !passwordArg) {
    console.error('Usage: tsx scripts/generate-session2.ts <email> <password>');
    process.exit(2);
  }
  const email = emailArg.toLowerCase();
  const password = passwordArg;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.error('Missing TURSO envs');
    process.exit(2);
  }

  const client = createClient({ url, authToken });
  const rs = await client.execute({
    sql: 'select id, email, password, password_text, role from users where lower(email)=? limit 1',
    args: [email]
  });
  if (rs.rows.length === 0) {
    console.error('User not found for email:', email);
    process.exit(2);
  }
  const row: any = rs.rows[0];
  const userId: string = row.id as string;
  const passwordText: string | null = (row.password_text as any) ?? null;
  const hashed: string | null = (row.password as any) ?? null;

  let verified = false;
  if (passwordText) {
    verified = passwordText === password;
  } else if (hashed) {
    verified = await new Argon2id().verify(hashed, password);
  }
  if (!verified) {
    console.error('Invalid credentials');
    process.exit(2);
  }

  const db = getDb();
  if (!db) {
    console.error('Failed to get DB');
    process.exit(2);
  }

  const adapter = new DrizzleSQLiteAdapter(db as any, sessions as any, users as any);
  const lucia = new Lucia(adapter, {
    sessionCookie: {
      expires: false,
      attributes: {
        secure: false,
        sameSite: 'lax',
        path: '/',
      },
    },
    getUserAttributes: (attributes: any) => ({
      fullName: attributes.fullName || '',
      email: attributes.email || '',
      role: attributes.role || 'CUSTOMER_SINGULAR',
      phone: attributes.phone || '',
      priceList: attributes.priceList || '[]',
    }),
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieHeader = `${sessionCookie.name}=${sessionCookie.value}`;

  console.log(JSON.stringify({
    cookieName: sessionCookie.name,
    cookieValue: sessionCookie.value,
    cookieHeader,
    userId,
    role: row.role
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
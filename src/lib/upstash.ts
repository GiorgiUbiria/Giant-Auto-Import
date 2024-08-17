import { Redis } from "@upstash/redis";
import 'dotenv/config';

export const redis = new Redis({
	url: process.env.UPSTASH_URL!,
	token: process.env.UPSTASH_TOKEN!,
});

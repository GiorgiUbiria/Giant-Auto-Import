import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "../upstash";
import { createServerActionProcedure } from "zsa";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(12, "120s"),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

export const ratelimitProcedure = createServerActionProcedure()
  .handler(async () => {
    const ip = headers().get("x-forwarded-for") as string;

    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        throw new Error(
          `Rate limit exceeded. Try again after ${new Date(reset * 1000).toLocaleTimeString()}.`
        );
      }

      return {
        ip,
        limit,
        remaining,
        reset
      };
    } catch (error) {
      console.error("Rate limiting failed:", error);
      throw new Error("Rate limiting failed. Please try again later.");
    }
  });

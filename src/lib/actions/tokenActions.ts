"use server";

let token: string | null = null;
let tokenExpiry: number | null = null;

async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      console.warn(`Fetch attempt ${i + 1} failed: ${response.status} - ${response.statusText}`);
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} encountered an error:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  throw new Error(`Failed to fetch after ${retries} attempts`);
}

export async function fetchToken(): Promise<string | undefined> {
  const login = process.env.MTL_USER_LOGIN as string;
  const password = process.env.MTL_USER_PASSWORD as string;

  try {
    const res = await fetchWithRetry("https://backend.app.mtlworld.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();

    if (data.accessToken) {
      token = data.accessToken as string;

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      tokenExpiry = tokenPayload.exp * 1000;
      return token;
    } else {
      throw new Error("No access token in response");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    return undefined;
  }
}

export async function ensureToken(): Promise<string | undefined> {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry - 60000) {
    return await fetchToken();
  }

  return token;
}

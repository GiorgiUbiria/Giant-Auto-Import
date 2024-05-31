"use server";

let token: string | null = null;
let tokenExpiry: number | null = null;

export async function fetchToken(): Promise<string | undefined> {
  const login = process.env.MTL_USER_LOGIN as string;
  const password = process.env.MTL_USER_PASSWORD as string;

  try {
    const res = await fetch("https://backend.app.mtlworld.com/api", {
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
      throw new Error("Failed to fetch token");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}

export async function ensureToken(): Promise<string | undefined> {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry - 60000) {
    return (await fetchToken()) as string;
  }
}

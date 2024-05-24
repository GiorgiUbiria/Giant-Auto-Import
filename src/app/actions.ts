"use server";

import { DatabaseUser, db } from "@/lib/db";
import { CarData, CarResponse } from "@/lib/interfaces";

let token: string | null = null;
let tokenExpiry: number | null = null;

async function fetchToken(): Promise<void> {
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
    } else {
      throw new Error("Failed to fetch token");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}

async function ensureToken(): Promise<void> {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry - 60000) {
    await fetchToken();
  }
}

export async function fetchCars(): Promise<CarResponse | undefined> {
  try {
    await ensureToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const res = await fetch("https://backend.app.mtlworld.com/api/vehicles", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch cars");
    }

    const data: CarResponse | undefined = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching cars:", error);
  }
}

export async function getUsers(): Promise<any> {
  try {
    const users = db.prepare("SELECT * FROM user WHERE role_id = 1").get() as
      | DatabaseUser[]
      | undefined;
    if (!users) {
      throw new Error("No users found");
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

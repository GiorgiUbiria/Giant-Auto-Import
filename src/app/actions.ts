"use server";

export async function getCars() {
  try {
    const res = await fetch("https://backend.app.mtlworld.com/api/vehicles", {
      method: "GET",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZTFlMDBkMTNlOWY0ZDAzZDlkN2U4NCIsInNoaXBwaW5nIjoiR2lhbnQgQXV0byBJbXBvcnQgTExDIiwicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImdpYW50YSIsImlhdCI6MTcxNTk0ODgzMywiZXhwIjoxNzE1OTQ5NzMzfQ.LXdBQ8IDKKJttqnbRnqnTfaLfL3FDDbimrYKKqh8goc"   
      }
    });

    const data = await res.json();
    
    return data;
  } catch(e) {
    console.log(e)
  }
}

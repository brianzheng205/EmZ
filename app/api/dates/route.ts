import { NextResponse } from "next/server";
import { addDoc, collection } from "firebase/firestore";
import db from "@firebase";
import { FirestoreListItem } from "@/dates/types";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secretToken = process.env.API_SECRET_TOKEN;

    // Secure the endpoint by checking the token
    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, text } = body;

    // Extract URL from text if available
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const extractedUrlMatch = text?.match(urlPattern) || url?.match(urlPattern);
    const extractedUrl = extractedUrlMatch ? extractedUrlMatch[0] : url;

    if (!extractedUrl && !text && !url) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const itemName = title || "Reel Date Idea";
    const itemNotes = extractedUrl || text || url || "";

    const item: FirestoreListItem = {
      name: itemName,
      placeId: "",
      duration: 60,
      cost: 0,
      activityType: "Other",
      notes: itemNotes,
    };

    const docRef = await addDoc(collection(db, "datesList"), item);

    return NextResponse.json({ success: true, id: docRef.id, item });
  } catch (error) {
    console.error("Error creating date list item from API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

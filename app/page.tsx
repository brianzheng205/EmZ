"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import app from "../firebase/client";

const fetchData = async () => {
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, "testCollection"));
  return querySnapshot.docs.map((doc) => doc.data()) as DocumentData[];
};

import "./globals.css";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    fetchData().then((documents) => setDocuments(documents));
  }, []);

  return (
    <div>
      <h1>EmZ</h1>
      <h2>Test Collection</h2>
      <ul>
        {documents.map((document, index) => (
          <li key={index}>{document.name}</li>
        ))}
      </ul>
    </div>
  );
}

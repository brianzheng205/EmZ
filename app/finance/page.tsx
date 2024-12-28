"use client";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import app from "../../firebase/client";
import { useEffect, useState } from "react";

const fetchData = async () => {
  const db = getFirestore(app);
  const docRef = doc(db, "activeBudgets", "2025");
  const docSnap = await getDoc(docRef);
  return docSnap.data() as DocumentData;
};

const fetchBudgets = async (path) => {
  if (path === undefined || path.length === 0) {
    return {};
  }
  const db = getFirestore(app);
  const docRef = doc(db, ...path);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as DocumentData;
};

import "../globals.css";

export default function Finance() {
  const headers = [
    "Monthly Em (%)",
    "Monthly Em ($)",
    "Yearly Em (%)",
    "Yearly Em ($)",
    "Monthly Z (%)",
    "Monthly Z ($)",
    "Yearly Z (%)",
    "Yearly Z ($)",
  ];

  function calculateGross(person) {
    let gross = 0;
    if (person.pretax["Gross Base"] !== undefined) {
      gross += person.pretax["Gross Base"].amount;
    }
    if (person.pretax["Gross Stipend"] !== undefined) {
      gross += person.pretax["Gross Stipend"].amount;
    }
    if (person.pretax["Gross Bonus"] !== undefined) {
      gross += person.pretax["Gross Bonus"].amount;
    }
    return gross;
  }

  const [emilyBudgetPath, setEmilyBudgetPath] = useState<string[]>([]);
  const [brianBudgetPath, setBrianBudgetPath] = useState<string[]>([]);
  const [emilyBudget, setEmilyBudget] = useState<DocumentData>({});
  const [brianBudget, setBrianBudget] = useState<DocumentData>({});

  useEffect(() => {
    fetchData().then((document) => {
      setEmilyBudgetPath(
        document?.emily?._key.path.segments.slice(
          document?.emily?._key.path.offset
        )
      );
      setBrianBudgetPath(
        document?.brian?._key.path.segments.slice(
          document?.brian?._key.path.offset
        )
      );
    });
  }, []);

  useEffect(() => {
    fetchBudgets(emilyBudgetPath).then((document) => {
      setEmilyBudget(document);
    });
  }, [emilyBudgetPath]);

  useEffect(() => {
    fetchBudgets(brianBudgetPath).then((document) => {
      setBrianBudget(document);
    });
  }, [brianBudgetPath]);

  const posttax = new Set([
    ...Object.keys(emilyBudget?.postTax || {}),
    ...Object.keys(brianBudget?.postTax || {}),
  ]);

  const pretax = new Set([
    ...Object.keys(emilyBudget?.preTax || {}),
    ...Object.keys(brianBudget?.preTax || {}),
  ]);

  return (
    <div>
      <table className="border-collapse border border-black">
        <thead>
          <tr>
            <th></th>
            <th className="border-collapse border border-black">Category</th>
            {headers.map((header, index) => (
              <th
                className="border-collapse border border-black"
                key={`header-${index}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...posttax].map((category, index) => (
            <tr
              className="border-collapse border border-black"
              key={`post-tax-${index}`}
            >
              {index === 0 && (
                <td
                  className="border-collapse border border-black"
                  rowSpan={posttax.size}
                >
                  Post-Tax
                </td>
              )}
              <td className="border-collapse border border-black">
                {category}
              </td>
              {headers.map((header, index) => (
                <td
                  className="border-collapse border border-black"
                  key={`post-tax-${category}-${index}`}
                ></td>
              ))}
            </tr>
          ))}
          {[...pretax].map((category, index) => (
            <tr
              className="border-collapse border border-black"
              key={`pre-tax-${index}`}
            >
              {index === 0 && (
                <td
                  className="border-collapse border border-black"
                  rowSpan={pretax.size}
                >
                  Pre-Tax
                </td>
              )}
              <td className="border-collapse border border-black">
                {category}
              </td>
              {headers.map((header, index) => (
                <td
                  className="border-collapse border border-black"
                  key={`pre-tax-${category}-${index}`}
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

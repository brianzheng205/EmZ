"use client";

import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import app from "../../firebase/client";

import { useEffect, useState } from "react";

import DataRow, { calculateGross, TableCell, NullTableCell } from "./table";
import EditableCell from "./EditableCell";

import "../globals.css";

const styles = {
  border: "border-collapse border border-black",
  bold: "font-bold",
};

// TODO: Get rid of the math.max thing after 2025
const fetchData = async () => {
  const db = getFirestore(app);
  const docRef = doc(
    db,
    "activeBudgets",
    Math.max(new Date().getFullYear(), 2025).toString()
  );
  const docSnap = await getDoc(docRef);
  return docSnap.data() as DocumentData;
};

const fetchBudgets = async (path: string) => {
  if (path === undefined || path.length === 0) {
    return {};
  }
  const db = getFirestore(app);
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as DocumentData;
};

const fetchTaxBrackets = async (path: string) => {
  if (path === undefined || path.length === 0) {
    return {};
  }
  const db = getFirestore(app);
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as DocumentData;
};

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
    fetchBudgets(emilyBudgetPath?.join("/")).then((document) => {
      setEmilyBudget(document);
    });
  }, [emilyBudgetPath]);

  useEffect(() => {
    fetchBudgets(brianBudgetPath?.join("/")).then((document) => {
      setBrianBudget(document);
    });
  }, [brianBudgetPath]);

  const postTax = new Set([
    ...Object.keys(emilyBudget?.postTax || {}),
    ...Object.keys(brianBudget?.postTax || {}),
  ]);

  const preTax = new Set([
    ...Object.keys(emilyBudget?.preTax || {}),
    ...Object.keys(brianBudget?.preTax || {}),
  ]);

  return (
    <div>
      <table className={styles.border}>
        <thead>
          <tr>
            <th></th>
            <th className={styles.border}>Category</th>
            {headers.map((header, index) => (
              <th className={styles.border} key={`header-${index}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...postTax].map((category, index) => (
            <tr key={`post-tax-${index}`} className={styles.border}>
              {index === 0 && (
                <TableCell tdProps={{ rowSpan: postTax.size }}>
                  Post-Tax
                </TableCell>
              )}
              <TableCell>{category}</TableCell>
              <DataRow
                category={category}
                person={emilyBudget}
                isPreTax={false}
              />
              <DataRow
                category={category}
                person={brianBudget}
                isPreTax={false}
              />
            </tr>
          ))}
          {[...preTax].map((category, index) => (
            <tr key={`pre-tax-${index}`} className={styles.border}>
              {index === 0 && (
                <TableCell tdProps={{ rowSpan: preTax.size + 1 }}>
                  Pre-Tax
                </TableCell>
              )}
              <TableCell>{category}</TableCell>
              <DataRow category={category} person={emilyBudget} isPreTax />
              <DataRow category={category} person={brianBudget} isPreTax />
            </tr>
          ))}
          <tr>
            <TableCell className={styles.bold}>Gross</TableCell>
            <TableCell>100%</TableCell>
            <TableCell>
              ${(calculateGross(emilyBudget) / 6).toFixed(0)}
            </TableCell>
            <TableCell>100%</TableCell>
            <TableCell>${calculateGross(emilyBudget)}</TableCell>
            <NullTableCell />
            <NullTableCell />
            <NullTableCell />
            <NullTableCell />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import app from "../../firebase/client";

import { useEffect, useState } from "react";
import { updateDoc } from "firebase/firestore";

import DataRow, {
  calculateGross,
  UneditableCell,
  NullTableCell,
} from "./table";
import EditableCell from "./EditableCell";

import "../globals.css";

const styles = {
  border: "border-collapse border border-black",
  bold: "font-bold",
};

const fetchData = async () => {
  const db = getFirestore(app);
  const docRef = doc(db, "activeBudgets", new Date().getFullYear().toString());
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

const COLUMN_HEADERS = [
  "Monthly Em (%)",
  "Monthly Em ($)",
  "Yearly Em (%)",
  "Yearly Em ($)",
  "Monthly Z (%)",
  "Monthly Z ($)",
  "Yearly Z (%)",
  "Yearly Z ($)",
];

export default function Finance() {
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

  const updateBudget = (path: string[], setBudget: (DocumentData) => void) => {
    fetchBudgets(path?.join("/")).then((document) => {
      setBudget(document);
    });
  };

  const updateEmilyBudget = () => {
    updateBudget(emilyBudgetPath, setEmilyBudget);
  };

  const updatedBrianBudget = () => {
    updateBudget(brianBudgetPath, setBrianBudget);
  };

  useEffect(updateEmilyBudget, [emilyBudgetPath]);

  useEffect(updatedBrianBudget, [brianBudgetPath]);

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
            {COLUMN_HEADERS.map((header, index) => (
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
                <UneditableCell
                  className={styles.bold}
                  tdProps={{ rowSpan: postTax.size }}
                >
                  Post-Tax
                </UneditableCell>
              )}
              <UneditableCell className={styles.bold}>
                {category}
              </UneditableCell>
              <DataRow
                category={category}
                person={emilyBudget}
                updateFunction={updateEmilyBudget}
                budgetPath={emilyBudgetPath}
                isPreTax={false}
              />
              <DataRow
                category={category}
                person={brianBudget}
                updateFunction={updatedBrianBudget}
                budgetPath={brianBudgetPath}
                isPreTax={false}
              />
            </tr>
          ))}
          {[...preTax].map((category, index) => (
            <tr key={`pre-tax-${index}`} className={styles.border}>
              {index === 0 && (
                <UneditableCell
                  className={styles.bold}
                  tdProps={{ rowSpan: preTax.size + 1 }}
                >
                  Pre-Tax
                </UneditableCell>
              )}
              <UneditableCell className={styles.bold}>
                {category}
              </UneditableCell>
              <DataRow
                category={category}
                person={emilyBudget}
                updateFunction={updateEmilyBudget}
                budgetPath={emilyBudgetPath}
                isPreTax
              />
              <DataRow
                category={category}
                person={brianBudget}
                updateFunction={updatedBrianBudget}
                budgetPath={brianBudgetPath}
                isPreTax
              />
            </tr>
          ))}
          <tr>
            <UneditableCell className={styles.bold}>Gross</UneditableCell>
            <UneditableCell>100%</UneditableCell>
            <UneditableCell>
              ${(calculateGross(emilyBudget) / 6).toFixed(0)}
            </UneditableCell>
            <UneditableCell>100%</UneditableCell>
            <UneditableCell>${calculateGross(emilyBudget)}</UneditableCell>
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

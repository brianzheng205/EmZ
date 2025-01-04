"use client";

import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import app from "../../firebase/client";

import { useEffect, useState } from "react";

import DataRow, {
  calculateGross,
  UneditableCell,
  NullTableCell,
} from "./table";
import EditableCell from "./EditableCell";

import { styles } from "./styles";
import "../globals.css";

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
    <div className="flex justify-center">
      <div className={styles.tableWrapper}>
        <table className={styles.border}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.cell}></th>
              <th
                className={`${styles.border} ${styles.cell} ${styles.secondColumnEnd}`}
              >
                Category
              </th>
              {COLUMN_HEADERS.map((header, index) => (
                <th
                  className={`${styles.border} ${styles.cell}`}
                  key={`header-${index}`}
                >
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
                <UneditableCell
                  className={`${styles.bold} ${styles.secondColumnEnd}`}
                >
                  {category}
                </UneditableCell>
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
                  <UneditableCell
                    className={styles.bold}
                    tdProps={{ rowSpan: preTax.size + 1 }}
                  >
                    Pre-Tax
                  </UneditableCell>
                )}
                <UneditableCell
                  className={`${styles.bold} ${styles.secondColumnEnd}`}
                >
                  {category}
                </UneditableCell>
                <DataRow category={category} person={emilyBudget} isPreTax />
                <DataRow category={category} person={brianBudget} isPreTax />
              </tr>
            ))}
            <tr>
              <UneditableCell
                className={`${styles.bold} ${styles.secondColumnEnd}`}
              >
                Gross
              </UneditableCell>
              <UneditableCell>100%</UneditableCell>
              <EditableCell initialValue={calculateGross(emilyBudget) / 6} />
              <UneditableCell>100%</UneditableCell>
              <EditableCell initialValue={calculateGross(emilyBudget)} />
              <NullTableCell />
              <NullTableCell />
              <NullTableCell />
              <NullTableCell />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

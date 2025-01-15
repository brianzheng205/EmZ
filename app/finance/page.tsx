"use client";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  DocumentData,
  deleteField,
} from "firebase/firestore";
import app from "../../firebase/client";

import { useEffect, useState } from "react";

import DataRow, { calculateGross, UneditableCell } from "./table";

import styles from "./styles";
import "../globals.css";

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

  const updateBrianBudget = () => {
    updateBudget(brianBudgetPath, setBrianBudget);
  };

  useEffect(updateEmilyBudget, [emilyBudgetPath]);

  useEffect(updateBrianBudget, [brianBudgetPath]);

  useEffect(() => {
    const newPostTax = new Set([
      ...Object.keys(emilyBudget?.postTax || {}),
      ...Object.keys(brianBudget?.postTax || {}),
    ]);
    setPostTax(newPostTax);
  }, [emilyBudget, brianBudget]);

  const [postTax, setPostTax] = useState<Set<string>>({});
  const preTax = new Set([
    ...Object.keys(emilyBudget?.preTax || {}),
    ...Object.keys(brianBudget?.preTax || {}),
  ]);

  const handleDeleteCategory = async (category: string) => {
    const db = getFirestore(app);
    const brianRef = doc(db, brianBudgetPath.join("/"));
    const emilyRef = doc(db, emilyBudgetPath.join("/"));
    console.log("here");
    if (brianBudget?.postTax?.[category]) {
      updateDoc(brianRef, {
        [`postTax.${category}`]: deleteField(),
      });
    }

    if (emilyBudget?.postTax?.[category]) {
      updateDoc(emilyRef, {
        [`postTax.${category}`]: deleteField(),
      });
    }

    updateEmilyBudget();
    updateBrianBudget();
  };

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
            {postTax.size > 0 &&
              [...postTax].sort().map((category, index) => (
                <tr
                  key={`post-tax-${index}`}
                  className={`${styles.border} group`}
                >
                  {index === 0 && (
                    <UneditableCell
                      className={`${styles.bold} relative`}
                      tdProps={{
                        rowSpan: postTax.size,
                      }}
                    >
                      <span>Post-Tax</span>
                      <div className={styles.addRowContainer}>
                        <button
                          className={styles.addRowButton}
                          onClick={() => {
                            let categoryName = "New Category";
                            let i = 0;
                            while (postTax.has(categoryName)) {
                              i++;
                              categoryName = `New Category ${i}`;
                            }
                            const newPostTax = new Set(postTax);
                            newPostTax.add(categoryName);
                            setPostTax(newPostTax);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.deleteRowContainer}>
                        <button
                          className={styles.deleteRowButton}
                          onClick={() => {}}
                        >
                          x
                        </button>
                      </div>
                    </UneditableCell>
                  )}
                  <UneditableCell
                    className={`${styles.bold} ${styles.secondColumnEnd} relative`}
                  >
                    <span>{category}</span>
                    <div className={styles.deleteRowContainer}>
                      <button
                        className={styles.deleteRowButton}
                        onClick={() => handleDeleteCategory(category)}
                      >
                        x
                      </button>
                    </div>
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
                    updateFunction={updateBrianBudget}
                    budgetPath={brianBudgetPath}
                    isPreTax={false}
                  />
                </tr>
              ))}
            {[...preTax].map((category, index) => (
              <tr key={`pre-tax-${index}`} className={`${styles.border} group`}>
                {index === 0 && (
                  <UneditableCell
                    className={`relative ${styles.bold}`}
                    tdProps={{ rowSpan: preTax.size + 1 }}
                  >
                    Pre-Tax
                    <div className={styles.addRowContainer}>
                      <button className={styles.addRowButton}>+</button>
                    </div>
                    <div className={styles.deleteRowContainer}>
                      <button className={styles.deleteRowButton}>x</button>
                    </div>
                  </UneditableCell>
                )}
                <UneditableCell
                  className={`${styles.bold} ${styles.secondColumnEnd} relative`}
                >
                  <span>{category}</span>
                  <div className={styles.deleteRowContainer}>
                    <button className={styles.deleteRowButton}>x</button>
                  </div>
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
                  updateFunction={updateBrianBudget}
                  budgetPath={brianBudgetPath}
                  isPreTax
                />
              </tr>
            ))}
            <tr>
              <UneditableCell
                className={`${styles.bold} ${styles.secondColumnEnd}`}
              >
                Gross
              </UneditableCell>
              <UneditableCell>100%</UneditableCell>
              <UneditableCell>
                ${(calculateGross(emilyBudget) / 5).toFixed(0)}
              </UneditableCell>
              <UneditableCell>100%</UneditableCell>
              <UneditableCell>${calculateGross(emilyBudget)}</UneditableCell>
              <UneditableCell>100%</UneditableCell>
              <UneditableCell>
                ${(calculateGross(brianBudget) / 5).toFixed(0)}
              </UneditableCell>
              <UneditableCell>100%</UneditableCell>
              <UneditableCell>${calculateGross(brianBudget)}</UneditableCell>
            </tr>
            <tr>
              <td className={`${styles.border} ${styles.bold} ${styles.cell}`}>
                <button className={`text-muted`}>+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

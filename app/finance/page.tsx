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
    let newSections = {};
    const sects = new Set([
      ...Object.keys(emilyBudget || {}),
      ...Object.keys(brianBudget || {}),
    ]);
    [...sects].forEach((section) => {
      newSections[section] = {
        categories: new Set([
          ...Object.keys(emilyBudget?.[section]?.categories || {}),
          ...Object.keys(brianBudget?.[section]?.categories || {}),
        ]),
        isPreTax:
          emilyBudget?.[section]?.isPreTax ||
          brianBudget?.[section]?.isPreTax ||
          false,
      };
    });

    setSections(newSections);
  }, [emilyBudget, brianBudget]);

  interface Section {
    categories: Set<string>;
    isPreTax: boolean;
  }

  const [sections, setSections] = useState<{ [key: string]: Section }>({});

  const generateUniqueCategory = (base: string, list: Set<string>) => {
    let name = base;
    let i = 0;
    while (list.has(name)) {
      i++;
      name = `${base} ${i}`;
    }
    return name;
  };

  const generateUniqueSection = (
    base: string,
    list: { [key: string]: Section }
  ) => {
    let name = base;
    let i = 0;
    while (list[name]) {
      i++;
      name = `${base} ${i}`;
    }
    return name;
  };

  const handleDeleteCategory = async (section: string, category: string) => {
    const db = getFirestore(app);
    const brianRef = doc(db, brianBudgetPath.join("/"));
    const emilyRef = doc(db, emilyBudgetPath.join("/"));
    if (brianBudget?.[section]?.categories[category]) {
      updateDoc(brianRef, {
        [`${section}.categories.${category}`]: deleteField(),
      });
    }

    if (emilyBudget?.[section]?.categories[category]) {
      updateDoc(emilyRef, {
        [`${section}.categories.${category}`]: deleteField(),
      });
    }

    updateEmilyBudget();
    updateBrianBudget();
  };

  const handleDeleteSection = async (section: string) => {
    const db = getFirestore(app);
    const brianRef = doc(db, brianBudgetPath.join("/"));
    const emilyRef = doc(db, emilyBudgetPath.join("/"));
    if (brianBudget?.[section]) {
      updateDoc(brianRef, {
        [section]: deleteField(),
      });
    }

    if (emilyBudget?.[section]) {
      updateDoc(emilyRef, {
        [section]: deleteField(),
      });
    }

    updateEmilyBudget();
    updateBrianBudget();
  };

  const handleTaxPropertyUpdate = (section: string) => {
    const newSections = { ...sections };
    newSections[section].isPreTax = !newSections[section].isPreTax;
    setSections(newSections);
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
            {Object.keys(sections)
              .sort()
              .map((section, i) =>
                [...sections[section].categories]
                  .sort()
                  .map((category, index) => (
                    <tr key={index} className={`${styles.border} group`}>
                      {index === 0 && (
                        <UneditableCell
                          className={`${styles.bold} relative`}
                          tdProps={{
                            rowSpan:
                              i === Object.keys(sections).length - 1
                                ? sections[section].categories.size + 1
                                : sections[section].categories.size,
                          }}
                        >
                          <div>{section}</div>
                          <div onClick={() => handleTaxPropertyUpdate(section)}>
                            {sections[section].isPreTax
                              ? "(Pre-Tax)"
                              : "(Post-Tax)"}
                          </div>
                          <div className={styles.addRowContainer}>
                            <button
                              className={styles.addRowButton}
                              onClick={() => {
                                const categoryName = generateUniqueCategory(
                                  "New Category",
                                  sections[section].categories
                                );
                                const newSections = { ...sections };
                                newSections[section].categories.add(
                                  categoryName
                                );
                                setSections(newSections);
                              }}
                            >
                              +
                            </button>
                          </div>
                          <div className={styles.deleteRowContainer}>
                            <button
                              className={styles.deleteRowButton}
                              onClick={() => handleDeleteSection(section)}
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
                            onClick={() =>
                              handleDeleteCategory(section, category)
                            }
                          >
                            x
                          </button>
                        </div>
                      </UneditableCell>
                      <DataRow
                        section={section}
                        category={category}
                        person={emilyBudget}
                        updateFunction={updateEmilyBudget}
                        budgetPath={emilyBudgetPath}
                        isPreTax={sections[section].isPreTax}
                      />
                      <DataRow
                        section={section}
                        category={category}
                        person={brianBudget}
                        updateFunction={updateBrianBudget}
                        budgetPath={brianBudgetPath}
                        isPreTax={sections[section].isPreTax}
                      />
                    </tr>
                  ))
              )}
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
                <button
                  className={`text-muted`}
                  onClick={() => {
                    const newSectionName = generateUniqueSection(
                      "New Section",
                      sections
                    );
                    const newSections = {
                      ...sections,
                      [newSectionName]: {
                        categories: new Set<string>(["New Category"]),
                        isPreTax: false,
                      },
                    };
                    setSections(newSections);
                  }}
                >
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

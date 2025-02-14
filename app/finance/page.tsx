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

import { useEffect, useState, useMemo } from "react";

import DataRow, { calculateGross, UneditableCell } from "./table";

import "../globals.css";
import styles from "./styles";

interface Section {
  categories: Set<string>;
  isPreTax: boolean;
}
import { EditableTextCell } from "./EditableCell";

interface Section {
  categories: Set<string>;
  isPreTax: boolean;
}
const fetchData = async () => {
  const db = getFirestore(app);
  const docRef = doc(db, "activeBudgets", new Date().getFullYear().toString());
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
  const [sections, setSections] = useState<{ [key: string]: Section }>({});

  const db = useMemo(() => getFirestore(app), []);
  const brianRef = useMemo(
    () =>
      brianBudgetPath.length > 0 ? doc(db, brianBudgetPath.join("/")) : null,
    [db, brianBudgetPath]
  );
  const emilyRef = useMemo(
    () =>
      emilyBudgetPath.length > 0 ? doc(db, emilyBudgetPath.join("/")) : null,
    [db, emilyBudgetPath]
  );

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

  const updateBudget = (
    path: string[],
    setBudget: React.Dispatch<React.SetStateAction<DocumentData>>
  ) => {
    if (path.length === 0) return;
    const docRef = doc(db, path.join("/"));
    getDoc(docRef).then((docSnap) => setBudget(docSnap.data() as DocumentData));
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
    const newSections = {};
    const sects = new Set([
      ...Object.keys(emilyBudget || {}),
      ...Object.keys(brianBudget || {}),
    ]);

    sects.forEach((section) => {
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
    if (!brianRef || !emilyRef) return;

    if (brianBudget?.[section]?.categories[category]) {
      if (Object.keys(brianBudget[section].categories).length === 1) {
        updateDoc(brianRef, {
          [section]: deleteField(),
        });
      } else {
        updateDoc(brianRef, {
          [`${section}.categories.${category}`]: deleteField(),
        });
      }
    }

    if (emilyBudget?.[section]?.categories[category]) {
      if (Object.keys(emilyBudget[section].categories).length === 1) {
        updateDoc(emilyRef, {
          [section]: deleteField(),
        });
      } else {
        updateDoc(emilyRef, {
          [`${section}.categories.${category}`]: deleteField(),
        });
      }
    }

    updateEmilyBudget();
    updateBrianBudget();
  };

  const handleDeleteSection = async (section: string) => {
    if (!brianRef || !emilyRef) return;

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
    const db = getFirestore(app);
    const brianRef = doc(db, brianBudgetPath.join("/"));
    const emilyRef = doc(db, emilyBudgetPath.join("/"));

    const updatedValue = !sections[section].isPreTax;
    if (brianBudget?.[section]) {
      updateDoc(brianRef, {
        [`${section}.isPreTax`]: updatedValue,
      });
    }

    if (emilyBudget?.[section]) {
      updateDoc(emilyRef, {
        [`${section}.isPreTax`]: updatedValue,
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
            {Object.keys(sections)
              .sort((a, b) => {
                if (sections[a].isPreTax == sections[b].isPreTax) {
                  return a.localeCompare(b);
                } else if (sections[a].isPreTax) {
                  return 1;
                } else {
                  return -1;
                }
              })
              .map((section, i) =>
                [...sections[section].categories]
                  .sort()
                  .map((category, index) => (
                    <tr key={index} className={`${styles.border} group`}>
                      {index === 0 && (
                        <EditableTextCell
                          initialValue={section}
                          updateFunction={(oldSection, newSection) => {
                            if (oldSection === newSection) {
                              return;
                            }

                            const db = getFirestore(app);
                            const brianRef = doc(db, brianBudgetPath.join("/"));
                            const emilyRef = doc(db, emilyBudgetPath.join("/"));
                            if (brianBudget?.[oldSection]) {
                              updateDoc(brianRef, {
                                [newSection]: brianBudget[oldSection],
                                [oldSection]: deleteField(),
                              });
                            }

                            if (emilyBudget?.[oldSection]) {
                              updateDoc(emilyRef, {
                                [newSection]: emilyBudget[oldSection],
                                [oldSection]: deleteField(),
                              });
                            }

                            updateEmilyBudget();
                            updateBrianBudget();
                          }}
                          tdProps={{
                            className: `${styles.bold} relative`,
                            rowSpan:
                              i === Object.keys(sections).length - 1
                                ? sections[section].categories.size + 1
                                : sections[section].categories.size,
                          }}
                        >
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

                                const db = getFirestore(app);
                                const brianRef = doc(
                                  db,
                                  brianBudgetPath.join("/")
                                );
                                const emilyRef = doc(
                                  db,
                                  emilyBudgetPath.join("/")
                                );

                                if (brianBudget?.[section]) {
                                  updateDoc(brianRef, {
                                    [`${section}.categories.${categoryName}`]: {
                                      amount: 0,
                                      time: "month",
                                    },
                                  });
                                }

                                if (emilyBudget?.[section]) {
                                  updateDoc(emilyRef, {
                                    [`${section}.categories.${categoryName}`]: {
                                      amount: 0,
                                      time: "month",
                                    },
                                  });
                                }

                                updateEmilyBudget();
                                updateBrianBudget();
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
                        </EditableTextCell>
                      )}
                      <EditableTextCell
                        tdProps={{
                          className: `${styles.bold} ${styles.secondColumnEnd} relative`,
                        }}
                        initialValue={category}
                        updateFunction={(oldCategory, newCategory) => {
                          if (oldCategory === newCategory) {
                            return;
                          }

                          const db = getFirestore(app);
                          const brianRef = doc(db, brianBudgetPath.join("/"));
                          const emilyRef = doc(db, emilyBudgetPath.join("/"));

                          if (brianBudget?.[section]?.categories[oldCategory]) {
                            updateDoc(brianRef, {
                              [`${section}.categories.${newCategory}`]:
                                brianBudget[section].categories[oldCategory],
                              [`${section}.categories.${oldCategory}`]:
                                deleteField(),
                            });
                          }

                          if (emilyBudget?.[section]?.categories[oldCategory]) {
                            updateDoc(emilyRef, {
                              [`${section}.categories.${newCategory}`]:
                                emilyBudget[section].categories[oldCategory],
                              [`${section}.categories.${oldCategory}`]:
                                deleteField(),
                            });
                          }

                          updateEmilyBudget();
                          updateBrianBudget();
                        }}
                      >
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
                      </EditableTextCell>
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

                    const db = getFirestore(app);
                    const brianRef = doc(db, brianBudgetPath.join("/"));
                    const emilyRef = doc(db, emilyBudgetPath.join("/"));

                    if (brianBudget) {
                      updateDoc(brianRef, {
                        [newSectionName]: {
                          categories: {
                            "New Category": { amount: 0, time: "month" },
                          },
                          isPreTax: false,
                        },
                      });
                    }

                    if (emilyBudget) {
                      updateDoc(emilyRef, {
                        [newSectionName]: {
                          categories: {
                            "New Category": { amount: 0, time: "month" },
                          },
                          isPreTax: false,
                        },
                      });
                    }

                    updateEmilyBudget();
                    updateBrianBudget();
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

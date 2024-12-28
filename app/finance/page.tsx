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

  function calculateGross(person): number {
    let gross = 0;
    if (person?.preTax?.["Gross Base"]) {
      gross += person.preTax["Gross Base"].amount;
    }
    if (person?.preTax?.["Gross Stipend"]) {
      gross += person.preTax["Gross Stipend"].amount;
    }
    if (person?.preTax?.["Gross Bonus"]) {
      gross += person.preTax["Gross Bonus"].amount;
    }
    return gross;
  }

  // TODO
  function calculateMonthlyTakeHome(person) {
    let takeHome = 0;
    if (person?.preTax?.["Gross Base"]) {
      takeHome += person.preTax["Gross Base"].amount;
    }

    takeHome = removeDeductions(person);
    takeHome = taxBracketDeductions(takeHome);

    return takeHome / 12;
  }

  // TODO
  function calculateYearlyTakeHome(person) {
    let takeHome = 0;
    if (person?.preTax?.["Gross Base"]) {
      takeHome += person.preTax["Gross Base"].amount;
    }

    if (person?.preTax?.["Gross Stipend"]) {
      takeHome += person.preTax["Gross Stipend"].amount;
    }

    takeHome = removeDeductions(person);
    takeHome = taxBracketDeductions(takeHome);

    if (person?.preTax?.["Gross Bonus"]) {
      takeHome += person.preTax["Gross Bonus"].amount * 0.88;
    }

    return takeHome;
  }

  function removeDeductions(person): number {
    return 0;
  }

  // TODO
  function taxBracketDeductions(amount): number {
    return amount;
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
    fetchBudgets(emilyBudgetPath?.join("/")).then((document) => {
      setEmilyBudget(document);
    });
  }, [emilyBudgetPath]);

  useEffect(() => {
    fetchBudgets(brianBudgetPath?.join("/")).then((document) => {
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
              <td className="border-collapse border border-black">
                {(
                  (emilyBudget?.postTax?.[category]
                    ? emilyBudget.postTax[category].time === "month"
                      ? emilyBudget.postTax[category].amount /
                        calculateMonthlyTakeHome(emilyBudget)
                      : emilyBudget.postTax[category].amount /
                        6 /
                        calculateMonthlyTakeHome(emilyBudget)
                    : 0) * 100
                ).toFixed(0)}
                %
              </td>
              <td className="border-collapse border border-black">
                $
                {emilyBudget?.postTax?.[category]
                  ? emilyBudget.postTax[category].time === "month"
                    ? emilyBudget.postTax[category].amount.toFixed(0)
                    : (emilyBudget.postTax[category].amount / 6).toFixed(0)
                  : ""}
              </td>
              <td className="border-collapse border border-black">
                {(
                  (emilyBudget?.postTax?.[category]
                    ? emilyBudget.postTax[category].time === "month"
                      ? (emilyBudget.postTax[category].amount * 6) /
                        calculateYearlyTakeHome(emilyBudget)
                      : emilyBudget.postTax[category].amount /
                        calculateYearlyTakeHome(emilyBudget)
                    : 0) * 100
                ).toFixed(0)}
                %
              </td>
              <td className="border-collapse border border-black">
                $
                {emilyBudget?.postTax?.[category]
                  ? emilyBudget.postTax[category].time === "month"
                    ? (emilyBudget.postTax[category].amount * 6).toFixed(0)
                    : emilyBudget.postTax[category].amount.toFixed(0)
                  : ""}
              </td>
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
                  rowSpan={pretax.size + 1}
                >
                  Pre-Tax
                </td>
              )}
              <td className="border-collapse border border-black">
                {category}
              </td>
              <td className="border-collapse border border-black">
                {(
                  (emilyBudget?.preTax?.[category]
                    ? emilyBudget.preTax[category].time === "month"
                      ? emilyBudget.preTax[category].amount /
                        (calculateGross(emilyBudget) / 6)
                      : emilyBudget.preTax[category].amount /
                        calculateGross(emilyBudget)
                    : 0) * 100
                ).toFixed(0)}
                %
              </td>
              <td className="border-collapse border border-black">
                $
                {emilyBudget?.preTax?.[category]
                  ? emilyBudget.preTax[category].time === "month"
                    ? emilyBudget.preTax[category].amount.toFixed(0)
                    : (emilyBudget.preTax[category].amount / 6).toFixed(0)
                  : ""}
              </td>
              <td className="border-collapse border border-black">
                {(
                  (emilyBudget?.preTax?.[category]
                    ? emilyBudget.preTax[category].time === "month"
                      ? (emilyBudget.preTax[category].amount * 6) /
                        calculateGross(emilyBudget)
                      : emilyBudget.preTax[category].amount /
                        calculateGross(emilyBudget)
                    : 0) * 100
                ).toFixed(0)}
                %
              </td>
              <td className="border-collapse border border-black">
                $
                {emilyBudget?.preTax?.[category]
                  ? emilyBudget.preTax[category].time === "month"
                    ? (emilyBudget.preTax[category].amount * 6).toFixed(0)
                    : emilyBudget.preTax[category].amount.toFixed(0)
                  : ""}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border-collapse border border-black">Gross</td>
            <td className="border-collapse border border-black">100%</td>
            <td className="border-collapse border border-black">
              ${(calculateGross(emilyBudget) / 6).toFixed(0)}
            </td>
            <td className="border-collapse border border-black">100%</td>
            <td className="border-collapse border border-black">
              ${calculateGross(emilyBudget)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

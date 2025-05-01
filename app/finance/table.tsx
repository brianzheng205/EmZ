import { DocumentData, doc, getFirestore, updateDoc } from "firebase/firestore";

import app from "../../firebase/client";

import EditableCell from "./EditableCell";
// import styles from "./styles";
// import "../globals.css";

type RowData = {
  amount: number;
  time: string;
};

const BONUS_TAKE_HOME = 0.78;

export function calculateGross(person: DocumentData): number {
  let gross = 0;
  if (person?.Gross?.categories["Gross Base"]) {
    gross += person.Gross.categories["Gross Base"].amount;
  }
  if (person?.Gross?.categories["Gross Stipend"]) {
    gross += person.Gross.categories["Gross Stipend"].amount;
  }
  if (person?.Gross?.categories["Gross Bonus"]) {
    gross += person.Gross.categories["Gross Bonus"].amount;
  }
  return gross;
}

function calculateMonthlyTakeHome(person: DocumentData) {
  let takeHome = person?.Gross?.categories["Gross Base"]?.amount || 0;
  takeHome -= removeDeductions(person);
  takeHome = removeTax(takeHome);
  return takeHome / 12;
}

// TODO
function calculateYearlyTakeHome(person: DocumentData) {
  let takeHome = 0;

  if (person?.Gross?.categories["Gross Base"])
    takeHome += person.Gross.categories["Gross Base"].amount;
  if (person?.Gross?.categories["Gross Stipend"])
    takeHome += person.Gross.categories["Gross Stipend"].amount;

  takeHome -= removeDeductions(person);
  takeHome = removeTax(takeHome);

  if (person?.Gross?.categories["Gross Bonus"])
    takeHome += person.Gross.categories["Gross Bonus"].amount * BONUS_TAKE_HOME;

  return takeHome;
}

// TODO
// eslint-disable-next-line
function removeDeductions(person: DocumentData): number {
  return 0;
}

// TODO
function removeTax(amount: number): number {
  return amount;
}

function getMonthlyAmount(data: RowData): number {
  return data.time === "month" ? data.amount : data.amount / 6;
}

function getYearlyAmount(data: RowData): number {
  return data.time === "month" ? data.amount * 6 : data.amount;
}

export function UneditableCell(props: {
  children?: React.ReactNode;
  className?: string;
  tdProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
}) {
  return (
    <td
      className={`border-collapse border border-black ${"styles.cell"} ${
        props.className || ""
      }`}
      {...props.tdProps}
    >
      {props.children}
    </td>
  );
}

export function NullTableCell() {
  return <td className="border-collapse border border-black bg-muted"></td>;
}

export default function DataRow(props: {
  section: string;
  category: string;
  person: DocumentData;
  updateFunction: () => void;
  budgetPath: string[];
  isPreTax: boolean;
}) {
  const data: RowData | undefined =
    props.person?.[props.section]?.categories?.[props.category];

  if (!data)
    return (
      <>
        <UneditableCell />
        <EditableCell updateFunction={updateBudgetMonthly} />
        <UneditableCell />
        <EditableCell updateFunction={updateBudgetYearly} />
      </>
    );

  const monthlyAmount = getMonthlyAmount(data);
  const yearlyAmount = getYearlyAmount(data);

  let monthlyIncome: number;
  let yearlyIncome: number;

  if (props.isPreTax) {
    yearlyIncome = calculateGross(props.person);
    monthlyIncome = yearlyIncome / 6;
  } else {
    monthlyIncome = calculateMonthlyTakeHome(props.person);
    yearlyIncome = calculateYearlyTakeHome(props.person);
  }

  async function updateBudgetValue(amount: number, time: string) {
    const db = getFirestore(app);

    const path = props.budgetPath.join("/");

    const docRef = doc(db, path);

    await updateDoc(docRef, {
      [`${props.section}.categories.${props.category}`]: {
        amount: amount,
        time: time,
      },
      [`${props.section}.isPreTax`]: props.isPreTax,
    });

    props.updateFunction();
  }

  function updateBudgetMonthly(amount: number) {
    updateBudgetValue(amount, "month");
  }

  function updateBudgetYearly(amount: number) {
    updateBudgetValue(amount, "year");
  }

  return (
    <>
      <UneditableCell>
        {((monthlyAmount / monthlyIncome) * 100).toFixed(0)}%
      </UneditableCell>
      <EditableCell
        initialValue={monthlyAmount}
        updateFunction={updateBudgetMonthly}
      />
      <UneditableCell>
        {((yearlyAmount / yearlyIncome) * 100).toFixed(0)}%
      </UneditableCell>
      <EditableCell
        initialValue={yearlyAmount}
        updateFunction={updateBudgetYearly}
      />
    </>
  );
}

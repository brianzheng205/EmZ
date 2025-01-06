import { DocumentData } from "firebase/firestore";
import EditableCell from "./EditableCell";
import styles from "./styles";
import "../globals.css";

type RowData = {
  amount: number;
  time: string;
};

const BONUS_TAKE_HOME = 0.78;

export function calculateGross(person: DocumentData): number {
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

function calculateMonthlyTakeHome(person: DocumentData) {
  let takeHome = person?.preTax["Gross Base"]?.amount || 0;
  takeHome -= removeDeductions(person);
  takeHome = removeTax(takeHome);
  return takeHome / 12;
}

// TODO
function calculateYearlyTakeHome(person: DocumentData) {
  let takeHome = 0;

  if (person?.preTax?.["Gross Base"])
    takeHome += person.preTax["Gross Base"].amount;
  if (person?.preTax?.["Gross Stipend"])
    takeHome += person.preTax["Gross Stipend"].amount;

  takeHome -= removeDeductions(person);
  takeHome = removeTax(takeHome);

  if (person?.preTax?.["Gross Bonus"])
    takeHome += person.preTax["Gross Bonus"].amount * BONUS_TAKE_HOME;

  return takeHome;
}

// TODO
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
      className={`border-collapse border border-black ${styles.cell} ${props.className || ""}`}
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
  category: string;
  person: DocumentData;
  isPreTax: boolean;
}) {
  const data: RowData | undefined = props.isPreTax
    ? props.person?.preTax?.[props.category]
    : props.person?.postTax?.[props.category];

  if (!data)
    return (
      <>
        <UneditableCell />
        <EditableCell />
        <UneditableCell />
        <EditableCell />
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

  return (
    <>
      <UneditableCell>
        {((monthlyAmount / monthlyIncome) * 100).toFixed(0)}%
      </UneditableCell>
      <EditableCell initialValue={monthlyAmount} />
      <UneditableCell>
        {((yearlyAmount / yearlyIncome) * 100).toFixed(0)}%
      </UneditableCell>
      <EditableCell initialValue={yearlyAmount} />
    </>
  );
}

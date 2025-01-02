import { DocumentData } from "firebase/firestore";

import "../globals.css";
import { get } from "http";

type RowData = {
  amount: number;
  time: string;
};

const NULL_VALUE = "N/A";
const BONUS_TAKE_HOME = 0.88;

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

export function TableCell(props: {
  children: React.ReactNode;
  className?: string;
  tdProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
}) {
  return (
    <td
      className={`border-collapse border border-black ${props.className || ""}`}
      {...props.tdProps}
    >
      {props.children}
    </td>
  );
}

export function NullTableCell() {
  return <TableCell className="bg-accent">{null}</TableCell>;
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
        <NullTableCell />
        <NullTableCell />
        <NullTableCell />
        <NullTableCell />
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
      <TableCell>
        {((monthlyAmount / monthlyIncome) * 100).toFixed(0)}%
      </TableCell>
      <TableCell>${monthlyAmount.toFixed(0)}</TableCell>
      <TableCell>{((yearlyAmount / yearlyIncome) * 100).toFixed(0)}%</TableCell>
      <TableCell>${yearlyAmount.toFixed(0)}</TableCell>
    </>
  );
}

import { DocumentData } from "firebase/firestore";

import "../globals.css";

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

function TableCell(props: { children: React.ReactNode }) {
  return (
    <td className="border-collapse border border-black">{props.children}</td>
  );
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
        <TableCell>{NULL_VALUE}</TableCell>
        <TableCell>{NULL_VALUE}</TableCell>
        <TableCell>{NULL_VALUE}</TableCell>
        <TableCell>{NULL_VALUE}</TableCell>
      </>
    );

  const monthlyAmount = data.time === "month" ? data.amount : data.amount / 6;
  const yearlyAmount = data.time === "month" ? data.amount * 6 : data.amount;

  let monthlyTakeHome: number;
  let yearlyTakeHome: number;

  if (props.isPreTax) {
    yearlyTakeHome = calculateGross(props.person);
    monthlyTakeHome = yearlyTakeHome / 6;
  } else {
    monthlyTakeHome = calculateMonthlyTakeHome(props.person);
    yearlyTakeHome = calculateYearlyTakeHome(props.person);
  }

  return (
    <>
      <TableCell>
        {((monthlyAmount / monthlyTakeHome) * 100).toFixed(0)}%
      </TableCell>
      <TableCell>${monthlyAmount.toFixed(0)}</TableCell>
      <TableCell>
        {((yearlyAmount / yearlyTakeHome) * 100).toFixed(0)}%
      </TableCell>
      <TableCell>${yearlyAmount.toFixed(0)}</TableCell>
    </>
  );
}

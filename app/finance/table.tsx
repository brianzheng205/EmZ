// import { DocumentData } from "firebase/firestore";

// import "../globals.css";
// import EditableCell from "./EditableCell";
// export function calculateGross(person): number {
//   let gross = 0;
//   if (person?.preTax?.["Gross Base"]) {
//     gross += person.preTax["Gross Base"].amount;
//   }
//   if (person?.preTax?.["Gross Stipend"]) {
//     gross += person.preTax["Gross Stipend"].amount;
//   }
//   if (person?.preTax?.["Gross Bonus"]) {
//     gross += person.preTax["Gross Bonus"].amount;
//   }
//   return gross;
// }
// function calculateMonthlyTakeHome(person: DocumentData) {
//   let takeHome = 0;
//   if (person?.preTax?.["Gross Base"]) {
//     takeHome += person.preTax["Gross Base"].amount;
//   }

//   takeHome = removeDeductions(person);
//   takeHome = taxBracketDeductions(takeHome);

//   return takeHome / 12;
// }

// // TODO
// function calculateYearlyTakeHome(person: DocumentData) {
//   let takeHome = 0;
//   if (person?.preTax?.["Gross Base"]) {
//     takeHome += person.preTax["Gross Base"].amount;
//   }

//   if (person?.preTax?.["Gross Stipend"]) {
//     takeHome += person.preTax["Gross Stipend"].amount;
//   }

//   takeHome = removeDeductions(person);
//   takeHome = taxBracketDeductions(takeHome);

//   if (person?.preTax?.["Gross Bonus"]) {
//     takeHome += person.preTax["Gross Bonus"].amount * 0.88;
//   }

//   return takeHome;
// }

// function removeDeductions(person: DocumentData): number {
//   return 0;
// }

// // TODO
// function taxBracketDeductions(amount: number): number {
//   return amount;
// }
// export default function PostTax(props: {
//   category: string;
//   person: DocumentData;
// }) {
//   return (
//     <>
//       <td className="border-collapse border border-black">
//         {(
//           (props.person?.postTax?.[props.category]
//             ? props.person.postTax[props.category].time === "month"
//               ? props.person.postTax[props.category].amount /
//                 calculateMonthlyTakeHome(props.person)
//               : props.person.postTax[props.category].amount /
//                 6 /
//                 calculateMonthlyTakeHome(props.person)
//             : 0) * 100
//         ).toFixed(0)}
//         %
//       </td>
//       <td className="border-collapse border border-black">
//         $
//         {props.person?.postTax?.[props.category]
//           ? props.person.postTax[props.category].time === "month"
//             ? props.person.postTax[props.category].amount.toFixed(0)
//             : (props.person.postTax[props.category].amount / 6).toFixed(0)
//           : 0}
//       </td>
//       <td className="border-collapse border border-black">
//         {" "}
//         {(
//           (props.person?.postTax?.[props.category]
//             ? props.person.postTax[props.category].time === "month"
//               ? (props.person.postTax[props.category].amount * 6) /
//                 calculateYearlyTakeHome(props.person)
//               : props.person.postTax[props.category].amount /
//                 calculateYearlyTakeHome(props.person)
//             : 0) * 100
//         ).toFixed(0)}
//         %
//       </td>
//       <td className="border-collapse border border-black">
//         $
//         {props.person?.postTax?.[props.category]
//           ? props.person.postTax[props.category].time === "month"
//             ? (props.person.postTax[props.category].amount * 6).toFixed(0)
//             : props.person.postTax[props.category].amount.toFixed(0)
//           : 0}
//       </td>
//     </>
//   );
// }

// export function PreTax(props: { category: string; person: DocumentData }) {
//   return (
//     <>
//       <td className="border-collapse border border-black">
//         {(
//           (props.person?.preTax?.[props.category]
//             ? props.person.preTax[props.category].time === "month"
//               ? props.person.preTax[props.category].amount /
//                 (calculateGross(props.person) / 6)
//               : props.person.preTax[props.category].amount /
//                 calculateGross(props.person)
//             : 0) * 100
//         ).toFixed(0)}
//         %
//       </td>
//       <td className="border-collapse border border-black">
//         $
//         {props.person?.preTax?.[props.category]
//           ? props.person.preTax[props.category].time === "month"
//             ? props.person.preTax[props.category].amount.toFixed(0)
//             : (props.person.preTax[props.category].amount / 6).toFixed(0)
//           : 0}
//       </td>
//       <td className="border-collapse border border-black">
//         {(
//           (props.person?.preTax?.[props.category]
//             ? props.person.preTax[props.category].time === "month"
//               ? (props.person.preTax[props.category].amount * 6) /
//                 calculateGross(props.person)
//               : props.person.preTax[props.category].amount /
//                 calculateGross(props.person)
//             : 0) * 100
//         ).toFixed(0)}
//         %
//       </td>
//       <td className="border-collapse border border-black">
//         $
//         {props.person?.preTax?.[props.category]
//           ? props.person.preTax[props.category].time === "month"
//             ? (props.person.preTax[props.category].amount * 6).toFixed(0)
//             : props.person.preTax[props.category].amount.toFixed(0)
//           : 0}
//       </td>
//     </>
//   );
// }

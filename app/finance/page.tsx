// "use client";

// import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
// import { useEffect, useState } from "react";

// import app from "../../firebase/client";

// TODO: Get rid of the math.max thing after 2025
// const fetchData = async () => {
//   const db = getFirestore(app);
//   const docRef = doc(
//     db,
//     "activeBudgets",
//     Math.max(new Date().getFullYear(), 2025).toString()
//   );
//   const docSnap = await getDoc(docRef);
//   return docSnap.data() as DocumentData;
// };

// const fetchBudgets = async (path: string) => {
//   if (path === undefined || path.length === 0) {
//     return {};
//   }
//   const db = getFirestore(app);
//   const docRef = doc(db, path);
//   const docSnap = await getDoc(docRef);
//   return docSnap.data() as DocumentData;
// };

// const fetchTaxBrackets = async (path: string) => {
//   if (path === undefined || path.length === 0) {
//     return {};
//   }
//   const db = getFirestore(app);
//   const docRef = doc(db, path);
//   const docSnap = await getDoc(docRef);
//   return docSnap.data() as DocumentData;
// };

// import "../globals.css";
// import EditableCell from "./EditableCell";
// import PostTax, { PreTax, calculateGross } from "./table";

export default function Finance() {
  // const headers = [
  //   "Monthly Em (%)",
  //   "Monthly Em ($)",
  //   "Yearly Em (%)",
  //   "Yearly Em ($)",
  //   "Monthly Z (%)",
  //   "Monthly Z ($)",
  //   "Yearly Z (%)",
  //   "Yearly Z ($)",
  // ];

  // const [emilyBudgetPath, setEmilyBudgetPath] = useState<string[]>([]);
  // const [brianBudgetPath, setBrianBudgetPath] = useState<string[]>([]);
  // const [emilyBudget, setEmilyBudget] = useState<DocumentData>({});
  // const [brianBudget, setBrianBudget] = useState<DocumentData>({});

  // useEffect(() => {
  //   fetchData().then((document) => {
  //     setEmilyBudgetPath(
  //       document?.emily?._key.path.segments.slice(
  //         document?.emily?._key.path.offset
  //       )
  //     );
  //     setBrianBudgetPath(
  //       document?.brian?._key.path.segments.slice(
  //         document?.brian?._key.path.offset
  //       )
  //     );
  //   });
  // }, []);

  // useEffect(() => {
  //   fetchBudgets(emilyBudgetPath?.join("/")).then((document) => {
  //     setEmilyBudget(document);
  //   });
  // }, [emilyBudgetPath]);

  // useEffect(() => {
  //   fetchBudgets(brianBudgetPath?.join("/")).then((document) => {
  //     setBrianBudget(document);
  //   });
  // }, [brianBudgetPath]);

  // const posttax = new Set([
  //   ...Object.keys(emilyBudget?.postTax || {}),
  //   ...Object.keys(brianBudget?.postTax || {}),
  // ]);

  // const pretax = new Set([
  //   ...Object.keys(emilyBudget?.preTax || {}),
  //   ...Object.keys(brianBudget?.preTax || {}),
  // ]);

  return <></>;

  // return (
  //   <div>
  //     <table className="border-collapse border border-black">
  //       <thead>
  //         <tr>
  //           <th></th>
  //           <th className="border-collapse border border-black">Category</th>
  //           {headers.map((header, index) => (
  //             <th
  //               className="border-collapse border border-black"
  //               key={`header-${index}`}
  //             >
  //               {header}
  //             </th>
  //           ))}
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {[...posttax].map((category, index) => (
  //           <tr
  //             key={`post-tax-${index}`}
  //             className="border-collapse border border-black"
  //           >
  //             {index === 0 && (
  //               <td
  //                 className="border-collapse border border-black"
  //                 rowSpan={posttax.size}
  //               >
  //                 Post-Tax
  //               </td>
  //             )}
  //             <td className="border-collapse border border-black">
  //               {category}
  //             </td>
  //             <PostTax category={category} person={emilyBudget} />
  //             <PostTax category={category} person={brianBudget} />
  //           </tr>
  //         ))}
  //         {[...pretax].map((category, index) => (
  //           <tr
  //             key={`pre-tax-${index}`}
  //             className="border-collapse border border-black"
  //           >
  //             {index === 0 && (
  //               <td
  //                 className="border-collapse border border-black"
  //                 rowSpan={pretax.size + 1}
  //               >
  //                 Pre-Tax
  //               </td>
  //             )}
  //             <td className="border-collapse border border-black">
  //               {category}
  //             </td>
  //             <PreTax category={category} person={emilyBudget} />
  //             <PreTax category={category} person={brianBudget} />
  //           </tr>
  //         ))}
  //         <tr>
  //           <td className="border-collapse border border-black">Gross</td>{" "}
  //           <td className="border-collapse border border-black">100%</td>
  //           <td className="border-collapse border border-black">
  //             ${(calculateGross(emilyBudget) / 6).toFixed(0)}
  //           </td>
  //           <td className="border-collapse border border-black">100%</td>
  //           <td className="border-collapse border border-black">
  //             ${calculateGross(emilyBudget)}
  //           </td>
  //         </tr>
  //       </tbody>
  //     </table>
  //   </div>
  // );
}

// import { useState } from "react";
// import "../globals.css";
// export default function EditableCell({ children }) {
//   const [value, setValue] = useState(children);
//   const [isEditing, setIsEditing] = useState(false);

//   return (
//     <td
//       className="border-collapse border border-black"
//       onDoubleClick={() => setIsEditing(true)}
//     >
//       {isEditing ? (
//         <input
//           type="text"
//           value={value as string}
//           onChange={(e) => setValue(e.target.value)}
//           onBlur={() => setIsEditing(false)}
//           onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
//           autoFocus
//         />
//       ) : (
//         value
//       )}
//     </td>
//   );
// }

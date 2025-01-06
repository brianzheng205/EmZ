import { useState, useEffect } from "react";
import { DocumentData } from "firebase/firestore";

import styles from "./styles";
import "../globals.css";

function formatValue(value?: number) {
  return value !== undefined ? Number(value.toFixed(0)) : 0;
}

export default function EditableCell(props: {
  initialValue?: number;
  updateFunction: (amount: number) => void;
}) {
  const [value, setValue] = useState<number>(formatValue(props.initialValue));
  const [isEmpty, setIsEmpty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(formatValue(props.initialValue));
    setIsEmpty(false);
  }, [props.initialValue]);

  return (
    <td
      className={`${styles.cell} border-collapse border border-black bg-accent cursor-pointer relative`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className="w-full h-full box-border bg-accent outline-none absolute inset-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          inputMode="numeric"
          value={isEmpty ? "" : value}
          onChange={(e) => {
            if (e.target.value === "") {
              setIsEmpty(true);
              setValue(0);
            } else {
              setIsEmpty(false);
              setValue(+e.target.value);
            }
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "." || e.key === ",") {
              e.preventDefault();
            }
            if (e.key === "Enter") {
              setIsEditing(false);
              props.updateFunction(value);
            }
          }}
          onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
          autoFocus
        />
      ) : (
        <div>{`$${value.toFixed(0)}`}</div>
      )}
    </td>
  );
}

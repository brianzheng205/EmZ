import { useState, useEffect } from "react";
import { styles } from "./styles";
import "../globals.css";

function formatValue(value?: number) {
  return value !== undefined ? Number(value.toFixed(0)) : 0;
}

export default function EditableCell(props: { initialValue?: number }) {
  const [value, setValue] = useState(formatValue(props.initialValue));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(formatValue(props.initialValue));
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
          value={value}
          onChange={(e) => setValue(formatValue(+e.target.value))}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
          autoFocus
        />
      ) : (
        <div>${value.toFixed(0)}</div>
      )}
    </td>
  );
}

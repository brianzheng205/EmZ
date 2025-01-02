import { useState, useEffect } from "react";

import "../globals.css";

function formatValue(value?: number) {
  return value !== undefined ? Number(value.toFixed(2)) : 0;
}

export default function EditableCell(props: { initialValue?: number }) {
  const [value, setValue] = useState(formatValue(props.initialValue));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(formatValue(props.initialValue));
  }, [props.initialValue]);

  return (
    <td
      className="border-collapse border border-black bg-accent"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className="w-full h-full"
          type="number"
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          autoFocus
        />
      ) : (
        `$${value.toFixed(0)}`
      )}
    </td>
  );
}

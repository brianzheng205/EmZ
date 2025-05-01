import { useState, useEffect } from "react";

// import "../globals.css";
// import styles from "./styles";

function formatValue(value?: number) {
  return value !== undefined ? Number(value.toFixed(0)) : 0;
}

export default function EditableCell(props: {
  initialValue?: number;
  // eslint-disable-next-line no-unused-vars
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
      className={`border-collapse border border-black bg-accent cursor-pointer relative`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          id="editable-cell"
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
          onBlur={() => {
            setIsEditing(false);
            props.updateFunction(value);
          }}
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

export function EditableTextCell(props: {
  initialValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFunction: any;
  children?: React.ReactNode;
  tdProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
}) {
  const [value, setValue] = useState<string>(props.initialValue || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(props.initialValue || "");
  }, [props.initialValue]);
  return (
    <td
      {...props.tdProps}
      className={`${
        false && "styles.cell"
      } border-collapse border border-black bg-accent cursor-pointer relative ${
        props.tdProps?.className || ""
      }`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          id="editable-text-cell"
          className="w-full h-full box-border bg-accent outline-none absolute inset-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="text"
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
          onBlur={() => {
            setIsEditing(false);
            props.updateFunction(props.initialValue, value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              props.updateFunction(props.initialValue, value);
            }
          }}
          onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
          autoFocus
        />
      ) : (
        <div>{value}</div>
      )}
      {props.children}
    </td>
  );
}

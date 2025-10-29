import { FormControl, InputLabel, Select, SelectProps } from "@mui/material";
import { PropsWithChildren } from "react";

type SelectWrapperProps = PropsWithChildren<SelectProps> & {
  id: string;
  label: string;
};

export default function SelectWrapper({
  id,
  label,
  children,
  ...props
}: SelectWrapperProps) {
  const labelId = `${id}-label`;

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} id={id} label={label} {...props}>
        {children}
      </Select>
    </FormControl>
  );
}

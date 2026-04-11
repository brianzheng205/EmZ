import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  SelectProps,
} from "@mui/material";
import { PropsWithChildren } from "react";

type SelectWrapperProps = PropsWithChildren<SelectProps> & {
  id: string;
  label: string;
  helperText?: string;
};

export default function SelectWrapper({
  id,
  label,
  children,
  helperText,
  ...props
}: SelectWrapperProps) {
  const labelId = `${id}-label`;

  return (
    <FormControl fullWidth required={props.required}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} id={id} label={label} {...props}>
        {children}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

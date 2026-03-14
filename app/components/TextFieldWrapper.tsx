import { TextField, TextFieldProps } from "@mui/material";
import { KeyboardEvent, PropsWithChildren } from "react";

type TextFieldWrapperProps = PropsWithChildren<TextFieldProps> & {
  handleSubmit: () => void;
};

export const TextFieldWrapper = ({
  children,
  handleSubmit,
  ...props
}: TextFieldWrapperProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <TextField {...props} onKeyDown={handleKeyDown}>
      {children}
    </TextField>
  );
};

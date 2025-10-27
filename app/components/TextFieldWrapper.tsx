import { TextField, TextFieldProps } from "@mui/material";

type TextFieldWrapperProps = React.PropsWithChildren<TextFieldProps> & {
  handleSubmit: () => void;
};

export const TextFieldWrapper = ({
  children,
  handleSubmit,
  ...props
}: TextFieldWrapperProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <TextField {...props} onKeyDown={handleKeyDown} onBlur={handleSubmit}>
      {children}
    </TextField>
  );
};

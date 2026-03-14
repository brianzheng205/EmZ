import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
} from "@mui/material";
import { Theme } from "@mui/system";

interface DialogWrapperProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitText?: string;
  disabled: boolean;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

export default function DialogWrapper({
  open,
  onClose,
  onSubmit,
  title,
  submitText,
  disabled,
  children,
  sx,
  contentSx,
}: DialogWrapperProps) {
  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !disabled) {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      sx={sx}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflow: "visible",
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={disabled}>
          {submitText || "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
  disabled,
  children,
  sx,
  contentSx,
}: DialogWrapperProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !disabled) {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} sx={sx} onKeyDown={handleKeyDown}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={contentSx}>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={disabled}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

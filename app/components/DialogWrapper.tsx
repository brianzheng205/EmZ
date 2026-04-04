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
  submitColor?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
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
  submitColor = "primary",
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

      <DialogActions sx={{ padding: 2, gap: 1, "& > :not(:first-of-type)": { ml: "0 !important" } }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          sx={{ 
            borderRadius: 2,
            bgcolor: "grey.300",
            color: "text.primary",
            "&:hover": {
              bgcolor: "grey.400",
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={disabled} 
          color={submitColor}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          {submitText || "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

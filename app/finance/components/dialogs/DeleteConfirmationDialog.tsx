import { Typography } from "@mui/material";
import DialogWrapper from "@/components/DialogWrapper";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationDialogProps) {
  return (
    <DialogWrapper
      title={title}
      submitText="Delete"
      submitColor="error"
      open={open}
      onClose={onClose}
      onSubmit={onConfirm}
      disabled={false}
    >
      <Typography>{message}</Typography>
    </DialogWrapper>
  );
}

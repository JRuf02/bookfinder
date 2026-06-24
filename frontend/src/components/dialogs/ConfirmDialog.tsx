import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type ConfirmDialogProps = {
  title: string;
  text: string;
  open: boolean;
  onYes: () => void;
  onNo: () => void;
};

/** Simple confirmation popup with 'yes' and 'no' buttons. */
export default function ConfirmDialog({
  title,
  text,
  open,
  onYes,
  onNo,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      role="alertdialog"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNo} autoFocus>
          No
        </Button>
        <Button onClick={onYes}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

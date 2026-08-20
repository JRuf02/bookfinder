import Alert from "@mui/material/Alert/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type ErrorDialogProps = {
  title: string;
  text: string;
  open: boolean;
  onClose: () => void;
};

/** Simple error popup. */
export default function ErrorDialog({
  title,
  text,
  open,
  onClose,
}: ErrorDialogProps) {
  return (
    <Dialog
      open={open}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      role="alertdialog"
    >
      <DialogTitle id="error-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="error-dialog-description" component="div">
          <Alert variant="standard" severity="info" color="warning">
            {text}
          </Alert>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

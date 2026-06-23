import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

type CancelDialogProps = {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
};

// TODO: Use better suited mui dialog, no list needed, just two buttons at the bottom ('Alert dialog') https://mui.com/material-ui/react-dialog
export default function CancelDialog({ open, onYes, onNo }: CancelDialogProps) {
  return (
    <Dialog open={open}>
      <DialogTitle>
        Discard all scanned books without inserting or taking them from a shelf?
      </DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem disablePadding key="yes">
          <ListItemButton onClick={() => onYes()}>
            <ListItemText primary={"Yes"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="no">
          <ListItemButton onClick={() => onNo()}>
            <ListItemText primary={"No"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  );
}

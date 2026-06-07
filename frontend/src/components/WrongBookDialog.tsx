import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";

type WrongBookDialogProps = {
  open: boolean;
  onTryAgain: () => void;
  onManuallyAdd: () => void;
  onDontAdd: () => void;
};

export default function WrongBookDialog({
  open,
  onTryAgain,
  onManuallyAdd,
  onDontAdd,
}: WrongBookDialogProps) {
  return (
    <Dialog open={open}>
      <List sx={{ pt: 0 }}>
        <ListItem disablePadding key="try-again">
          <ListItemButton onClick={() => onTryAgain()}>
            <ListItemText primary="Try Again" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="manually-add">
          <ListItemButton onClick={() => onManuallyAdd()}>
            <ListItemText primary="Manually Add" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="dont-add">
          <ListItemButton onClick={() => onDontAdd()}>
            <ListItemText primary="Don't Add" />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  );
}

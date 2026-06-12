import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Book } from "../../types/Book";

type ManualInsertDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (book: Book) => void;
};

export default function ManualInsertDialog({
  open,
  onClose,
  onSubmit,
}: ManualInsertDialogProps) {
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const book: Book = {
      isbn: formJson.isbn,
      title: formJson.title,
      author: formJson.author,
      dnbId: "", // TODO: Make optional or try fetching from backend using ISBN
      coverUrl: undefined,
    };
    onSubmit(book);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Unknown Book</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter the book details here.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="subscription-form">
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="isbn"
            label="ISBN"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="author"
            label="Author"
            type="text"
            fullWidth
            variant="standard"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="subscription-form">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

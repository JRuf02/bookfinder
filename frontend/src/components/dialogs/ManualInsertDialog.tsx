import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import * as React from "react";

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
    const formJson = Object.fromEntries(formData.entries()) as {
      isbn: string;
      title: string;
      author: string;
    };
    const book: Book = {
      isbn: formJson.isbn,
      title: formJson.title,
      author: formJson.author,
      dnbId: "",
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
        <form
          onSubmit={handleSubmit}
          id="subscription-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          <TextField
            autoFocus
            required
            margin="dense"
            id="isbn"
            name="isbn"
            label="ISBN"
            placeholder="978-1-4447-2072-3"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            id="title"
            name="title"
            label="Title"
            placeholder="The Shining"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            id="author"
            name="author"
            label="Author"
            placeholder="King, Stephen"
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

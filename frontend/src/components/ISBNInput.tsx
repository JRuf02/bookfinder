import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import Stack from "@mui/material/Stack";

type ISBNInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ISBNInput({
  value,
  onChange,
  onSubmit,
}: ISBNInputProps) {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Enter ISBN manually"
          value={value}
          onChange={onChange}
        />
        <button type="submit" className="lookup-button">
          Lookup
        </button>
      </form>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<DeleteIcon />}>
          Delete
        </Button>
        <Button variant="outlined" endIcon={<SendIcon />}>
          Lookup
        </Button>
      </Stack>
    </div>
  );
}

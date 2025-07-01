import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

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
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Enter ISBN manually"
        value={value}
        onChange={onChange}
      />
      <Button
        className="lookup-button" // custom css will currently still be overwritten by mui!
        type="submit"
        variant="outlined"
        size="small"
        endIcon={<SendIcon />}
      >
        Lookup
      </Button>
    </form>
  );
}

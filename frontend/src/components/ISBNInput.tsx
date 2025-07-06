import { TextField, Button, Box } from "@mui/material";
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
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Enter ISBN manually"
        value={value}
        onChange={onChange}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(255, 255, 255, 0.9)",
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        size="medium"
        endIcon={<SendIcon />}
      >
        Lookup
      </Button>
    </Box>
  );
}

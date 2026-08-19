import SendIcon from "@mui/icons-material/Send";
import { Box, Button, TextField } from "@mui/material";

type TextInputProps = {
  placeholder?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitDisabled?: boolean;
  submitEndIcon?: React.ReactNode;
};

// More mui styling options for the input text field: https://mui.com/material-ui/react-text-field/
export default function TextInput({
  placeholder = "Enter ISBN manually",
  label = "Enter ISBN manually",
  value,
  onChange,
  onSubmit,
  submitDisabled = false,
  submitEndIcon,
}: TextInputProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 1,
        mt: 0.5,
        mb: 0.5,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        label={label}
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
        disabled={submitDisabled}
        endIcon={submitEndIcon ?? <SendIcon />}
      >
        Search
      </Button>
    </Box>
  );
}

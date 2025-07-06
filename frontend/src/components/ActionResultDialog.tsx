import { Alert, Box } from "@mui/material";

type Props = {
  message: string;
};

export default function ActionResultDialog({ message }: Props) {
  const isSuccess = message.includes("success") || message.startsWith("✔️");

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
      <Alert severity={isSuccess ? "success" : "error"}>{message}</Alert>
    </Box>
  );
}

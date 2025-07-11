import { Alert, Box } from "@mui/material";

type Props = {
  result: {
    success: boolean;
    message: string;
  } | null;
};

export default function ActionResultAlert({ result }: Props) {
  const isSuccess = result ? result.success : false;

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
      <Alert severity={isSuccess ? "success" : "error"}>
        {result ? result.message : "Unknown Error"}
      </Alert>
    </Box>
  );
}

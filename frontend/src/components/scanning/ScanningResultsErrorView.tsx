import { Box, Button, Stack, Typography } from "@mui/material";

type ScanningResultsErrorViewProps = {
  errorMessage: string | null;
  onRetry: () => void;
  onCancel: () => void;
  onManuallyAdd: () => void;
};

export default function ScanningResultsErrorView({
  errorMessage,
  onRetry,
  onCancel,
  onManuallyAdd,
}: ScanningResultsErrorViewProps) {
  return (
    <Box sx={{ mt: "2rem", textAlign: "center" }}>
      {errorMessage != "No ISBNs scanned" ? (
        <Typography variant="h6" color="error">
          Error fetching book data
        </Typography>
      ) : null}

      <Typography variant="body1" color="text.secondary">
        {errorMessage}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: "1.5rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            mt: "1rem",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{
            mt: "1rem",
          }}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          onClick={onManuallyAdd}
          sx={{
            mt: "1rem",
          }}
        >
          Add manually
        </Button>
      </Stack>
    </Box>
  );
}

import { Alert, Box, Card, CardContent } from "@mui/material";

import { CatalogResult } from "../../types/CatalogResult";
import ResultCardContent from "./ResultCardContent";

type ResultsListProps = {
  results: CatalogResult[];
};

/** Renders a list of catalog results */
export default function ResultsList({ results }: ResultsListProps) {
  return (
    <Box className="results-list">
      {results.map((result) => (
        <Card key={result.entityId} sx={{ mb: 2 }}>
          <CardContent>
            <ResultCardContent result={result} />
          </CardContent>
        </Card>
      ))}
      {results.length === 0 && (
        <Alert
          severity="info"
          color="success"
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
          }}
        >
          No results.
        </Alert>
      )}
    </Box>
  );
}

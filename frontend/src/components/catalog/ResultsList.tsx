import { Box, Card, CardContent, Typography } from "@mui/material";

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
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          No results yet. Search for a book title!
        </Typography>
      )}
    </Box>
  );
}

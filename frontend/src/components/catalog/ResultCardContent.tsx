import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LanguageIcon from "@mui/icons-material/Language";
import NavigationIcon from "@mui/icons-material/Navigation";
import { Box, Button, CardMedia, Stack, Typography } from "@mui/material";

import logo from "../../../graphics/logo-long-no-bg.png";
import { CatalogResult } from "../../types/CatalogResult";
// import ResultMetadataTable from "./ResultMetadataTable"; TODO

type ResultCardContentProps = {
  result: CatalogResult;
};

/** Renders a single catalog result (one book instance) */
export default function ResultCardContent({ result }: ResultCardContentProps) {
  const website = result.locatedShelf?.shelf.website;
  const osmId = result.locatedShelf?.shelf.osmId;

  const websiteHref = website ?? osmId ?? "";
  const hasWebsite = !!(website || osmId);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Stack direction="column" spacing={0.5} alignItems="center">
        <CardMedia
          component="img"
          image={
            result.book.isbn
              ? `/api/cover?isbn=${result.book.isbn}&size=m`
              : logo
          }
          alt={`Cover of ${result.book.title}`}
          sx={{
            width: 80,
            height: 120,
            objectFit: "cover",
            border: "1px solid #ddd",
            borderRadius: 1,
            mr: 2,
          }}
          onError={(e) => {
            // Fallback image if cover not available
            // TODO: Create a better image for missing covers
            (e.target as HTMLImageElement).src = logo;
          }}
        />

        <Button
          startIcon={<AddShoppingCartIcon />}
          variant="outlined"
          onClick={() => alert("TODO")}
        >
          Take out
        </Button>

        <Button
          startIcon={<LanguageIcon />}
          variant="outlined"
          href={websiteHref}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!hasWebsite}
          onClick={(e) => !hasWebsite && e.preventDefault()}
        >
          Website
        </Button>

        <Button
          startIcon={<NavigationIcon />}
          variant="outlined"
          href={osmId ?? ""}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!osmId}
          onClick={(e) => !osmId && e.preventDefault()}
        >
          Navigate
        </Button>
      </Stack>
      <Box>
        <Typography variant="h6">{result.book.title}</Typography>
        {result.book.author?.trim() && (
          <Typography variant="body2" color="text.secondary">
            by {result.book.author}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {result.book.isbn || "ISBN unknown"}
        </Typography>

        {result.locatedShelf?.shelf.name?.trim() && (
          <Typography variant="body2">
            Shelf: {result.locatedShelf?.shelf.name}
          </Typography>
        )}
        {result.locatedShelf?.distanceMeters && (
          <Typography variant="body2">
            Distance: {result.locatedShelf.distanceMeters.toFixed(2)} m
          </Typography>
        )}
        {result.locatedShelf?.shelf.type && (
          <Typography variant="body2">
            Type: {result.locatedShelf.shelf.type}
          </Typography>
        )}
        {result.locatedShelf?.shelf.address && (
          <Typography variant="body2">
            Address: {result.locatedShelf.shelf.address}
          </Typography>
        )}
        {result.locatedShelf?.shelf.operator && (
          <Typography variant="body2">
            Operator: {result.locatedShelf.shelf.operator}
          </Typography>
        )}
        {result.locatedShelf?.shelf.openingHours && (
          <Typography variant="body2">
            Opening Hours: {result.locatedShelf.shelf.openingHours}
          </Typography>
        )}
        {result.locatedShelf?.shelf.website && (
          <Typography variant="body2">
            Website: {result.locatedShelf.shelf.website}
          </Typography>
        )}
        {result.locatedShelf?.shelf.osmId && (
          <Typography variant="body2">
            Shelf ID: {result.locatedShelf.shelf.osmId}
          </Typography>
        )}
        {result.locatedShelf && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Shelf information last updated:{" "}
            {result.locatedShelf.shelf.osmCheckDate ||
              result.locatedShelf.shelf.osmLastUpdated}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          In shelf since: {result.inShelfSince}
        </Typography>
      </Box>
    </Stack>
  );
}

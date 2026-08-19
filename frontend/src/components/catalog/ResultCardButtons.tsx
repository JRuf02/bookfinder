import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LanguageIcon from "@mui/icons-material/Language";
import NavigationIcon from "@mui/icons-material/Navigation";
import PlaceIcon from "@mui/icons-material/Place";
import { Button, Stack } from "@mui/material";

import { CatalogResult } from "../../types/CatalogResult";

type ResultCardButtonsProps = {
  result: CatalogResult;
  removedFromShelf: boolean;
  onRemoveFromShelf: () => void;
};

/** Renders take out, website, location, and navigate buttons for a catalog result */
export default function ResultCardButtons({
  result,
  removedFromShelf,
  onRemoveFromShelf,
}: ResultCardButtonsProps) {
  const website = result.locatedShelf?.shelf.website;
  const osmId = result.locatedShelf?.shelf.osmId;
  const navigationURL =
    result.locatedShelf?.shelf.latitude && result.locatedShelf?.shelf.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${result.locatedShelf?.shelf.latitude},${result.locatedShelf?.shelf.longitude}`
      : undefined;

  return (
    <Stack direction="column" spacing={0.5} alignItems="center">
      <Button
        startIcon={<AddShoppingCartIcon />}
        variant="outlined"
        onClick={onRemoveFromShelf}
        disabled={removedFromShelf}
        fullWidth
      >
        {removedFromShelf ? "Removed" : "Take out"}
      </Button>
      {website && (
        <Button
          startIcon={<LanguageIcon />}
          variant="outlined"
          href={website ?? ""}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!website}
          onClick={(e) => !website && e.preventDefault()}
          fullWidth
        >
          Website
        </Button>
      )}
      <Button
        startIcon={<PlaceIcon />}
        variant="outlined"
        href={osmId ?? ""}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!osmId}
        onClick={(e) => !osmId && e.preventDefault()}
        fullWidth
      >
        Location
      </Button>
      <Button
        startIcon={<NavigationIcon />}
        variant="outlined"
        href={navigationURL ?? ""}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!navigationURL}
        onClick={(e) => !navigationURL && e.preventDefault()}
        fullWidth
      >
        Navigate
      </Button>
    </Stack>
  );
}

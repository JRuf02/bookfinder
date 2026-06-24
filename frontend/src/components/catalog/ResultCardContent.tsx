import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LanguageIcon from "@mui/icons-material/Language";
import NavigationIcon from "@mui/icons-material/Navigation";
import PlaceIcon from "@mui/icons-material/Place";
import { Box, Button, CardMedia, Stack, Typography } from "@mui/material";
import { useState } from "react";
import Moment from "react-moment";

import logo from "../../../graphics/logo-long-no-bg.png";
import { shelfAction } from "../../services/api/shelfActions";
import { removeOsmIdPrefix } from "../../services/prefix";
import { CatalogResult } from "../../types/CatalogResult";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ErrorDialog from "../dialogs/ErrorDialog";

type RemoveError = {
  title: string;
  text: string;
};

type ResultCardContentProps = {
  result: CatalogResult;
};

/** Renders a single catalog result (one book instance) */
export default function ResultCardContent({ result }: ResultCardContentProps) {
  const website = result.locatedShelf?.shelf.website;
  const osmId = result.locatedShelf?.shelf.osmId;
  const navigationURL =
    result.locatedShelf?.shelf.latitude && result.locatedShelf?.shelf.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${result.locatedShelf?.shelf.latitude},${result.locatedShelf?.shelf.longitude}`
      : undefined;

  const [removedFromShelf, setRemovedFromShelf] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeError, setRemoveError] = useState<RemoveError | null>(null);

  const attributeMarginBottom = 0.9;
  const attributeLineHeight = "1em";

  const onRemoveFromShelf = async () => {
    setRemoveDialogOpen(true);
  };

  const removeFromShelf = async () => {
    if (!result.locatedShelf?.shelf.osmId || !result.book.isbn) {
      console.error("Cannot remove book from shelf: missing osmId or isbn");
      setRemoveError({
        title: "Cannot remove book from shelf",
        text: "Please remove the book by scanning its barcode.",
      });
      return;
    }
    const answer = await shelfAction(
      "remove",
      result.locatedShelf?.shelf.osmId,
      result.book.isbn,
    );
    if (answer.success) {
      setRemovedFromShelf(true);
    } else {
      console.error("Error removing book from shelf:", answer.message);
      setRemoveError({
        title: "Error removing book from shelf",
        text: answer.message,
      });
    }
  };

  // TODO: Unify button widths, e.g. using full-width
  return (
    <>
      <Stack direction="row" spacing={2} alignItems="stretch">
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
          <div style={{ height: 1 }}></div>
          <Button
            startIcon={<AddShoppingCartIcon />}
            variant="outlined"
            onClick={onRemoveFromShelf}
            disabled={removedFromShelf}
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
          >
            Navigate
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flexGrow: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: "1.2em", pb: 0.5 }}>
              {result.book.title}
            </Typography>
            {result.book.author?.trim() && (
              <Typography variant="body2" color="text.secondary">
                by {result.book.author}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {result.book.isbn || "ISBN unknown"}
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }}>
            {result.locatedShelf?.shelf.name?.trim() && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Shelf: {result.locatedShelf?.shelf.name}
              </Typography>
            )}
            {result.locatedShelf?.distanceMeters && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Distance: {result.locatedShelf.distanceMeters.toFixed(2)} m
              </Typography>
            )}
            {result.locatedShelf?.shelf.type && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Type: {result.locatedShelf.shelf.type.replaceAll("_", " ")}
              </Typography>
            )}
            {result.locatedShelf?.shelf.address && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Address: {result.locatedShelf.shelf.address}
              </Typography>
            )}
            {result.locatedShelf?.shelf.operator && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Operator: {result.locatedShelf.shelf.operator}
              </Typography>
            )}
            {result.locatedShelf?.shelf.openingHours && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Opening Hours: {result.locatedShelf.shelf.openingHours}
              </Typography>
            )}
            {result.locatedShelf?.shelf.osmId && (
              <Typography
                variant="body2"
                sx={{
                  mb: attributeMarginBottom,
                  lineHeight: attributeLineHeight,
                }}
              >
                Shelf ID: {removeOsmIdPrefix(result.locatedShelf.shelf.osmId)}
              </Typography>
            )}
          </div>
          <Typography variant="body2" color="text.secondary" align="right">
            added <Moment fromNow>{result.inShelfSince}</Moment>
          </Typography>
        </Box>
      </Stack>

      <ConfirmDialog
        title="Remove book from shelf?"
        text="Take this book from the shelf?"
        open={removeDialogOpen}
        onYes={() => {
          removeFromShelf();
          setRemoveDialogOpen(false);
        }}
        onNo={() => {
          setRemoveDialogOpen(false);
        }}
      />
      <ErrorDialog
        title={removeError?.title ?? "Error removing book from shelf"}
        text={
          removeError?.text ??
          "An error occurred while removing the book from the shelf."
        }
        open={!!removeError}
        onClose={() => {
          setRemoveError(null);
        }}
      />
    </>
  );
}

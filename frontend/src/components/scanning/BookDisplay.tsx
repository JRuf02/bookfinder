import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { Book } from "../../types/Book";
import PopularityChips from "../catalog/PopularityChips";

type BookDisplayProps = {
  book: Book;
  isbn: string;
  onScanMore: () => void;
  onWrongBook: () => void;
};

export default function BookDisplay({
  book,
  isbn,
  onScanMore,
  onWrongBook,
}: BookDisplayProps) {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Use relative URL to ensure protocol matching (HTTP or HTTPS)
    // TODO: Consider caching cover images on backend or using book.coverUrl
    setCoverUrl(`/api/cover?isbn=${book.isbn}&size=l`);
    setImageError(false);
  }, [book.isbn]);

  const handleImageError = () => {
    setImageError(true);
  };

  // TODO: Move styling to global CSS file or MUI theme file
  return (
    <Card
      sx={{
        maxWidth: 400,
        textAlign: "center",
        p: 1.5,
        justifyContent: "center",
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {book.isbn}
        </Typography>
        <Typography variant="h5" component="h2">
          {book.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          by {book.author}
        </Typography>

        <PopularityChips isbn={book.isbn} justifyContent="center" />

        {!imageError && coverUrl && (
          <CardMedia
            component="img"
            image={coverUrl}
            alt={`Cover of ${book.title}`}
            sx={{
              maxWidth: 200,
              margin: "0 auto",
              border: "1px solid #ddd",
              borderRadius: 1,
              p: 0,
            }}
            onError={handleImageError}
          />
        )}

        {imageError && (
          <Box sx={{ my: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "#666" }}
            >
              Cover image not available
            </Typography>
          </Box>
        )}

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={onScanMore}
          sx={{ mt: 2 }}
        >
          Scan More
        </Button>
        <Button
          startIcon={<CancelIcon />}
          variant="outlined"
          color="secondary"
          onClick={onWrongBook}
          sx={{ mt: 2, ml: 2 }}
        >
          Wrong Book
        </Button>
      </CardContent>
    </Card>
  );
}

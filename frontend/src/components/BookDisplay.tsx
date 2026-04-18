import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

type Book = { title: string; author: string; isbn: string; dnbId: string };
type BookDisplayProps = {
  book: Book;
  isbn: string;
  onRescan: () => void;
};

export default function BookDisplay({
  book,
  isbn,
  onRescan,
}: BookDisplayProps) {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Use own server endpoint instead of DNB API directly
    // Use relative URL to ensure protocol matching (HTTP or HTTPS)
    // TODO: Consider caching cover images on backend or using book.coverUrl
    setCoverUrl(`/api/cover?isbn=${book.isbn}&size=l`);
    setImageError(false);
  }, [book.isbn]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card sx={{ maxWidth: 400, textAlign: "center", p: 2 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Query: <strong>{isbn}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ISBN: <strong>{book.isbn}</strong>
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {book.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          by {book.author}
        </Typography>

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
              p: 0.5,
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
          variant="contained"
          color="primary"
          onClick={onRescan}
          sx={{ mt: 2 }}
        >
          Scan Another
        </Button>
      </CardContent>
    </Card>
  );
}

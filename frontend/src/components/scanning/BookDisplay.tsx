import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { Book } from "../../types/Book";
import PopularityChips from "../catalog/PopularityChips";

type BookDisplayProps = {
  book: Book;
  onScanMore: () => void;
  onWrongBook: () => void;
};

export default function BookDisplay({
  book,
  onScanMore,
  onWrongBook,
}: BookDisplayProps) {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Idea for improvement: consider caching cover images in the browser or using book.coverUrl
    // Use relative URL to ensure protocol matching (HTTP or HTTPS)
    setCoverUrl(`/api/cover?isbn=${book.isbn}&size=l`);
    setImageError(false);
  }, [book.isbn]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          textAlign: "center",
          p: 1.5,
          justifyContent: "center",
        }}
      >
        <CardContent>
          <Stack direction="row" sx={{ mb: 1 }}>
            {!imageError && coverUrl && (
              <CardMedia
                component="img"
                image={coverUrl}
                alt={`Cover of ${book.title}`}
                sx={{
                  maxWidth: 100,
                  margin: "0 auto",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  p: 0,
                  boxSizing: "content-box",
                }}
                onError={handleImageError}
              />
            )}
            <Stack
              direction="column"
              textAlign="left"
              width="100%"
              sx={{ mb: 1, ml: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                {book.isbn}
              </Typography>
              <Typography variant="h5" component="h2">
                {book.title}
              </Typography>

              {book.author && (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  by {book.author}
                </Typography>
              )}
            </Stack>
          </Stack>

          <PopularityChips isbn={book.isbn} justifyContent="left" />

          <Stack
            direction="row"
            sx={{
              mt: 1,
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={onScanMore}
              fullWidth
            >
              Scan More
            </Button>
            <Button
              startIcon={<CancelIcon />}
              variant="outlined"
              color="secondary"
              onClick={onWrongBook}
              fullWidth
            >
              Wrong Book
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

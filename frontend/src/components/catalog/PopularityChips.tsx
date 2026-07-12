import { Stack } from "@mui/material";
import Chip from "@mui/material/Chip";
import { useEffect, useState } from "react";
import { CSSProperties } from "react";

import { fetchBookPopularity } from "../../services/api/fetchBookData";
import { BookPopularity } from "../../types/Book";

type PopularityChipsProps = {
  isbn: string;
  justifyContent?: CSSProperties["justifyContent"];
};

/** Renders chips showing popularity measurements for books with a given ISBN */
export default function PopularityChips({
  isbn,
  justifyContent = "baseline",
}: PopularityChipsProps) {
  const [popularity, setPopularity] = useState<null | BookPopularity>(null);

  // Fetch book popularity data once when the component mounts and whenever the ISBN changes
  useEffect(() => {
    async function fetchPopularity() {
      const fetchedPopularity = await fetchBookPopularity(isbn);
      if (fetchedPopularity.ok) {
        setPopularity(fetchedPopularity.data);
      } else {
        console.error(
          `Error fetching popularity for ISBN ${isbn}: ${fetchedPopularity.error}`,
        );
        setPopularity(null);
      }
    }
    fetchPopularity();
  }, [isbn]);

  return (
    <>
      {popularity && (
        <Stack
          direction="row"
          sx={{
            mb: 1,
            flexWrap: "wrap",
            gap: 0.5,
            justifyContent: justifyContent,
          }}
        >
          {popularity?.currentlyOnShelves !== null &&
            popularity?.currentlyOnShelves !== undefined && (
              <Chip
                label={`On shelves: ${popularity.currentlyOnShelves}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          {popularity?.totalBooksSeen !== null &&
            popularity?.totalBooksSeen !== undefined && (
              <Chip
                label={`Copies seen: ${popularity.totalBooksSeen}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          {popularity?.avgDaysUntilTakeout !== null &&
            popularity?.avgDaysUntilTakeout !== undefined && (
              <Chip
                label={`Avg. days until takeout: ${popularity.avgDaysUntilTakeout.toFixed(0) ?? "N/A"}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
        </Stack>
      )}
    </>
  );
}

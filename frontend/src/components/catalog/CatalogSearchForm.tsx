import LocationOffIcon from "@mui/icons-material/LocationOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import { SortMode } from "../../services/sorting";
import TextInput from "../TextInput";

export type SearchFormState = {
  title: string;
  author: string;
  isbn: string;
  sortMode: SortMode;
  useUserLocation: boolean;
};

type CatalogSearchFormProps = {
  hasDistanceData: boolean;
  searchFormState: SearchFormState;
  setSearchFormState: React.Dispatch<React.SetStateAction<SearchFormState>>;
  handleTitleAuthorSubmit: (e: React.FormEvent) => void | Promise<void>;
  handleISBNSubmit: (e: React.FormEvent) => void | Promise<void>;
};

/**
 * User input fields for the catalog search.
 */
export default function CatalogSearchForm({
  hasDistanceData,
  searchFormState,
  setSearchFormState,
  handleTitleAuthorSubmit,
  handleISBNSubmit,
}: CatalogSearchFormProps) {
  return (
    // TODO: use mui toggle switch instead of mui checkbox for location?
    // TODO: use uniform styling and layouting for all pages, move styles to global.css / theme.ts!
    <div>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 0,
        }}
      >
        <TextInput
          value={searchFormState.title}
          placeholder="Search books by title"
          label="Search books by title"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFormState((prev) => ({ ...prev, title: e.target.value }))
          }
          onSubmit={handleTitleAuthorSubmit}
        />
        <TextInput
          value={searchFormState.author}
          placeholder="Search books by author"
          label="Search books by author"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFormState((prev) => ({ ...prev, author: e.target.value }))
          }
          onSubmit={handleTitleAuthorSubmit}
        />
      </Box>
      <TextInput
        value={searchFormState.isbn}
        placeholder="Search books by ISBN"
        label="Search books by ISBN"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchFormState((prev) => ({ ...prev, isbn: e.target.value }))
        }
        onSubmit={handleISBNSubmit}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: "30rem",
          mt: 1,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <FormControl size="small">
          <InputLabel id="catalog-sort-label">Sort by</InputLabel>
          <Select
            labelId="catalog-sort-label"
            id="catalog-sort"
            value={searchFormState.sortMode}
            label="Sort by"
            onChange={(event) => {
              setSearchFormState((prev) => ({
                ...prev,
                sortMode: event.target.value as SortMode,
              }));
            }}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="distance" disabled={!hasDistanceData}>
              Distance
            </MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          value="end"
          control={
            <Checkbox
              checked={searchFormState.useUserLocation}
              onChange={(e) => {
                setSearchFormState((prev) => ({
                  ...prev,
                  useUserLocation: e.target.checked,
                }));
              }}
              icon={<LocationOffIcon />}
              checkedIcon={<LocationOnIcon />}
            />
          }
          label="Search near me"
          labelPlacement="end"
        />
      </Box>
    </div>
  );
}

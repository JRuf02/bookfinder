import LocationOffIcon from "@mui/icons-material/LocationOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
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
  onToggleSearchNearMe: () => void;
  handleTitleAuthorSubmit: (e: React.FormEvent) => void | Promise<void>;
  handleISBNSubmit: (e: React.FormEvent) => void | Promise<void>;
  isUserLocationReady: boolean;
  locationLoading: boolean;
};

/**
 * User input fields for the catalog search.
 */
export default function CatalogSearchForm({
  hasDistanceData,
  searchFormState,
  setSearchFormState,
  onToggleSearchNearMe,
  handleTitleAuthorSubmit,
  handleISBNSubmit,
  isUserLocationReady,
  locationLoading,
}: CatalogSearchFormProps) {
  const searchNearMeActive = searchFormState.useUserLocation;
  const disableSearchSubmit = searchNearMeActive && !isUserLocationReady;

  return (
    <Stack
      direction="row"
      className="catalog-search-form"
      sx={{
        flexWrap: "wrap",
        gap: "0rem",
        justifyContent: "center",
      }}
    >
      <TextInput
        value={searchFormState.title}
        placeholder="Search books by title"
        label="Search books by title"
        submitDisabled={disableSearchSubmit}
        submitEndIcon={
          locationLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchFormState((prev) => ({ ...prev, title: e.target.value }))
        }
        onSubmit={handleTitleAuthorSubmit}
      />
      <TextInput
        value={searchFormState.author}
        placeholder="Search books by author"
        label="Search books by author"
        submitDisabled={disableSearchSubmit}
        submitEndIcon={
          locationLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchFormState((prev) => ({ ...prev, author: e.target.value }))
        }
        onSubmit={handleTitleAuthorSubmit}
      />
      <TextInput
        value={searchFormState.isbn}
        placeholder="Search books by ISBN"
        label="Search books by ISBN"
        submitDisabled={disableSearchSubmit}
        submitEndIcon={
          locationLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchFormState((prev) => ({ ...prev, isbn: e.target.value }))
        }
        onSubmit={handleISBNSubmit}
      />

      <Stack
        direction="row"
        sx={{ gap: 1, alignItems: "center", mt: 0.5, mb: 0, pb: 0 }}
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
          control={
            <Checkbox
              checked={searchNearMeActive}
              onChange={onToggleSearchNearMe}
              disabled={locationLoading}
              icon={
                locationLoading && searchNearMeActive ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LocationOffIcon />
                )
              }
              checkedIcon={
                locationLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LocationOnIcon />
                )
              }
            />
          }
          label={
            <Typography variant="body1" color="text.secondary">
              Search near me
            </Typography>
          }
          labelPlacement="start"
        />
      </Stack>
    </Stack>
  );
}

import { Button, Stack, Typography } from "@mui/material";

type MapPopupProps = {
  title: string;
  showInsert?: boolean;
  showRemove?: boolean;
  onInsert?: () => void;
  onRemove?: () => void;
  children?: React.ReactNode;
};

export default function MapPopup({
  title,
  showInsert,
  showRemove,
  onInsert,
  onRemove,
  children,
}: MapPopupProps) {
  return (
    <Stack spacing={1} alignItems="center">
      <Typography variant="body1">{title}</Typography>
      {children}
      <Stack direction="row" spacing={1}>
        {showInsert && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onInsert}
          >
            Insert
          </Button>
        )}
        {showRemove && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

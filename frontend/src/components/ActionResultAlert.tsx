import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Props = {
  result: {
    success: boolean;
    message: string;
  } | null;
  errors?: string[];
};

export default function ActionResultAlert({ result, errors }: Props) {
  const isSuccess = result ? result.success : false;

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
      <Alert severity={isSuccess ? "success" : "error"}>
        {result ? result.message : "Unknown Error"}

        {errors && errors.length > 0 && (
          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                {errors.length} error
                {errors.length === 1 ? "" : "s"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {errors.map((error, index) => (
                  <ListItem key={`${index}-${error}`} disableGutters>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </Alert>
    </Box>
  );
}

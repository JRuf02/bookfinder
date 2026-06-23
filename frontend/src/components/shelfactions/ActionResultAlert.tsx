import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

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
          <Accordion sx={{ mt: 0.25 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Show failure
                {errors.length === 1 ? "" : "s"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {errors.map((error, index) => (
                  <ListItem key={`${index}-${error}`} sx={{ py: 0, px: 0.25 }}>
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

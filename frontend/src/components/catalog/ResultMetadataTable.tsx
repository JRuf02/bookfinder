import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// TODO: change implementation and use it
export default function ResultMetadataTable() {
  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ maxWidth: "100%" }}
        size="small"
        aria-label="shelf metadata table"
      >
        <TableBody>
          <TableRow
            key={"todo"}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="left">{"Shelf"}</TableCell>
            <TableCell align="right">{"shelf name"}</TableCell>
          </TableRow>
          <TableRow
            key={"todo"}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="left">{"Website"}</TableCell>
            <TableCell align="right">{"shelf website"}</TableCell>
          </TableRow>
          <TableRow
            key={"todo"}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="left">{"Operator"}</TableCell>
            <TableCell align="right">{"Hello World"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

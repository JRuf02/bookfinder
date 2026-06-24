import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import { removeOsmIdPrefix } from "../../services/prefix";
import { Shelf } from "../../types/Shelf";

type ShelfMetadataTableProps = {
  shelf: Shelf;
};

export default function ShelfMetadataTable({ shelf }: ShelfMetadataTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table
        className="shelf-metadata-table"
        sx={{ maxWidth: "100%" }}
        size="small"
        aria-label="shelf metadata table"
      >
        <TableBody>
          {shelf.type && (
            <TableRow key={"type"}>
              <TableCell align="left">{"Type"}</TableCell>
              <TableCell align="right">
                {shelf.type?.replaceAll("_", " ")}
              </TableCell>
            </TableRow>
          )}
          {shelf.website && (
            <TableRow key={"website"}>
              <TableCell align="left">{"Website"}</TableCell>
              <TableCell align="right">{shelf.website}</TableCell>
            </TableRow>
          )}
          {shelf.address && (
            <TableRow key={"address"}>
              <TableCell align="left">{"Address"}</TableCell>
              <TableCell align="right">{shelf.address}</TableCell>
            </TableRow>
          )}
          {shelf.operator && (
            <TableRow key={"operator"}>
              <TableCell align="left">{"Operator"}</TableCell>
              <TableCell align="right">{shelf.operator}</TableCell>
            </TableRow>
          )}
          {shelf.openingHours && (
            <TableRow key={"openingHours"}>
              <TableCell align="left">{"Opening hours"}</TableCell>
              <TableCell align="right">{shelf.openingHours}</TableCell>
            </TableRow>
          )}
          {shelf.osmId && (
            <TableRow key={"osmId"}>
              <TableCell align="left">{"OSM ID"}</TableCell>
              <TableCell align="right">
                {removeOsmIdPrefix(shelf.osmId)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

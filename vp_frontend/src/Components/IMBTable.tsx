/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  TablePagination,
  Typography,
  TextField,
  Link,
  useMediaQuery, // Import useMediaQuery
} from "@mui/material";
import { exportTableToExcel } from "../services/exportService"; // Import the export service
import { Download as DownloadIcon } from "@mui/icons-material"; // Import the icon

interface IMBTableProps {
  data: any[]; // Define the shape of the data array
  visibleColumns: string[];
  totalColumns: string[];
  columnMap: Record<string, string>;
  title: string;
  noDataMessage: string;
  showPagination: boolean;
  rowAction: null | { label: string; onClick: (rowData: Record<string, string>) => void; asLink?: boolean };
  showFilters?: boolean; // New prop to control the visibility of filters (single filter box)
  onRowClick?: (row: any) => void; // Optional prop for row click handling
}

const IMBTable: React.FC<IMBTableProps> = ({
  data,
  columnMap,
  visibleColumns,
  title,
  noDataMessage,
  showPagination = false,
  totalColumns = [],
  rowAction,
  showFilters = false, // Default value for showFilters is true
  onRowClick,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null); // Track selected row index

  const isSmallScreen = useMediaQuery("(max-width:600px)"); // Detect small screens

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredData = useMemo(() => {
    return data.filter((item: Record<string, string | number | boolean | null>) =>
      Object.values(item).some((val) => val?.toString().toLowerCase().includes(filter.toLowerCase()))
    );
  }, [data, filter]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const displayedColumns = visibleColumns.map((key) => ({
    key: key as string,
    label: columnMap[key] || key,
  }));

  const paginatedData = showPagination
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const totals: Record<string, number> = {};
  totalColumns.forEach((col) => {
    totals[col] = data.reduce((sum, row) => sum + (row[col] || 0), 0);
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportToExcel = () => {
    exportTableToExcel("imb-table", `${title || "ExportedTable"}.xlsx`, "DVOT-Surekh", title); // Use the export service
  };

  return (
    <Box>
      {title && (
        <div style={{ padding: "8px", fontWeight: "bold", fontSize: "1rem" }}>{title}</div>
      )}

      {showFilters && (
        <Box
          sx={{
            marginBottom: 2,
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row", // Stack controls on small screens
            alignItems: isSmallScreen ? "stretch" : "center",
            gap: 2,
          }}
          className="no-print"
        >
          <TextField
            variant="outlined"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Search..."
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: (theme) => theme.palette.secondary.main,
                },
                "&:hover fieldset": {
                  borderColor: (theme) => theme.palette.secondary.dark,
                },
                "&.Mui-focused fieldset": {
                  borderColor: (theme) => theme.palette.secondary.dark,
                },
              },
              "& .MuiInputBase-input": {
                padding: "8px",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrint} // Print functionality
            size="small"
          >
            Print
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleExportToExcel} // Excel export functionality
            size="small"
            startIcon={<DownloadIcon />} // Add the icon
          >
            Excel
          </Button>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          overflowX: isSmallScreen ? "auto" : "visible", // Add horizontal scroll for small screens
        }}
      >
        <Table
          id="imb-table" // Add ID for export service          
          sx={{
            "& th": {
              backgroundColor: (theme) => theme.palette.secondary.light, // Use theme primary color
              color: (theme) => theme.palette.secondary.contrastText, // Use theme contrast text for primary color
              textAlign: "center",
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
              cursor: "pointer", // Indicate that the column headers are clickable
            },
            "& tfoot td": {
              backgroundColor: (theme) => theme.palette.secondary.light, // Same as NavBar
              color: (theme) => theme.palette.secondary.contrastText, // Same as NavBar
              fontWeight: "bold",
              borderTop: "2px solid #ccc",
            },
            "& tr:nth-of-type(odd)": {
              backgroundColor: "#f9f9f9",
            },
            "& tr:nth-of-type(even)": {
              backgroundColor: "#ffffff",
            },
            "& td, & th": {
              padding: "3px",
              borderLeft: "1px solid #ccc",
              borderRight: "1px solid #ccc",
              textAlign: "center",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {displayedColumns.map((col) => (
                <TableCell key={col.key} onClick={() => handleSort(col.key)}>
                  {col.label}
                  {sortConfig?.key === col.key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : ""}
                </TableCell>
              ))}
              {rowAction && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => {
                    const isSelected = selectedRowIndex === rowIndex;
                    setSelectedRowIndex(isSelected ? null : rowIndex); // Toggle selection
                    if (onRowClick) {
                      onRowClick(isSelected ? null : row); // Pass `null` if deselected, otherwise pass the row
                    }
                  }}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    border: selectedRowIndex === rowIndex ? "3px solid darkblue" : "1px solid transparent", // Dark blue border for selected row
                    "&:hover": { backgroundColor: "#f5f5f5" }, // Add hover effect
                  }}
                >
                  {displayedColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        fontWeight: selectedRowIndex === rowIndex ? "bold" : "normal", // Bold text for selected row
                      }}
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                  {rowAction && (
                    <TableCell className="no-print">
                      {rowAction.asLink ? (
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            rowAction.onClick(row);
                          }}
                        >
                          {rowAction.label}
                        </Link>
                      ) : (
                        <Button size="small" variant="contained" color="primary" onClick={() => rowAction.onClick(row)}>
                          {rowAction.label}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={displayedColumns.length + (rowAction ? 1 : 0)} align="center">
                  <Typography variant="body1" color="textSecondary">
                    {noDataMessage || "No data available"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {totalColumns.length > 0 && (
            <TableFooter>
              <TableRow>
                {displayedColumns.map((col, index) => (
                  <TableCell key={col.key}>
                    {index === 0 ? "Total" : totalColumns.includes(col.key) ? totals[col.key].toLocaleString("en-IN") : ""}
                  </TableCell>
                ))}
                {rowAction && <TableCell />}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      {showPagination && data.length > 0 && (
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            justifyContent: "flex-end", // Align pagination to the right
          }}
          className="no-print" // Add no-print class to pagination
        >
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25, 50]}
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </Box>
  );
};

export default IMBTable;
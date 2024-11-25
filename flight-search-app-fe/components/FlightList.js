import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TableSortLabel,
    Divider
} from "@mui/material";
import { useState } from "react";

const tableCellStyle = {
    textAlign: "center",
    verticalAlign: "middle",
};

export default function FlightList({ flights, firstRun }) {
    const [sortConfig, setSortConfig] = useState({ key: "price", order: "asc" }); 
    const [sortedFlights, setSortedFlights] = useState(flights || []); 

    const handleSort = (key) => {
        const order = sortConfig.order === "asc" ? "desc" : "asc"; 
        setSortConfig({ key, order });

        const sorted = [...flights].sort((a, b) => {
            if (key === "price") {
                const priceA = parseFloat(a.price.grandTotal);
                const priceB = parseFloat(b.price.grandTotal);
                return order === "asc" ? priceA - priceB : priceB - priceA;
            } else if (key === "stops") {
                const stopsA = a.itineraries.reduce((sum, itinerary) => sum + itinerary.stops, 0);
                const stopsB = b.itineraries.reduce((sum, itinerary) => sum + itinerary.stops, 0);
                return order === "asc" ? stopsA - stopsB : stopsB - stopsA;
            }
            return 0;
        });

        setSortedFlights(sorted);
    };

    if (!flights || flights.length === 0) {
        if (firstRun) return <Typography>Start searching!</Typography>;
        return <Typography>No flights found.</Typography>;
    }

    return (
        <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, boxShadow: 3, mt: 5, mb: 10 }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={tableCellStyle}><strong>Flight ID</strong></TableCell>
                        <TableCell sx={tableCellStyle}><strong>Origin</strong></TableCell>
                        <TableCell sx={tableCellStyle}><strong>Destination</strong></TableCell>
                        <TableCell sx={tableCellStyle}>
                            <TableSortLabel
                                active={sortConfig.key === "price"}
                                direction={sortConfig.order}
                                onClick={() => handleSort("price")}
                            >
                                <strong>Price</strong>
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={tableCellStyle}><strong>Seats (max 9)</strong></TableCell>
                        <TableCell sx={tableCellStyle}><strong>Total time</strong></TableCell>
                        <TableCell sx={tableCellStyle}>
                            <TableSortLabel
                                active={sortConfig.key === "stops"}
                                direction={sortConfig.order}
                                onClick={() => handleSort("stops")}
                            >
                                <strong>Total Stops</strong>
                            </TableSortLabel>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedFlights.map((flight, idx) => (
                        <TableRow
                            key={flight.id}
                            sx={{
                                backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                                "&:hover": { backgroundColor: "#f1f1f1" }, 
                            }}
                        >
                            <TableCell sx={tableCellStyle}>No. {flight.id}</TableCell>
                            <TableCell sx={tableCellStyle}>{flight.originIATA}</TableCell>
                            <TableCell sx={tableCellStyle}>{flight.destinationIATA}</TableCell>
                            <TableCell sx={tableCellStyle}>
                                {flight.price.grandTotal} {flight.price.currency}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>{flight.numberOfBookableSeats}</TableCell>
                            <TableCell sx={tableCellStyle}>
                                <Typography key={0} variant="body2">
                                    {flight.originIATA} - {flight.destinationIATA}: {flight.itineraries[0].duration}
                                </Typography>
                                {flight.itineraries.length === 2 && (<Divider orientation="horizontal" variant= "middle" flexItem></Divider>)}

                                {flight.itineraries.length === 2 && (
                                    <Typography key={1} variant="body2">
                                        {flight.destinationIATA} - {flight.originIATA}: {flight.itineraries[1].duration}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>
                                <Typography key={0} variant="body2">{flight.itineraries[0].stops}</Typography>
                                {flight.itineraries.length === 2 && (<Divider orientation="horizontal" variant= "middle" flexItem></Divider>)}
                                {flight.itineraries.length === 2 && (
                                    <Typography key={1} variant="body2">
                                        {flight.itineraries[1].stops}
                                    </Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
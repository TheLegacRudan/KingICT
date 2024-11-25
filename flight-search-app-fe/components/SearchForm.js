import { useState } from "react";
import { Box, Button, Grid, TextField, Autocomplete, Checkbox, FormControlLabel, Divider } from "@mui/material";
import IATA_CODES from "../IATA_CODES"; 
import currencyCodes from "../currencyCodes"; 

export default function SearchForm({ onSearch }) {
    const [originIATA, setOriginIATA] = useState("");
    const [destinationIATA, setDestinationIATA] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [currencyCode, setCurrencyCode] = useState("");
    const [isReturnFlight, setIsReturnFlight] = useState(false);

    const airportOptions = Object.entries(IATA_CODES).map(([code, city]) => ({
        label: `${city} (${code})`,
        code: code,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();

        onSearch({
            OriginIATA: originIATA,
            DestinationIATA: destinationIATA,
            DepartureDate: departureDate,
            ReturnDate: isReturnFlight ? returnDate : "",
            Adults: parseInt(adults, 10),
            Children: parseInt(children, 10),
            Infants: parseInt(infants, 10),
            CurrencyCode: currencyCode,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={airportOptions}
                        getOptionLabel={(option) => option.label}
                        onChange={(e, value) => setOriginIATA(value ? value.code : "")}
                        renderInput={(params) => (
                            <TextField {...params} label="Origin (IATA)" required fullWidth />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={airportOptions}
                        getOptionLabel={(option) => option.label}
                        onChange={(e, value) => setDestinationIATA(value ? value.code : "")}
                        renderInput={(params) => (
                            <TextField {...params} label="Destination (IATA)" required fullWidth />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        type="date"
                        label="Departure Date"
                        InputLabelProps={{ shrink: true }}
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isReturnFlight}
                                onChange={(e) => setIsReturnFlight(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Return Flight"
                    />
                </Grid>

                {isReturnFlight && (
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Return Date"
                            InputLabelProps={{ shrink: true }}
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                        />
                    </Grid>
                )}

                <Grid container item spacing={2} xs={12}>
                    <Grid item xs={6} sm={4}>
                        <TextField
                            required
                            fullWidth
                            type="number"
                            label="Adults"
                            value={adults}
                            onChange={(e) => setAdults(e.target.value)}
                            inputProps={{ min: 1, max: 9 }}
                        />
                    </Grid>

                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Children"
                            value={children}
                            onChange={(e) => setChildren(e.target.value)}
                            inputProps={{ min: 0, max: 9 }}
                        />
                    </Grid>

                    <Grid item xs={6} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Infants"
                            value={infants}
                            onChange={(e) => setInfants(e.target.value)}
                            inputProps={{ min: 0, max: 9 }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    <Autocomplete
                        options={currencyCodes}
                        getOptionLabel={(option) => option} 
                        onChange={(e, value) => setCurrencyCode(value || "")} 
                        renderInput={(params) => (
                            <TextField {...params} label="Currency Code" fullWidth />
                        )}
                    />
                </Grid>
            </Grid>
            <Grid item xs={2}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mb: 5, width: "15%" }}
                >
                    Search
                </Button>
            </Grid>
            <Divider></Divider>

        </Box>
    );
}

"use client";

import { useState } from "react";
import Layout from "../../components/Layout";
import SearchForm from "../../components/SearchForm";
import FlightList from "../../components/FlightList";
import { CircularProgress, Typography, Box } from "@mui/material";

const cache = new Map();

export default function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [firstRun, setFirstRun] = useState(true);


    const searchFlights = async (searchData) => {
        const { OriginIATA, DestinationIATA, DepartureDate, ReturnDate, Adults, Children, Infants, CurrencyCode } = searchData;

        const cacheKey = JSON.stringify({
            OriginIATA,
            DestinationIATA,
            DepartureDate,
            ReturnDate,
            Adults,
            Children,
            Infants,
            CurrencyCode,
        });

        if (cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey);
            setFlights([...cachedData]);
            return;
        }

        setLoading(true);
        setFirstRun(false);
        setFlights([]);

        try {
            const queryString = new URLSearchParams({
                OriginIATA,
                DestinationIATA,
                DepartureDate,
                ReturnDate,
                Adults,
                Children,
                Infants,
                CurrencyCode,
            }).toString();

            const response = await fetch(`https://localhost:7285/FlightSearch/search?${queryString}`, {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error && errorData.message) {
                    alert(`${errorData.error}: ${errorData.message}`);
                } else {
                    alert("An unexpected error occurred.");
                }
                return;
            }
            const data = await response.json();

            cache.set(cacheKey, data);

            setFlights(data); 
        } catch (error) {
            alert("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Flight Offers Search">
            <Typography variant="h4" gutterBottom>
                Search Flights
            </Typography>
            <SearchForm onSearch={searchFlights} />
            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "200px",
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : (
                <FlightList flights={flights} firstRun={firstRun} key={JSON.stringify(flights)} />
            )}
        </Layout>
    );
}

import Head from 'next/head';
import { Container } from "@mui/material";

export default function Layout({ children, title = "Flight Search App" }) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Flight Search App" />
            </Head>
            <Container maxWidth="lg" style={{ marginTop: "20px" }}>
                {children}
            </Container>
        </>
    );
}
 
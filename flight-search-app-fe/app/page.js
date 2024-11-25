import Layout from '@/components/Layout';
import { Typography, Link } from '@mui/material';

export default function Home() {
    return (
        <Layout title="Home">
        <Typography variant="h4" gutterBottom>
            Welcome to the Flight Search App! go <Link href="http://localhost:3000/flights">here</Link>
        </Typography>
        </Layout>
    );
}

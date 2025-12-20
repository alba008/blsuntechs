import { Box, Container, Divider, Typography } from "@mui/material";
import Header from "../components/header";

import LandingHero from "../components/LandingHero";
import Services from "../components/Services";
import NewsFeed from "../components/NewsFeed";
import Projects from "../components/Projects";


export default function Home() {
  // NOTE: If any of these log as "object" instead of "function",
  // that file has an export/import mismatch.
  // console.log({ Header, LandingHero, Services, DeliveredWork, NewsFeed });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e1116",
        color: "rgba(244,246,248,0.96)",
        backgroundImage:
          "radial-gradient(1200px 600px at 20% 0%, rgba(201,162,77,0.16), transparent 60%), radial-gradient(1000px 500px at 100% 10%, rgba(120,180,255,0.12), transparent 55%)",
      }}
    >
      <Header />

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <LandingHero />

        <Box sx={{ height: 18 }} />
        <Services />

        <Box sx={{ height: 18 }} />
        <Projects/>
        <Box sx={{ height: 18 }} />
        <NewsFeed />
      </Container>

      <Box
        component="footer"
        sx={{
          mt: 2,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.18)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2.25 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 950 }}>BlsunTech Dynamics</Typography>
            <Typography sx={{ opacity: 0.72, fontSize: 13 }}>
              Production-grade builds · Security-first mindset · Reliable delivery
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

          <Typography sx={{ opacity: 0.55, fontSize: 12.5 }}>
            © {new Date().getFullYear()} BlsunTech Dynamics. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

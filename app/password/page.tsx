"use client";

import crypto from "crypto";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hashedPassword =
      "db3c867ca74f7d91b1a265ffa949e62e3095aede758916b34e49975457ee0987";

    if (hashValue(password) === hashedPassword) {
      document.cookie = "accessGranted=true; path=/";
      router.push("/");
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        mt={4}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Enter Password
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          width="100%"
        >
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

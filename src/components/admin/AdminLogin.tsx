import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Card,
  Grid,
  CardContent,
  Alert,
  Link,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !college) {
      setError("Please fill in all fields, including selecting your college.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Login
        </Typography>

        <Card sx={{ width: "100%", mt: 3 }}>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Choose Your College"
                    select
                    fullWidth
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  >
                    <MenuItem value="Herald College Kathmandu">
                      Herald College Kathmandu
                    </MenuItem>
                    <MenuItem value="Islington College">
                      Islington College
                    </MenuItem>
                    <MenuItem value="Biratnagar College">
                      Biratnagar College
                    </MenuItem>
                    <MenuItem value="Informatics College">
                      Informatics College
                    </MenuItem>
                    <MenuItem value="Fishtail Mountain College">
                      Fishtail Mountain College
                    </MenuItem>
                    <MenuItem value="Itahari International College">
                      Itahari International College
                    </MenuItem>
                    <MenuItem value="Apex College">Apex College</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box mt={3} textAlign="center">
              <Link href="/admin/register" variant="body2">
                Don't have an account? Register
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminLogin;
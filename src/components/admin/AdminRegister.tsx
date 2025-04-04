import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Grid,
  Link,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const AdminRegister: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const collegeDomainMap: Record<string, string> = {
    "Herald College Kathmandu": "@heraldcollege.edu.np",
    "Islington College": "@islingtoncollege.edu.np",
    "Biratnagar International College": "@bicnepal.edu.np",
    "Informatics College Pokhara": "@icp.edu.np",
    "Fishtail Mountain College": "@fishtailmountain.edu.np",
    "Itahari International College": "@icc.edu.np",
    "Apex College": "@apexcollege.edu.np",
    "International School of Tourism and Hotel Management (IST)": "@istcollege.edu.np",
    "CG Institute of Management": "@cgim.edu.np",
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!college.trim()) {
      setError("Please select your college");
      return false;
    }

    const expectedDomain = collegeDomainMap[college];
    if (!email.endsWith(expectedDomain)) {
      setError(`Email domain must match the selected college (${expectedDomain}).`);
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);
      alert("A verification email has been sent to your email address. Please verify your email before logging in.");

      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        college,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      // Redirect to login page after sending the verification email
      navigate("/admin/login");
      setError("Registration successful! Please verify your email before logging in.");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Registration
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
                    label="Full Name"
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
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
                    required // This makes the field compulsory
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  >
                    <MenuItem value="Herald College Kathmandu">
                      Herald College Kathmandu
                    </MenuItem>
                    <MenuItem value="Islington College">
                      Islington College
                    </MenuItem>
                    <MenuItem value="Biratnagar International College">
                      Biratnagar International College
                    </MenuItem>
                    <MenuItem value="Informatics College Pokhara">
                      Informatics College Pokhara
                    </MenuItem>
                    <MenuItem value="Fishtail Mountain College">
                      Fishtail Mountain College
                    </MenuItem>
                    <MenuItem value="Itahari International College">
                      Itahari International College
                    </MenuItem>
                    <MenuItem value="Apex College">Apex College</MenuItem>
                    <MenuItem value="International School of Tourism and Hotel Management (IST)">
                      International School of Tourism and Hotel Management (IST)
                    </MenuItem>
                    <MenuItem value="CG Institute of Management">
                      CG Institute of Management
                    </MenuItem>
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
                    helperText="Password must be at least 6 characters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box mt={3} textAlign="center">
              <Link href="/admin/login" variant="body2">
                Already have an account? Login
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminRegister;
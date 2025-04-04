import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  MenuItem,
} from "@mui/material";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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

const VoterLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (user.emailVerified && userDoc.exists() && userDoc.data().role === "voter") {
            navigate("/voter");
          } else {
            await auth.signOut(); // Sign out unverified users or users with incorrect roles
          }
        } catch (err) {
          console.error("Error checking user role:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLogin && !college)) {
      setError("Email, password, and college (if registering) are required");
      return;
    }

    if (!isLogin) {
      const expectedDomain = collegeDomainMap[college];
      if (!email.endsWith(expectedDomain)) {
        setError(`Email domain must match the selected college (${expectedDomain}).`);
        return;
      }
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (userCredential.user.emailVerified) {
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          if (userDoc.exists() && userDoc.data().role === "voter") {
            navigate("/voter");
          } else {
            setError("Invalid credentials for voter login");
            await auth.signOut(); // Sign out the user if the role doesn't match
          }
        } else {
          setError("Email not verified. Please verify your email before logging in.");
          await auth.signOut(); // Sign out if email is not verified
        }
      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Send email verification
        await sendEmailVerification(userCredential.user);

        // Show popup and toggle to login form
        alert("A verification email has been sent to your email address. Please verify your email before logging in.");
        setIsLogin(true); // Toggle to login form

        // Create user profile in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          college,
          role: "voter",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            {isLogin ? "Voter Login" : "Voter Registration"}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            {isLogin
              ? "Sign in to access polls and cast your vote"
              : "Create an account to participate in polls"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {resetSent && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset link has been sent to your email
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {!isLogin && (
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    variant="outlined"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>

              {!isLogin && (
                <Grid item xs={12}>
                  <TextField
                    label="Choose Your College"
                    select
                    fullWidth
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
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
              )}

              <Grid item xs={12}>
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Grid>

              {!isLogin && (
                <Grid item xs={12}>
                  <TextField
                    label="Confirm Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </Grid>
              )}
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Register"
              )}
            </Button>
          </form>

          {isLogin && (
            <Box sx={{ textAlign: "center", mt: 1, mb: 2 }}>
              <Button
                color="primary"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "center" }}>
            <Button onClick={() => setIsLogin(!isLogin)} color="primary">
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VoterLogin;
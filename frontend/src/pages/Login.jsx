import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

//import { colors } from "../theme";
import Logo from "../components/Logo";
import BuildingArt from "../components/BuildingArt";


const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#f7f9fc",
    borderRadius: 2,
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d8dee9",
  },
};


export default function LoginPage({ onLoggedIn }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();


    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }


    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError(
        "Enter a valid email address, like name@company.com."
      );
      return;
    }


    if (!password) {
      setError("Enter your password.");
      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Invalid email or password"
        );

      }


      console.log(
        "Login successful:",
        data
      );


      const user = {
        name: data.name,
        role: data.role,
        email: cleanEmail,
      };


      if (remember) {

        localStorage.setItem(
          "hrmsToken",
          data.access_token
        );

        localStorage.setItem(
          "hrmsUser",
          JSON.stringify(user)
        );

      } else {

        sessionStorage.setItem(
          "hrmsToken",
          data.access_token
        );

        sessionStorage.setItem(
          "hrmsUser",
          JSON.stringify(user)
        );

      }


      if (onLoggedIn) {

        onLoggedIn(user);

      } else {

        window.location.href = "/dashboard";

      }


    } catch (err) {

      console.error(
        "Login error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again."
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "stretch",

        background:
          "linear-gradient(135deg,#f9fbff 0%,#eaf2fd 100%)",
      }}
    >


      {/* LEFT SIDE */}

      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          position: "relative",

          flex: 1.1,

          overflow: "hidden",

          px: {
            md: 5,
            lg: 8,
          },

          pt: 7,
        }}
      >


        <Logo width={260} />


        <Typography
          sx={{
            mt: 1,

            fontSize: 18,

            color: "text.secondary",
          }}
        >

          Employee Profile Management

        </Typography>


        <Typography
          sx={{
            mt: 6,

            fontSize: {
              md: 32,
              lg: 38,
            },

            fontWeight: 800,

            lineHeight: 1.15,

            letterSpacing: -0.5,
          }}
        >

          Connect People.

          <br />

          Build Possibilities.

        </Typography>


        <Typography
          sx={{
            mt: 2,

            maxWidth: 460,

            fontSize: 16,

            lineHeight: 1.5,

            color: "text.secondary",
          }}
        >

          A centralized platform to manage employee information,
          skills, experience, education and certifications within
          our organization.

        </Typography>


        <BuildingArt />


      </Box>



      {/* RIGHT SIDE */}

      <Box
        sx={{
          flex: 1,

          display: "grid",

          placeItems: "center",

          p: {
            xs: 2,
            md: 3,
          },
        }}
      >


        <Paper
          elevation={0}
          sx={{
            width: "100%",

            maxWidth: 440,

            p: {
              xs: 3,
              sm: 4,
            },

            borderRadius: 4,

            boxShadow:
              "0 20px 60px rgba(30,70,140,0.10)",


            "@media (max-height: 950px)": {

              p: 3,

            },


            "@media (max-height: 650px)": {

              p: 2.5,


              "& .card-intro": {

                display: "none",

              },

            },

          }}
        >


          {/* LOGO */}

          <Box
            sx={{
              textAlign: "center",
            }}
          >


            <Box
              sx={{
                display: "flex",

                justifyContent: "center",
              }}
            >

              <Logo width={200} />

            </Box>


            <Typography
              sx={{
                mt: 0.5,

                fontSize: 15,

                color: "text.secondary",
              }}
            >

              Employee Profile Management

            </Typography>


          </Box>



          <Divider
            sx={{
              my: 2.5,
            }}
          />



          {/* LOGIN HEADING */}

          <Box
            className="card-intro"
            sx={{
              textAlign: "center",

              mb: 2,
            }}
          >


            <Typography
              component="h1"
              sx={{
                fontSize: 22,

                fontWeight: 700,
              }}
            >

              Sign in to your account

            </Typography>


            <Typography
              sx={{
                color: "text.secondary",

                fontSize: 14,
              }}
            >

              Enter your email and password to access Akkodis.

            </Typography>


          </Box>



          {/* LOGIN FORM */}

          <Box
            component="form"

            onSubmit={handleLogin}

            noValidate
          >


            {error && (

              <Alert
                severity="error"

                sx={{
                  mb: 2,
                }}
              >

                {error}

              </Alert>

            )}



            {/* EMAIL */}

            <Typography
              component="label"

              htmlFor="email"

              sx={{
                fontWeight: 500,

                fontSize: 14,
              }}
            >

              Email ID

            </Typography>


            <TextField
              id="email"

              type="email"

              fullWidth

              size="small"

              autoComplete="username"

              autoFocus

              placeholder="name@company.com"

              value={email}

              disabled={loading}

              onChange={(e) => {

                setEmail(
                  e.target.value
                );

                if (error) {

                  setError("");

                }

              }}

              sx={{
                ...inputSx,

                mt: 0.5,

                mb: 2,
              }}

              slotProps={{
                input: {

                  startAdornment: (

                    <InputAdornment position="start">

                      <EmailOutlined
                        sx={{
                          color: "#64748b",
                        }}
                      />

                    </InputAdornment>

                  ),

                },

              }}
            />



            {/* PASSWORD */}

            <Typography
              component="label"

              htmlFor="password"

              sx={{
                fontWeight: 500,

                fontSize: 14,
              }}
            >

              Password

            </Typography>


            <TextField
              id="password"

              fullWidth

              size="small"

              autoComplete="current-password"

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Enter your password"

              value={password}

              disabled={loading}

              onChange={(e) => {

                setPassword(
                  e.target.value
                );

                if (error) {

                  setError("");

                }

              }}

              sx={{
                ...inputSx,

                mt: 0.5,
              }}

              slotProps={{
                input: {

                  startAdornment: (

                    <InputAdornment position="start">

                      <LockOutlined
                        sx={{
                          color: "#64748b",
                        }}
                      />

                    </InputAdornment>

                  ),


                  endAdornment: (

                    <InputAdornment position="end">

                      <IconButton
                        type="button"

                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }

                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }

                        edge="end"

                        size="small"
                      >

                        {showPassword
                          ? <Visibility />
                          : <VisibilityOff />
                        }

                      </IconButton>

                    </InputAdornment>

                  ),

                },

              }}
            />



            {/* REMEMBER ME */}

            <Box
              sx={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                my: 1,
              }}
            >


              <FormControlLabel
                control={

                  <Checkbox
                    size="small"

                    checked={remember}

                    disabled={loading}

                    onChange={(e) =>
                      setRemember(
                        e.target.checked
                      )
                    }
                  />

                }

                label={

                  <Typography
                    sx={{
                      fontSize: 14,
                    }}
                  >

                    Remember me

                  </Typography>

                }
              />



              <Link
                component="button"

                type="button"

                underline="hover"

                sx={{
                  fontSize: 14,
                }}

                onClick={() =>
                  setError(
                    "Password reset is not set up yet. Contact your HR administrator."
                  )
                }
              >

                Forgot password?

              </Link>


            </Box>



            {/* LOGIN BUTTON */}

            <Button
              type="submit"

              variant="contained"

              fullWidth

              disabled={loading}

              sx={{
                py: 1.3,

                fontSize: 16,

                borderRadius: 2,

                boxShadow: "none",
              }}
            >


              {loading ? (

                <CircularProgress
                  size={24}

                  color="inherit"
                />

              ) : (

                "Login"

              )}


            </Button>


          </Box>



          <Divider
            sx={{
              mt: 3,

              color: "text.secondary",

              fontSize: 14,
            }}
          >

            Authorized employees only

          </Divider>


        </Paper>


      </Box>


    </Box>

  );

}
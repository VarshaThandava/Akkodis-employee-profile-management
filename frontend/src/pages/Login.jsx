
import { useState, useEffect } from "react";

import { useMsal } from "@azure/msal-react";
import {
  loginRequest,
  ssoConfigured,
} from "../authConfig";

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
  BusinessOutlined,
} from "@mui/icons-material";

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

  const { instance } = useMsal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const AUTH_ERROR_KEY = "hrmsAuthError";

const [error, setError] = useState(
  () => sessionStorage.getItem(AUTH_ERROR_KEY) || ""
);

const showAuthError = (message) => {
  sessionStorage.setItem(AUTH_ERROR_KEY, message);
  setError(message);
};

const clearAuthError = () => {
  sessionStorage.removeItem(AUTH_ERROR_KEY);
  setError("");
};

  const [normalLoginLoading, setNormalLoginLoading] =
    useState(false);

  const [ssoLoading, setSsoLoading] =
    useState(false);


  // ==========================================================
  // NEW AUTHENTICATION
  // MICROSOFT ORGANIZATION SSO
  // ==========================================================


const handleOrganizationLogin = async () => {
  clearAuthError();

  if (!ssoConfigured) {
    showAuthError(
      "Organization SSO is not configured yet. Tenant ID and Client ID are required."
    );
    return;
  }

  try {
    setSsoLoading(true);

    await instance.loginRedirect(loginRequest);
  } catch (err) {
    console.error("Microsoft Organization Login Error:", err);

    const errorCode = err?.errorCode;
    const errorMessage = err?.message?.toLowerCase() || "";

  if (
      errorCode === "user_cancelled" ||
      errorCode === "user_canceled" ||
      errorMessage.includes("user_cancelled") ||
      errorMessage.includes("user_canceled")
    ) {
      showAuthError(
        "Akkodis Client ID & Tenant ID is yet to be configured"
      );
    } else {
      showAuthError(
        "Microsoft sign-in failed. Please try again."
      );
    }

    setSsoLoading(false);
  }
};

  setSsoLoading(false);
}
{error && (
  <Alert
    severity="error"
    onClose={clearAuthError}
    sx={{ mb: 2 }}
  >
    {error}
  </Alert>
)}
};



  // ==========================================================
  // OLD AUTHENTICATION
  // EMAIL + PASSWORD
  //
  // KEEPING THIS FOR LOCAL DEVELOPMENT
  // ==========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

clearAuthError();

    const cleanEmail = email.trim();


    // Validate email

    if (!cleanEmail) {

      setError(
        "Enter your email address."
      );

      return;
    }


    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {

      setError(
        "Enter a valid email address, like name@company.com."
      );

      return;
    }


    // Validate password

    if (!password) {

      setError(
        "Enter your password."
      );

      return;
    }


    setNormalLoginLoading(true);

   
    
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


      let data = {};

      try {

        data = await response.json();

      } catch {

        data = {};
      }


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Invalid email or password."
        );
      }


      console.log(
        "Local login successful:",
        data
      );


      const user = {

        name:
          data.name ||
          cleanEmail,

        role:
          data.role ||
          "Employee",

        email:
          cleanEmail,
      };


      // Save token/user

      if (remember) {

        localStorage.setItem(
          "hrmsToken",
          data.access_token
        );

        localStorage.setItem(
          "hrmsUser",
          JSON.stringify(user)
        );

        // Remove old session values

        sessionStorage.removeItem(
          "hrmsToken"
        );

        sessionStorage.removeItem(
          "hrmsUser"
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

        // Remove old persistent values

        localStorage.removeItem(
          "hrmsToken"
        );

        localStorage.removeItem(
          "hrmsUser"
        );
      }


      if (onLoggedIn) {

        onLoggedIn(user);

      } else {

        window.location.href =
          "/dashboard";
      }


    } catch (err) {

      console.error(
        "Local Login Error:",
        err
      );


      if (err instanceof TypeError) {

        setError(
          "Unable to connect to the backend. Make sure FastAPI is running on port 8000."
        );

      } else {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to login. Please try again."
        );
      }

    } finally {

      setNormalLoginLoading(false);
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


      {/* ======================================================
          LEFT SIDE
         ====================================================== */}

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

            color:
              "text.secondary",
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

            color:
              "text.secondary",
          }}
        >

          A centralized platform to manage employee information,
          skills, experience, education and certifications within
          our organization.

        </Typography>


        <BuildingArt />

      </Box>



      {/* ======================================================
          RIGHT SIDE
         ====================================================== */}

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
          }}
        >


          {/* LOGO */}

          <Box
            sx={{
              textAlign:
                "center",
            }}
          >

            <Box
              sx={{
                display:
                  "flex",

                justifyContent:
                  "center",
              }}
            >

              <Logo width={200} />

            </Box>


            <Typography
              sx={{
                mt: 0.5,

                fontSize: 15,

                color:
                  "text.secondary",
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


          {/* LOGIN TITLE */}

          <Box
            sx={{
              textAlign:
                "center",

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
                mt: 0.5,

                color:
                  "text.secondary",

                fontSize: 14,
              }}
            >

              Access Akkodis Employee Profile Management

            </Typography>

          </Box>



          {/* ==================================================
              ERROR
             ================================================== */}

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



          {/* ==================================================
              NEW MICROSOFT ORGANIZATION LOGIN
             ================================================== */}

          <Button
            type="button"

            variant="contained"

            fullWidth

            startIcon={
              !ssoLoading
                ? <BusinessOutlined />
                : null
            }

            disabled={
              ssoLoading ||
              !ssoConfigured
            }

            onClick={
              handleOrganizationLogin
            }

            sx={{
              py: 1.3,

              fontSize: 16,

              borderRadius: 2,

              textTransform: "none",

              boxShadow: "none",

              bgcolor: "#0067b8",

              "&:hover": {
                bgcolor: "#005a9e",
              },

              "&.Mui-disabled": {
                bgcolor: "#94a3b8",
                color: "#ffffff",
              },
            }}
          >

            {ssoLoading ? (

              <CircularProgress
                size={24}
                color="inherit"
              />

            ) : (

              "Sign in with Organization ID"

            )}

          </Button>



          {!ssoConfigured && (

            <Typography
              sx={{
                mt: 1,

                textAlign: "center",

                fontSize: 12,

                color:
                  "text.secondary",
              }}
            >

              Organization SSO will be enabled after
              Tenant ID and Client ID are configured.

            </Typography>

          )}



          <Divider
            sx={{
              my: 2.5,

              color:
                "text.secondary",

              fontSize: 13,
            }}
          >

            OR

          </Divider>



          {/* ==================================================
              OLD EMAIL/PASSWORD LOGIN
             ================================================== */}

          <Box
            component="form"

            onSubmit={
              handleLogin
            }

            noValidate
          >


            {/* EMAIL LABEL */}

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



            {/* EMAIL INPUT */}

            <TextField
              id="email"

              type="email"

              fullWidth

              size="small"

              autoComplete="username"

              autoFocus

              placeholder="name@company.com"

              value={email}

              disabled={
                normalLoginLoading
              }

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
                          color:
                            "#64748b",
                        }}
                      />

                    </InputAdornment>

                  ),

                },
              }}
            />



            {/* PASSWORD LABEL */}

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



            {/* PASSWORD INPUT */}

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

              placeholder=
                "Enter your password"

              value={password}

              disabled={
                normalLoginLoading
              }

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
                          color:
                            "#64748b",
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
                            (current) =>
                              !current
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



            {/* REMEMBER + FORGOT PASSWORD */}

            <Box
              sx={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                my: 1,
              }}
            >


              <FormControlLabel
                control={

                  <Checkbox
                    size="small"

                    checked={
                      remember
                    }

                    disabled={
                      normalLoginLoading
                    }

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
                    "Password reset is not set up yet. Contact your administrator."
                  )
                }
              >

                Forgot password?

              </Link>

            </Box>



            {/* LOCAL LOGIN BUTTON */}

            <Button
              type="submit"

              variant="contained"

              fullWidth

              disabled={
                normalLoginLoading ||
                ssoLoading
              }

              sx={{
                py: 1.3,

                fontSize: 16,

                borderRadius: 2,

                textTransform:
                  "none",

                boxShadow:
                  "none",
              }}
            >

              {normalLoginLoading ? (

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

              color:
                "text.secondary",

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
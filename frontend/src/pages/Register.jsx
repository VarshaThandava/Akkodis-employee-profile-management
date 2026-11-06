
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
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
  BadgeOutlined,
  BusinessOutlined,
  Work,
  LocationOnOutlined,
  Person,
} from "@mui/icons-material";

import Logo from "../components/Logo";
import BuildingArt from "../components/BuildingArt";
import { registerEmployee } from "../services/api";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#f7f9fc",
    borderRadius: 2,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d8dee9",
  },
};

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
    current_role: "",
    years_of_experience: "",
    location: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = formData.email.trim();

    if (Object.values(formData).some((value) => !String(value).trim())) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (Number(formData.years_of_experience) < 0) {
      setError("Years of experience cannot be negative.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const {
        confirm_password,
        password,
        ...employeeDetails
      } = formData;

      await registerEmployee({
        ...employeeDetails,
        email: cleanEmail,
        years_of_experience: Number(
          employeeDetails.years_of_experience
        ),
        password,
      });

      setSuccess("Registration successful! You can now sign in.");

      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
        current_role: "",
        years_of_experience: "",
        location: "",
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    label,
    name,
    placeholder,
    icon,
    type = "text"
  ) => (
    <Box>
      <Typography
        component="label"
        htmlFor={name}
        sx={{ fontWeight: 500, fontSize: 13 }}
      >
        {label}
      </Typography>

      <TextField
        id={name}
        name={name}
        type={type}
        fullWidth
        size="small"
        placeholder={placeholder}
        value={formData[name]}
        disabled={loading}
        onChange={handleChange}
        sx={{ ...inputSx, mt: 0.5 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {icon}
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );

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
      {/* LEFT SIDE - SAME AS LOGIN */}

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          flex: 1.1,
          overflow: "hidden",
          px: { md: 5, lg: 8 },
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
            fontSize: { md: 32, lg: 38 },
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

      {/* RIGHT SIDE - REGISTRATION CARD */}

      <Box
        sx={{
          flex: 1.15,
          display: "grid",
          placeItems: "center",
          p: { xs: 2, md: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 620,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(30,70,140,0.10)",
            my: 2,
          }}
        >
          {/* LOGO */}

          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Logo width={180} />
            </Box>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
              }}
            >
              Employee Profile Management
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* HEADING */}

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              component="h1"
              sx={{ fontSize: 22, fontWeight: 700 }}
            >
              Create your account
            </Typography>

            <Typography
              sx={{ color: "text.secondary", fontSize: 13 }}
            >
              Enter your employee details to get started.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister} noValidate>
            {/* EMPLOYEE DETAILS */}

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                mb: 1.5,
                color: "#334155",
              }}
            >
              Employee Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              {renderField(
                "Employee ID",
                "employee_id",
                "Enter employee ID",
                <BadgeOutlined sx={{ color: "#64748b" }} />
              )}

              {renderField(
                "Full Name",
                "full_name",
                "Enter full name",
                <Person sx={{ color: "#64748b" }} />
              )}

              {renderField(
                "Email ID",
                "email",
                "name@company.com",
                <EmailOutlined sx={{ color: "#64748b" }} />,
                "email"
              )}

              {renderField(
                "Department",
                "department",
                "Enter department",
                <BusinessOutlined sx={{ color: "#64748b" }} />
              )}

              {renderField(
                "Current Role",
                "current_role",
                "Enter current role",
                <Work sx={{ color: "#64748b" }} />
              )}

              <Box>
                <Typography
                  component="label"
                  htmlFor="years_of_experience"
                  sx={{ fontWeight: 500, fontSize: 13 }}
                >
                  Years of Experience
                </Typography>

                <TextField
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  fullWidth
                  size="small"
                  placeholder="Enter experience"
                  value={formData.years_of_experience}
                  disabled={loading}
                  onChange={handleChange}
                  sx={{ ...inputSx, mt: 0.5 }}
                  slotProps={{
                    htmlInput: { min: 0 },
                  }}
                />
              </Box>

              {renderField(
                "Location",
                "location",
                "Enter location",
                <LocationOnOutlined sx={{ color: "#64748b" }} />
              )}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* PASSWORD DETAILS */}

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                mb: 1.5,
                color: "#334155",
              }}
            >
              Account Security
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              {[
                {
                  label: "Password",
                  name: "password",
                  visible: showPassword,
                  toggle: () => setShowPassword((v) => !v),
                },
                {
                  label: "Confirm Password",
                  name: "confirm_password",
                  visible: showConfirmPassword,
                  toggle: () => setShowConfirmPassword((v) => !v),
                },
              ].map((field) => (
                <Box key={field.name}>
                  <Typography
                    component="label"
                    htmlFor={field.name}
                    sx={{ fontWeight: 500, fontSize: 13 }}
                  >
                    {field.label}
                  </Typography>

                  <TextField
                    id={field.name}
                    name={field.name}
                    type={field.visible ? "text" : "password"}
                    fullWidth
                    size="small"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    value={formData[field.name]}
                    disabled={loading}
                    onChange={handleChange}
                    sx={{ ...inputSx, mt: 0.5 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#64748b" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              size="small"
                              onClick={field.toggle}
                              edge="end"
                              aria-label={`Toggle ${field.label}`}
                            >
                              {field.visible
                                ? <Visibility />
                                : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* REGISTER BUTTON */}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2.5,
                py: 1.2,
                fontSize: 15,
                borderRadius: 2,
                boxShadow: "none",
              }}
            >
              {loading ? (
                <CircularProgress size={23} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>

          <Divider sx={{ mt: 2.5, mb: 2 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Already registered?
            </Typography>
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => navigate("/login")}
              sx={{ fontSize: 14, fontWeight: 600 }}
            >
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

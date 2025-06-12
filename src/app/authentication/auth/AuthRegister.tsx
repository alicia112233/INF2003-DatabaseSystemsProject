"use client";
import React, { useState } from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Stack,
  CircularProgress,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';

interface registerType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

interface FieldErrors {
  firstname?: string;
  lastname?: string;
  gender?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
  cfmPassword?: string;
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const router = useRouter();
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [contactNumber, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cfmPassword, setCfmPassword] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showCfmPassword, setCfmShowPassword] = useState(false);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleCfmPasswordVisibility = () => {
    setCfmShowPassword(!showCfmPassword);
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    // Validate first name
    if (!firstname.trim()) {
      newErrors.firstname = 'First name is required!';
      isValid = false;
    }

    // Validate last name
    if (!lastname.trim()) {
      newErrors.lastname = 'Last name is required!';
      isValid = false;
    }

    // Validate gender
    if (!gender) {
      newErrors.gender = 'Please select your gender';
      isValid = false;
    }

    // Validate contact number
    const cleanedNumber = contactNumber.replace(/\s+/g, ''); // remove all spaces

    if (!cleanedNumber) {
      newErrors.contactNumber = 'Contact number is required!';
      isValid = false;
    } else if (!/^(?:\+65)?[89]\d{7}$/.test(cleanedNumber)) {
      newErrors.contactNumber = 'Please enter a valid Singapore contact number!';
      isValid = false;
    }

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required!';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address!';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required!';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters!';
      isValid = false;
    }

    // Validate confirm password
    if (!cfmPassword) {
      newErrors.cfmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (password !== cfmPassword) {
      newErrors.cfmPassword = 'Passwords do not match!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration data:', { 
        firstName: firstname, 
        lastName: lastname, 
        gender, 
        contactNo: contactNumber, 
        email, 
        password 
      });

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          firstName: firstname, 
          lastName: lastname, 
          gender, 
          contactNo: contactNumber, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific backend validation errors
        if (data.errors) {
          setErrors(data.errors);
          throw new Error('Please correct the errors in the form');
        } else if (data.error === 'Email already exists') {
          setErrors({ ...errors, email: 'This email is already registered' });
          throw new Error('This email is already registered');
        } else {
          throw new Error(data.error || 'Registration failed');
        }
      }

      // Show success toast
      setToastSeverity("success");
      setToastMessage("Registration successful! Redirecting back to Login...");
      setOpenToast(true);

      // Clear form
      setFirstName('');
      setLastName('');
      setGender('');
      setContact('');
      setEmail('');
      setPassword('');
      setCfmPassword('');
      setErrors({});

      // Registration successful, redirect to login after a short delay
      setTimeout(() => {
        router.push('/authentication/login');
      }, 1000);
    } catch (err) {
      setToastSeverity("error");
      setToastMessage(err instanceof Error ? err.message : "Registration  failed");
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth required error={!!errors.firstname}>
              <InputLabel htmlFor="firstname">First Name</InputLabel>
              <OutlinedInput
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                label="First Name"
              />
              {errors.firstname && (
                <FormHelperText error>{errors.firstname}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth required error={!!errors.lastname}>
              <InputLabel htmlFor="lastname">Last Name</InputLabel>
              <OutlinedInput
                id="lastname"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                label="Last Name"
              />
              {errors.lastname && (
                <FormHelperText error>{errors.lastname}</FormHelperText>
              )}
            </FormControl>
          </Stack>

          <FormControl fullWidth required error={!!errors.gender}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              label="Gender"
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="O">Other</MenuItem>
            </Select>
            {errors.gender && (
              <FormHelperText error>{errors.gender}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!errors.contactNumber}>
            <InputLabel htmlFor="contact">Contact Number</InputLabel>
            <OutlinedInput
              id="contactNumber"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContact(e.target.value)}
              label="Contact Number"
              placeholder="+65 9123 4567"
              required
            />
            {errors.contactNumber && (
              <FormHelperText error>{errors.contactNumber}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!errors.email}>
            <InputLabel htmlFor="email">Email</InputLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              required
            />
            {errors.email && (
              <FormHelperText error>{errors.email}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!errors.password}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              required
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {errors.password && (
              <FormHelperText error>{errors.password}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!errors.cfmPassword}>
            <InputLabel htmlFor="cfmpassword">Confirm Password</InputLabel>
            <OutlinedInput
              id="cfmpassword"
              type={showCfmPassword ? 'text' : 'password'}
              value={cfmPassword}
              onChange={(e) => setCfmPassword(e.target.value)}
              label="Confirm Password"
              required
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleCfmPasswordVisibility}
                    edge="end"
                  >
                    {showCfmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {errors.cfmPassword && (
              <FormHelperText error>{errors.cfmPassword}</FormHelperText>
            )}
          </FormControl>

          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </Stack>
      </form>
      {subtitle}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
export default AuthRegister;
// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Box,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Grid,
//   Tooltip,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
// } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import axiosInstance from "../../axios";
// import { Department } from "@prisma/client";
// import { useSnackbar } from "../../context/SnackbarContext";
// import { useNavigate } from "react-router-dom";

// interface Dealership {
//   id: number;
//   name: string;
// }

// interface JobTitle {
//   id: number;
//   title: string;
// }

// const UserCreation: React.FC = () => {
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [passwordStrength, setPasswordStrength] = useState<string>("");
//   const [first_name, setfirst_name] = useState<string>("");
//   const [last_name, setlast_name] = useState<string>("");
//   const [dealerships, setDealerships] = useState<Dealership[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
//   const [selected_dealership, setSelectedDealership] = useState<string>("");
//   const [selectedDepartment, setSelectedDepartment] = useState<string>("");
//   const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");

//   const [first_nameError, setfirst_nameError] = useState<boolean>(false);
//   const [last_nameError, setlast_nameError] = useState<boolean>(false);
//   const [emailError, setEmailError] = useState<boolean>(false);
//   const [passwordError, setPasswordError] = useState<boolean>(false);
//   const [dealershipError, setDealershipError] = useState<boolean>(false);
//   const [jobTitleError, setJobTitleError] = useState<boolean>(false);

//   const { showSnackbar } = useSnackbar();

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [dealershipsResponse, departmentsResponse, jobTitlesResponse] = await Promise.all([
//           axiosInstance.get("/dealerships"),
//           axiosInstance.get("/departments"),
//           axiosInstance.get("/jobTitles"),
//         ]);
//         setDealerships(dealershipsResponse.data);
//         setDepartments(departmentsResponse.data); 
//         setJobTitles(jobTitlesResponse.data);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         showSnackbar("Error fetching data", "error");
//       }
//     };
//     fetchData();
//   }, [showSnackbar]);

//   const checkPasswordStrength = (password: string) => {
//     const criteria = {
//       length: password.length >= 6,
//       uppercase: /[A-Z]/.test(password),
//       number: /[0-9]/.test(password),
//       specialChar: /[!@#$%^&*]/.test(password),
//     };

//     setPasswordStrength(
//       !criteria.length || !criteria.uppercase || !criteria.number || !criteria.specialChar
//         ? "Weak"
//         : criteria.length && criteria.uppercase && criteria.number && criteria.specialChar
//         ? "Strong"
//         : "Medium"
//     );
//   };

//   const getPasswordStrengthColor = (strength: string) => {
//     switch (strength) {
//       case "Weak":
//         return "red";
//       case "Medium":
//         return "orange";
//       case "Strong":
//         return "green";
//       default:
//         return "inherit";
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
  
//     const isValid = email && password && first_name && last_name && selected_dealership && selectedJobTitle;
  
//     setfirst_nameError(!first_name);
//     setlast_nameError(!last_name);
//     setEmailError(!email);
//     setPasswordError(!password);
//     setDealershipError(!selected_dealership);
//     setJobTitleError(!selectedJobTitle);
  
//     if (!isValid) {
//       showSnackbar("Please fill out all required fields.", "warning");
//       return;
//     }
  
//     const auth = getAuth();
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       await axiosInstance.post("/addUser", {
//         firebaseUid: user.uid,
//         email: user.email,
//         first_name,
//         last_name,
//         dealership_id: parseInt(selected_dealership, 10),
//         job_title_id: parseInt(selectedJobTitle, 10),
//       });
//       navigate("/admin/users");
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         showSnackbar(err.message, "error");
//       } else {
//         showSnackbar("An unexpected error occurred.", "error");
//       }
//     }
//   };

//   return (
//     <Container maxWidth={false} sx={{ width: "85%", mt: 2 }}>
//       <Box>
//         <Typography variant="h5" sx={{ mb: 2 }}>
//           Create New User
//         </Typography>
//         <form onSubmit={handleSubmit} noValidate>
//           <Grid container spacing={4}>
//             <Grid item xs={12} sm={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6">Basic Info</Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="First Name"
//                           variant="outlined"
//                           margin="normal"
//                           fullWidth
//                           value={first_name}
//                           onChange={(e) => setfirst_name(e.target.value)}
//                           required
//                           error={first_nameError}
//                           helperText={first_nameError ? "First name is required" : ""}
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="Last Name"
//                           variant="outlined"
//                           margin="normal"
//                           fullWidth
//                           value={last_name}
//                           onChange={(e) => setlast_name(e.target.value)}
//                           required
//                           error={last_nameError}
//                           helperText={last_nameError ? "Last name is required" : ""}
//                         />
//                       </Grid>
//                     </Grid>
//                     <FormControl fullWidth margin="normal" error={dealershipError}>
//                       <InputLabel id="dealership-select-label" required>Dealership</InputLabel>
//                       <Select
//                         labelId="dealership-select-label"
//                         value={selected_dealership}
//                         onChange={(e) => setSelectedDealership(e.target.value as string)}
//                         label="Dealership"
//                         required
//                       >
//                         {dealerships.map((dealership) => (
//                           <MenuItem key={dealership.id} value={dealership.id.toString()}>
//                             {dealership.dealership_name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {dealershipError && <Typography color="error">Dealership is required</Typography>}
//                     </FormControl>
//                     <FormControl fullWidth margin="normal" error={jobTitleError}>
//                       <InputLabel id="job-title-select-label" required>Job Title</InputLabel>
//                       <Select
//                         labelId="job-title-select-label"
//                         value={selectedJobTitle}
//                         onChange={(e) => setSelectedJobTitle(e.target.value as string)}
//                         label="Job Title"
//                         required
//                       >
//                         {jobTitles.map((jobTitle) => (
//                           <MenuItem key={jobTitle.id} value={jobTitle.id.toString()}>
//                             {jobTitle.title}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {jobTitleError && <Typography color="error">Job title is required</Typography>}
//                     </FormControl>
//                   </CardContent>
//                 </Card>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h5" gutterBottom>
//                       Login Info
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12}>
//                         <TextField
//                           label="Email"
//                           variant="outlined"
//                           margin="normal"
//                           fullWidth
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           required
//                           error={emailError}
//                           helperText={emailError ? "Email is required" : ""}
//                         />
//                       </Grid>
//                       <Grid item xs={12}>
//                         <Tooltip
//                           title={
//                             <List>
//                               <ListItem>
//                                 <ListItemIcon>
//                                   {password.length >= 6 ? (
//                                     <CheckCircleIcon color="success" />
//                                   ) : (
//                                     <CancelIcon color="error" />
//                                   )}
//                                 </ListItemIcon>
//                                 <ListItemText primary="At least 6 characters" />
//                               </ListItem>
//                               <ListItem>
//                                 <ListItemIcon>
//                                   {/[A-Z]/.test(password) ? (
//                                     <CheckCircleIcon color="success" />
//                                   ) : (
//                                     <CancelIcon color="error" />
//                                   )}
//                                 </ListItemIcon>
//                                 <ListItemText primary="At least one uppercase letter" />
//                               </ListItem>
//                               <ListItem>
//                                 <ListItemIcon>
//                                   {/[0-9]/.test(password) ? (
//                                     <CheckCircleIcon color="success" />
//                                   ) : (
//                                     <CancelIcon color="error" />
//                                   )}
//                                 </ListItemIcon>
//                                 <ListItemText primary="At least one number" />
//                               </ListItem>
//                               <ListItem>
//                                 <ListItemIcon>
//                                   {/[!@#$%^&*]/.test(password) ? (
//                                     <CheckCircleIcon color="success" />
//                                   ) : (
//                                     <CancelIcon color="error" />
//                                   )}
//                                 </ListItemIcon>
//                                 <ListItemText primary="At least one special character" />
//                               </ListItem>
//                             </List>
//                           }
//                           arrow
//                           placement="right"
//                         >
//                           <TextField
//                             label="Password"
//                             variant="outlined"
//                             margin="normal"
//                             fullWidth
//                             type="password"
//                             value={password}
//                             onChange={(e) => {
//                               setPassword(e.target.value);
//                               checkPasswordStrength(e.target.value);
//                             }}
//                             required
//                             error={passwordError}
//                             helperText={passwordError ? "Password is required" : ""}
//                           />
//                         </Tooltip>
//                         {password && (
//                           <Typography
//                             sx={{ mt: 1 }}
//                             color={getPasswordStrengthColor(passwordStrength)}
//                           >
//                             Password strength: {passwordStrength}
//                           </Typography>
//                         )}
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//             </Grid>
//           </Grid>
//           <Button
//             type="submit"
//             variant="outlined"
//             color="primary"
//             fullWidth
//             sx={{ mt: 3 }}
//           >
//             Create User
//           </Button>
//         </form>
//       </Box>
//     </Container>
//   );
// };

// export default UserCreation;

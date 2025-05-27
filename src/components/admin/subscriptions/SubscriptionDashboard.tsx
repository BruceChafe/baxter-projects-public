import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { supabase } from '../../../../supabase/supabaseClient';
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { format } from 'date-fns';

// Custom card component for our payment methods
const PaymentMethodCard = ({ paymentMethod, isPrimary, onDelete, onSetDefault, disabled }) => {
  const theme = useTheme();
  const expiryDate = `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
  
  return (
    <Card 
      sx={{ 
        border: isPrimary ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {isPrimary && (
        <Chip 
          label="Default" 
          color="primary" 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: -12, 
            right: 12,
            fontWeight: 'bold',
          }} 
        />
      )}
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <CreditCardIcon fontSize="large" color="action" />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              •••• •••• •••• {paymentMethod.card.last4}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {paymentMethod.card.brand} • Expires {expiryDate}
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              {!isPrimary && (
                <Button 
                  size="small"
                  onClick={() => onSetDefault(paymentMethod.id)}
                  disabled={disabled}
                >
                  Set Default
                </Button>
              )}
              <IconButton 
                aria-label="delete payment method" 
                color="error"
                onClick={() => onDelete(paymentMethod.id)}
                disabled={disabled || isPrimary}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`billing-tabpanel-${index}`}
      aria-labelledby={`billing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Main component
const SubscriptionDasbhoard = () => {
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [dealerGroup, setDealerGroup] = useState(null);

  // Fetch billing data on component mount
  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        // Get the dealer group ID from user metadata
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) throw new Error("User not authenticated.");
        
        const authToken = sessionData.session.access_token;
        const dealerGroupId = user.user_metadata.dealergroup_id;
        
        // Get dealer group details
        const { data: dgData, error: dgError } = await supabase
          .from('dealer_groups')
          .select('*')
          .eq('id', dealerGroupId)
          .single();
          
        if (dgError) throw dgError;
        setDealerGroup(dgData);
        
        // Call Supabase Edge Functions to get Stripe data
        const stripeDataUrl = "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/getStripeData";
        
        const response = await fetch(stripeDataUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            dealerGroupId
          }),
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to fetch billing data");
        
        // Update state with the fetched data
        setSubscription(result.subscription);
        setPaymentMethods(result.paymentMethods);
        setInvoices(result.invoices);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        showSnackbar("Failed to load billing information", "error");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchBillingData();
    }
  }, [user, showSnackbar]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open dialog for payment method deletion
  const handleDeletePaymentMethod = (id) => {
    setDeletePaymentId(id);
    setDialogOpen(true);
  };

  // Confirm payment method deletion
  const confirmDeletePaymentMethod = async () => {
    setProcessingAction(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated.");
      
      const authToken = sessionData.session.access_token;
      
      // Call Supabase Edge Function to delete payment method
      const deleteUrl = "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/deletePaymentMethod";
      
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentMethodId: deletePaymentId,
          dealerGroupId: user.user_metadata.dealergroup_id
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete payment method");
      
      // Update the payment methods list
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== deletePaymentId));
      showSnackbar("Payment method deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting payment method:", error);
      showSnackbar(error.message, "error");
    } finally {
      setProcessingAction(false);
      setDialogOpen(false);
    }
  };

  // Handle setting a payment method as default
  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    setProcessingAction(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated.");
      
      const authToken = sessionData.session.access_token;
      
      // Call Supabase Edge Function to set default payment method
      const setDefaultUrl = "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/setDefaultPaymentMethod";
      
      const response = await fetch(setDefaultUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId: subscription.customer,
          subscriptionId: subscription.id,
          dealerGroupId: user.user_metadata.dealergroup_id
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to set default payment method");
      
      // Update the subscription with the new default payment method
      setSubscription({
        ...subscription,
        default_payment_method: paymentMethodId
      });
      
      showSnackbar("Default payment method updated", "success");
    } catch (error) {
      console.error("Error setting default payment method:", error);
      showSnackbar(error.message, "error");
    } finally {
      setProcessingAction(false);
    }
  };

  // Navigate to Stripe Customer Portal
  const goToStripePortal = async () => {
    setProcessingAction(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated.");
      
      const authToken = sessionData.session.access_token;
      
      // Call Supabase Edge Function to create a portal session
      const portalUrl = "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/createStripePortalSession";
      
      const response = await fetch(portalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          customerId: subscription.customer,
          dealerGroupId: user.user_metadata.dealergroup_id,
          returnUrl: window.location.href
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create portal session");
      
      // Redirect to the Stripe Customer Portal
      window.location.href = result.url;
    } catch (error) {
      console.error("Error redirecting to Stripe portal:", error);
      showSnackbar(error.message, "error");
      setProcessingAction(false);
    }
  };

  // Helper function to format date
  const formatDate = (timestamp) => {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  // Helper function to get subscription status chip
  const getStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    
    switch (status) {
      case 'active':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'trialing':
        color = 'info';
        icon = <ScheduleIcon fontSize="small" />;
        break;
      case 'past_due':
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
        break;
      case 'canceled':
      case 'unpaid':
        color = 'error';
        icon = <WarningIcon fontSize="small" />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        icon={icon}
        label={status.replace('_', ' ')} 
        color={color} 
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Billing & Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your subscription, payment methods, and view billing history
        </Typography>
      </Box>
      
      {subscription ? (
        <>
          {/* Subscription Overview Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f5f8ff 0%, #f0f4ff 100%)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {dealerGroup?.name} Subscription
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    {getStatusChip(subscription.status)}
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {subscription.plan.nickname || 'Premium Plan'} • {formatCurrency(subscription.plan.amount)} / {subscription.plan.interval}
                </Typography>
                
                {subscription.status === 'trialing' && (
                  <Alert severity="info" icon={<ScheduleIcon />} sx={{ mt: 2 }}>
                    Your free trial ends on {formatDate(subscription.trial_end)}. You will be charged {formatCurrency(subscription.plan.amount)} on this date.
                  </Alert>
                )}
                
                {subscription.status === 'past_due' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Your payment is past due. Please update your payment method to avoid service interruption.
                  </Alert>
                )}
                
                {subscription.status === 'active' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Next billing date: {formatDate(subscription.current_period_end)}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  onClick={goToStripePortal}
                  disabled={processingAction}
                  startIcon={<SettingsIcon />}
                >
                  {processingAction ? 'Please wait...' : 'Manage Subscription'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tabs for payment methods and invoices */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="billing tabs"
                sx={{
                  '& .MuiTab-root': {
                    px: 3,
                    py: 2
                  }
                }}
              >
                <Tab 
                  icon={<CreditCardIcon />} 
                  iconPosition="start" 
                  label="Payment Methods" 
                  id="billing-tab-0"
                  aria-controls="billing-tabpanel-0"
                />
                <Tab 
                  icon={<ReceiptIcon />} 
                  iconPosition="start" 
                  label="Billing History" 
                  id="billing-tab-1"
                  aria-controls="billing-tabpanel-1"
                />
              </Tabs>
            </Box>
            
            {/* Payment Methods Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Payment Methods
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={goToStripePortal}
                    disabled={processingAction}
                  >
                    Add Payment Method
                  </Button>
                </Box>
                
                {paymentMethods.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2 }}>
                    No payment methods added yet.
                  </Alert>
                ) : (
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        paymentMethod={method}
                        isPrimary={subscription.default_payment_method === method.id}
                        onDelete={handleDeletePaymentMethod}
                        onSetDefault={handleSetDefaultPaymentMethod}
                        disabled={processingAction}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </TabPanel>
            
            {/* Billing History Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Billing History
                </Typography>
                
                {invoices.length === 0 ? (
                  <Alert severity="info">
                    No billing history available yet.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{formatDate(invoice.created)}</TableCell>
                            <TableCell>
                              Invoice #{invoice.number}
                              {invoice.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {invoice.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(invoice.amount_due)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={invoice.status} 
                                color={invoice.status === 'paid' ? 'success' : invoice.status === 'open' ? 'info' : 'error'}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small"
                                href={invoice.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View invoice"
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                              {invoice.invoice_pdf && (
                                <IconButton 
                                  size="small"
                                  href={invoice.invoice_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Download invoice"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No active subscription found. Please contact support for assistance.
        </Alert>
      )}
      
      {/* Confirmation Dialog for Payment Method Deletion */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment method? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)} 
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePaymentMethod} 
            color="error" 
            disabled={processingAction}
            startIcon={processingAction ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {processingAction ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionDasbhoard;
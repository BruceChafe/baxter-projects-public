// /src/pages/help/HelpArticlePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Fade,
  Skeleton,
  Alert,
  Collapse
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FullscreenRounded as FullscreenIcon,
  NavigateNext as NavigateNextIcon,
  Visibility as ViewIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Support as SupportIcon,
  TrendingUp as TrendingIcon,
  Article as ArticleIcon,
  Star as StarIcon,
  Update as UpdateIcon
} from "@mui/icons-material";
import { helpArticles } from "./data/HelpArticles";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingSteps } from "../../hooks/admin/useOnboardingSteps";

const HelpArticlePage = () => {
  const { articleSlug } = useParams();
  const { user, accessContext } = useAuth();
  const userId = user?.id ?? null;
  const role = (user?.user_metadata as any)?.role ?? "guest";

  const { steps, markStepComplete } = useOnboardingSteps(role, userId);
  const navigate = useNavigate();
  const theme = useTheme();
  const scribeContainerRef = useRef<HTMLDivElement>(null);
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const article = helpArticles.find((a) => a.slug === articleSlug);

  const stepKeyBySlug: Record<string, string> = {
    "upshift-intake-form": "view_upshift_help",
    "leadflow-getting-started": "view_leadflow_help",
  };

  useEffect(() => {
    const stepKey = articleSlug ? stepKeyBySlug[articleSlug] : null;
    const isAlreadyComplete = steps.find(
      (s) => s.step_key === stepKey && s.completed
    );
    if (stepKey && userId && !isAlreadyComplete) {
      markStepComplete(stepKey);
    }
  }, [articleSlug, userId, steps]);

  // Set page title when article loads
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Help Center`;
    }
    // Scroll to top when article changes
    window.scrollTo(0, 0);
    
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, [article]);

  // Initialize Scribe embed
  useEffect(() => {
    if (article && scribeContainerRef.current) {
      const scribeElements = scribeContainerRef.current.querySelectorAll('.scribe-embed');
      if (scribeElements.length > 0) {
        // Re-initialize Scribe embeds if needed
      }
    }
  }, [article]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={600}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.error.light}15, ${theme.palette.error.main}25)`,
              border: `1px solid ${theme.palette.error.light}`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 3,
                bgcolor: theme.palette.error.main,
                fontSize: '2rem'
              }}
            >
              📄
            </Avatar>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Article Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 400, mx: 'auto', opacity: 0.8 }}>
              We couldn't find the article you're looking for. It might have been moved or doesn't exist.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/help')}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Return to Help Center
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="100%" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={9}>
            <Skeleton variant="text" width={400} height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 4, borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={600} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleFullscreen = () => {
    const scribeFrame = scribeContainerRef.current?.querySelector('iframe');
    if (scribeFrame) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        scribeFrame.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleHelpful = (response: 'yes' | 'no') => {
    setHelpful(response);
    setShowFeedback(true);
  };

  // Mock related articles
  const relatedArticles = helpArticles
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <Container maxWidth="100%" sx={{ py: { xs: 4, md: 6 } }}>
      <Fade in timeout={600}>
        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid item xs={12} md={9}>
            {/* Enhanced Breadcrumbs */}
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ 
                mb: 4,
                '& .MuiBreadcrumbs-separator': {
                  color: theme.palette.primary.main,
                  opacity: 0.6
                }
              }}
            >
              <Link 
                to="/" 
                style={{ 
                  color: theme.palette.text.secondary, 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = theme.palette.primary.main}
                onMouseLeave={(e) => e.target.style.color = theme.palette.text.secondary}
              >
                Home
              </Link>
              <Link 
                to="/help" 
                style={{ 
                  color: theme.palette.text.secondary, 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = theme.palette.primary.main}
                onMouseLeave={(e) => e.target.style.color = theme.palette.text.secondary}
              >
                Help Center
              </Link>
              <Typography 
                color="primary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {article.title}
              </Typography>
            </Breadcrumbs>

            {/* Article Header */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                border: `1px solid ${theme.palette.primary.light}30`
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      icon={<ArticleIcon fontSize="small" />}
                      label={article.type || "Guide"}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={article.category}
                      size="small"
                      sx={{ 
                        bgcolor: theme.palette.grey[100],
                        color: theme.palette.text.secondary
                      }}
                    />
                  </Stack>

                  <Typography 
                    variant="h3" 
                    fontWeight={800} 
                    gutterBottom
                    sx={{ 
                      mb: 2,
                      background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    {article.title}
                  </Typography>

                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      fontWeight: 400,
                      lineHeight: 1.6
                    }}
                  >
                    {article.description}
                  </Typography>

                  <Stack direction="row" spacing={3} sx={{ opacity: 0.8 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2">5 min read</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ViewIcon fontSize="small" />
                      <Typography variant="body2">2.4k views</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <UpdateIcon fontSize="small" />
                      <Typography variant="body2">Updated 2 days ago</Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack spacing={1}>
                  <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark article"}>
                    <IconButton 
                      onClick={handleBookmark}
                      sx={{ 
                        bgcolor: isBookmarked ? theme.palette.primary.main : 'rgba(255,255,255,0.8)',
                        color: isBookmarked ? 'white' : theme.palette.text.primary,
                        '&:hover': { 
                          bgcolor: isBookmarked ? theme.palette.primary.dark : 'white',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Share article">
                    <IconButton 
                      onClick={handleShare}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { 
                          bgcolor: 'white',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copied ? <CheckIcon color="success" /> : <ShareIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>

            {/* Main Content Container */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                mb: 4,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              {/* Scribe Embed Container with Enhanced Controls */}
              <Box sx={{ position: 'relative' }}>
                {/* Enhanced Control Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.8)',
                    borderRadius: 2,
                    p: 1
                  }}
                >
                  <Tooltip title="View in fullscreen">
                    <IconButton
                      size="small"
                      onClick={handleFullscreen}
                      sx={{
                        color: 'white',
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FullscreenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Print guide">
                    <IconButton
                      size="small"
                      onClick={handlePrint}
                      sx={{
                        color: 'white',
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Copy link">
                    <IconButton
                      size="small"
                      onClick={handleCopyLink}
                      sx={{
                        color: 'white',
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Scribe Content Container */}
                <Box
                  ref={scribeContainerRef}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '700px',
                    '& iframe': {
                      width: '100%',
                      minHeight: '700px',
                      border: 'none',
                      borderRadius: '12px 12px 0 0'
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: article.embedCode }}
                />
              </Box>

              {/* Enhanced Footer Actions */}
              <Box
                sx={{
                  p: 4,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.grey[50]
                }}
              >
                {/* Feedback Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Was this article helpful?
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={helpful === 'yes' ? 'contained' : 'outlined'}
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleHelpful('yes')}
                      color={helpful === 'yes' ? 'success' : 'inherit'}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Yes, helpful
                    </Button>
                    <Button
                      variant={helpful === 'no' ? 'contained' : 'outlined'}
                      startIcon={<ThumbDownIcon />}
                      onClick={() => handleHelpful('no')}
                      color={helpful === 'no' ? 'error' : 'inherit'}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      No, not helpful
                    </Button>
                  </Stack>
                  
                  <Collapse in={showFeedback}>
                    <Alert 
                      severity={helpful === 'yes' ? 'success' : 'info'} 
                      sx={{ mt: 2 }}
                    >
                      {helpful === 'yes' 
                        ? "Great! We're glad this article was helpful." 
                        : "Thanks for your feedback. We'll work on improving this article."
                      }
                    </Alert>
                  </Collapse>
                </Box>

                {/* Action Buttons */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    component={Link}
                    to="/help"
                    size="large"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Back to Help Center
                  </Button>

                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<PrintIcon />}
                      variant="text"
                      onClick={handlePrint}
                      sx={{ textTransform: 'none' }}
                    >
                      Print
                    </Button>
                    <Button
                      startIcon={<ShareIcon />}
                      variant="text"
                      onClick={handleShare}
                      sx={{ textTransform: 'none' }}
                    >
                      Share
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Enhanced Sidebar */}
          <Grid item xs={12} md={3}>
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Related Articles
                </Typography>
                <Stack spacing={2}>
                  {relatedArticles.map((relatedArticle) => (
                    <Card
                      key={relatedArticle.slug}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => navigate(`/help/article/${relatedArticle.slug}`)}
                    >
                      <Stack direction="row" spacing={2}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: theme.palette.primary.light,
                            fontSize: '1rem'
                          }}
                        >
                          📖
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={600}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {relatedArticle.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {relatedArticle.type || 'Guide'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Enhanced Support Card */}
            <Card
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                border: `2px solid ${theme.palette.primary.light}40`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.light}30, ${theme.palette.secondary.light}30)`,
                  opacity: 0.5
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <SupportIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    Need More Help?
                  </Typography>
                </Stack>
                
                <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Can't find what you're looking for? Our support team is here to help you succeed.
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    Request Feature
                  </Button>
                </Stack>
              </Box>
            </Card>

            {/* Quick Stats Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Article Stats
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Views</Typography>
                  <Typography variant="body2" fontWeight={600}>2,431</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Helpful votes</Typography>
                  <Typography variant="body2" fontWeight={600}>89%</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Last updated</Typography>
                  <Typography variant="body2" fontWeight={600}>2 days ago</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Fade>
    </Container>
  );
};

export default HelpArticlePage;
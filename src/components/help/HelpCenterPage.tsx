// /src/pages/help/HelpCenterPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Avatar,
  Stack,
  Button,
  Divider,
  useTheme,
  Fade,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  Article as ArticleIcon,
  Star as StarIcon,
  Help as HelpIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  BookmarkBorder as BookmarkIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  LocalOffer as TagIcon,
} from "@mui/icons-material";
import { helpArticles, helpCategories } from "./data/HelpArticles";

// Enhanced categories with more details
const enhancedCategories = [
  {
    key: "receptionist",
    title: "Receptionist Guides",
    description:
      "Master visitor intake, contact management, and UpShift workflows with step-by-step tutorials.",
    icon: "👋",
    color: "#2196F3",
    articleCount: 8,
    popular: true,
    tags: ["Intake", "Visitors", "CRM"],
  },
  {
    key: "sales",
    title: "Sales Consultant Guides",
    description:
      "Boost your sales performance with lead management, CRM optimization, and conversion strategies.",
    icon: "📈",
    color: "#4CAF50",
    articleCount: 12,
    popular: true,
    tags: ["Leads", "CRM", "Sales"],
  },
  {
    key: "leadflow",
    title: "LeadFlow Guides",
    description:
      "Streamline your lead management process and maximize conversion rates with LeadFlow tools.",
    icon: "🔄",
    color: "#FF9800",
    articleCount: 6,
    popular: false,
    tags: ["Automation", "Leads", "Workflow"],
  },
  {
    key: "upshift",
    title: "UpShift Guides",
    description:
      "Get the most out of UpShift insights, analytics, and advanced dealership management features.",
    icon: "⚡",
    color: "#9C27B0",
    articleCount: 10,
    popular: true,
    tags: ["Analytics", "Insights", "Management"],
  },
];

// Popular articles data
const popularArticles = [
  {
    title: "How to Complete an Intake in UpShift",
    category: "Receptionist",
    readTime: "5 min",
    views: "2.1k",
    slug: "receptionist-upshift-intake",
  },
  {
    title: "Getting Started with UpShift Insights",
    category: "Analytics",
    readTime: "8 min",
    views: "1.8k",
    slug: "upshift-insights",
  },
  {
    title: "Lead Management Best Practices",
    category: "Sales",
    readTime: "6 min",
    views: "1.5k",
    slug: "lead-management",
  },
];

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Help Center | Baxter Projects";
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/help/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const totalArticles = enhancedCategories.reduce(
    (sum, cat) => sum + cat.articleCount,
    0
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h4">Loading Help Center...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Fade in timeout={600}>
        <Box>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Paper
              elevation={0}
              sx={{
                pt: 6,
                px: 4,
                pb: 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
                color: "white",
                position: "relative",
                overflow: "hidden",
                mb: 6,
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  gutterBottom
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    mb: 2,
                  }}
                >
                  Help Center
                </Typography>

                <Typography
                  variant="h5"
                  color="white"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontWeight: 400,
                    maxWidth: 600,
                    mx: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  Your complete guide to mastering dealership tools and
                  workflows
                </Typography>

                {/* Search Bar */}
                {/* <Box 
                  component="form" 
                  onSubmit={handleSearchSubmit}
                  sx={{ 
                    maxWidth: 500, 
                    mx: 'auto',
                    mb: 4
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search guides, tutorials, and FAQs..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: 'white',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Search
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box> */}
              </Box>
            </Paper>
          </Box>

          {/* Popular Articles Section */}
          <Box sx={{ mb: 8 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <TrendingIcon color="primary" />
              <Typography variant="h4" fontWeight={700}>
                Popular Guides
              </Typography>
              <Chip
                label="Most Viewed"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Grid container spacing={3}>
              {popularArticles.map((article, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Fade in timeout={800 + index * 100}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          boxShadow: `0 8px 32px rgba(0,0,0,0.12)`,
                          transform: "translateY(-4px)",
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          navigate(`/help/article/${article.slug}`)
                        }
                        sx={{ height: "100%", p: 3 }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Chip
                              label={article.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <IconButton size="small">
                              <BookmarkIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ lineHeight: 1.3 }}
                          >
                            {article.title}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ opacity: 0.7 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <TimeIcon fontSize="small" />
                              <Typography variant="caption">
                                {article.readTime}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <ViewIcon fontSize="small" />
                              <Typography variant="caption">
                                {article.views}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Categories Section */}
          <Box sx={{ mb: 6 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <ArticleIcon color="primary" />
              <Typography variant="h4" fontWeight={700}>
                Browse by Category
              </Typography>
            </Stack>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 4, fontSize: "1.1rem" }}
            >
              Find the right guides for your role and workflow needs
            </Typography>

            <Grid container spacing={4}>
              {enhancedCategories.map((category, index) => (
                <Grid item xs={12} sm={6} lg={3} key={category.key}>
                  <Fade in timeout={1000 + index * 150}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
                          transform: "translateY(-8px)",
                          borderColor: category.color,
                          "& .category-icon": {
                            transform: "scale(1.1) rotate(5deg)",
                          },
                        },
                      }}
                    >
                      {/* Popular badge */}
                      {category.popular && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            zIndex: 1,
                          }}
                        >
                          <Chip
                            icon={<StarIcon fontSize="small" />}
                            label="Popular"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      )}

                      <CardActionArea
                        onClick={() => navigate(`/help/${category.key}`)}
                        sx={{ height: "100%" }}
                      >
                        <CardContent
                          sx={{
                            p: 4,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Category Icon */}
                          <Box sx={{ mb: 3 }}>
                            <Avatar
                              className="category-icon"
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: `${category.color}15`,
                                fontSize: "1.8rem",
                                transition: "all 0.3s ease",
                                border: `2px solid ${category.color}30`,
                              }}
                            >
                              {category.icon}
                            </Avatar>
                          </Box>

                          {/* Category Title */}
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              mb: 2,
                              color: category.color,
                              lineHeight: 1.3,
                            }}
                          >
                            {category.title}
                          </Typography>

                          {/* Category Description */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 3,
                              flexGrow: 1,
                              lineHeight: 1.6,
                            }}
                          >
                            {category.description}
                          </Typography>

                          {/* Article Count */}
                          <Box sx={{ mt: "auto" }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Chip
                                label={`${category.articleCount} articles`}
                                size="small"
                                sx={{
                                  bgcolor: `${category.color}10`,
                                  color: category.color,
                                  fontWeight: 600,
                                }}
                              />
                              <ArrowForwardIcon
                                sx={{
                                  color: category.color,
                                  opacity: 0.7,
                                  transition: "transform 0.2s ease",
                                  ".MuiCard-root:hover &": {
                                    transform: "translateX(4px)",
                                  },
                                }}
                              />
                            </Stack>

                            {/* Tags */}
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {category.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: "0.7rem",
                                    opacity: 0.8,
                                    borderColor: `${category.color}40`,
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Quick Links Section */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Need More Help?
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <SupportIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Contact Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get personalized help from our support team
                  </Typography>
                  <Button variant="outlined" size="small">
                    Get Help
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <SpeedIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Quick Start
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New to the platform? Start with our basics
                  </Typography>
                  <Button variant="outlined" size="small">
                    Get Started
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.success.main,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <ArticleIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Video Tutorials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Watch step-by-step video guides
                  </Typography>
                  <Button variant="outlined" size="small">
                    Watch Now
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
      `}</style>
    </Container>
  );
};

export default HelpCenterPage;

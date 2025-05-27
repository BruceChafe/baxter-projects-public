// /src/pages/help/HelpCategoryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  useTheme,
  Fade,
  Skeleton,
  IconButton,
  Stack,
  Avatar,
  Badge,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  BookmarkBorder as BookmarkIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { helpArticles, helpCategories } from "./data/HelpArticles";

const HelpCategoryPage = () => {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");

  const currentCategory = helpCategories.find(
    (category) => category.key === categoryKey
  );

  useEffect(() => {
    if (currentCategory) {
      document.title = `${currentCategory.name} Guides | Help Center`;
    } else {
      document.title = "Category Not Found | Help Center";
    }
    setSearchTerm("");

    setTimeout(() => setLoading(false), 500);
  }, [categoryKey, currentCategory]);

  useEffect(() => {
    const categoryArticles = helpArticles.filter(
      (article) =>
        article.categories?.includes(categoryKey) ||
        article.category === categoryKey
    );

    if (searchTerm.trim() === "") {
      setFilteredArticles(categoryArticles);
    } else {
      const searchLower = searchTerm.toLowerCase();
      setFilteredArticles(
        categoryArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchLower) ||
            article.description.toLowerCase().includes(searchLower) ||
            (article.tags &&
              article.tags.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              ))
        )
      );
    }
  }, [categoryKey, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (!currentCategory) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.error.light}15, ${theme.palette.error.main}25)`,
              border: `1px solid ${theme.palette.error.light}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: theme.palette.error.main,
                  fontSize: "2rem",
                }}
              >
                ❌
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Category Not Found
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, maxWidth: 400, mx: "auto", opacity: 0.8 }}
            >
              We couldn't find the category you're looking for. It might have
              been moved or doesn't exist.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/help")}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
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
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ mb: 4, borderRadius: 3 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          sx={{ mb: 4, borderRadius: 2 }}
        />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={280}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Fade in timeout={600}>
        <Box>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
              mb: 4,
              "& .MuiBreadcrumbs-separator": {
                color: theme.palette.primary.main,
                opacity: 0.6,
              },
            }}
          >
            <Link
              to="/"
              style={{
                color: theme.palette.text.secondary,
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = theme.palette.primary.main)
              }
              onMouseLeave={(e) =>
                (e.target.style.color = theme.palette.text.secondary)
              }
            >
              Home
            </Link>
            <Link
              to="/help"
              style={{
                color: theme.palette.text.secondary,
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = theme.palette.primary.main)
              }
              onMouseLeave={(e) =>
                (e.target.style.color = theme.palette.text.secondary)
              }
            >
              Help Center
            </Link>
            <Typography
              color="primary"
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {currentCategory.name}
            </Typography>
          </Breadcrumbs>

          {/* Enhanced Category Header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
              color: "white",
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${theme.palette.primary.light}30`,
            }}
          >
            {/* Animated background elements */}
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                animation: "pulse 4s ease-in-out infinite",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                animation: "pulse 6s ease-in-out infinite reverse",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "rgba(255,255,255,0.2)",
                    fontSize: "1.5rem",
                  }}
                >
                  📚
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    gutterBottom
                    sx={{ mb: 0 }}
                  >
                    {currentCategory.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ opacity: 0.9, fontWeight: 400 }}
                  >
                    Comprehensive Guides
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  maxWidth: "70%",
                  opacity: 0.95,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                {currentCategory.description ||
                  `Explore our collection of ${currentCategory.name} tutorials and guides to help you get the most out of our platform.`}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<ArticleIcon />}
                  label={`${filteredArticles.length} Articles`}
                  size="medium"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(10px)",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
                <Chip
                  icon={<StarIcon />}
                  label="Expert Curated"
                  size="medium"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(10px)",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
              </Stack>
            </Box>
          </Paper>

          {/* Enhanced Search and Filters */}
          {/* <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper
            }}
          >
            <Stack 
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <TextField
                placeholder="Search guides and tutorials..."
                variant="outlined"
                size="medium"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ 
                  minWidth: { xs: '100%', md: '400px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.grey[50],
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  size="medium"
                  startIcon={<FilterListIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 100
                  }}
                >
                  Filter
                </Button>
                <Button 
                  variant="outlined" 
                  size="medium"
                  startIcon={<SortIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 100
                  }}
                >
                  Sort
                </Button>
              </Stack>
            </Stack>
          </Paper> */}

          {/* Results count with enhanced styling */}
          {/* {searchTerm && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3,
                borderRadius: 2,
                bgcolor: theme.palette.primary.light + '10',
                border: `1px solid ${theme.palette.primary.light}30`
              }}
            >
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                Found {filteredArticles.length} results for "{searchTerm}"
              </Typography>
            </Paper>
          )} */}

          {/* Enhanced Articles Grid */}
          {filteredArticles.length > 0 ? (
            <Grid container spacing={4}>
              {filteredArticles.map((article, index) => (
                <Grid item xs={12} sm={6} lg={4} key={article.slug}>
                  <Fade in timeout={600 + index * 100}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                          borderColor: theme.palette.primary.main,
                          transform: "translateY(-8px)",
                          "& .article-thumbnail": {
                            transform: "scale(1.05)",
                          },
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          navigate(`/help/article/${article.slug}`)
                        }
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          height: "100%",
                        }}
                      >
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            p: 3,
                          }}
                        >
                          {/* Article type badge */}
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              icon={<ArticleIcon fontSize="small" />}
                              label={article.type || "Guide"}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            />
                          </Box>

                          {/* Article title */}
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              mb: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.3,
                              minHeight: 66,
                            }}
                          >
                            {article.title}
                          </Typography>

                          {/* Article description */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 3,
                              flexGrow: 1,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.5,
                            }}
                          >
                            {article.description}
                          </Typography>

                          {/* Article metadata */}
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mb: 2, opacity: 0.7 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <TimeIcon fontSize="small" />
                              <Typography variant="caption">
                                5 min read
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <ViewIcon fontSize="small" />
                              <Typography variant="caption">
                                1.2k views
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <Box
                              sx={{
                                mt: "auto",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {article.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    fontSize: "0.7rem",
                                    bgcolor: theme.palette.grey[100],
                                    color: theme.palette.text.secondary,
                                    "&:hover": {
                                      bgcolor: theme.palette.grey[200],
                                    },
                                  }}
                                />
                              ))}
                              {article.tags.length > 2 && (
                                <Chip
                                  label={`+${article.tags.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Fade in timeout={600}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.grey[50]}, ${theme.palette.grey[100]}30)`,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 3,
                    bgcolor: theme.palette.grey[200],
                    fontSize: "2rem",
                  }}
                >
                  🔍
                </Avatar>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  No articles found
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
                >
                  {searchTerm
                    ? `We couldn't find any articles matching "${searchTerm}". Try adjusting your search terms or browse other categories.`
                    : `There are currently no articles in the ${currentCategory.name} category. Check back soon for new content!`}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setSearchTerm("")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 4,
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </Paper>
            </Fade>
          )}

          {/* Enhanced back button */}
          <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="large"
              component={Link}
              to="/help"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Back to All Categories
            </Button>
          </Box>
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
            transform: scale(1.1);
            opacity: 0.2;
          }
        }
      `}</style>
    </Container>
  );
};

export default HelpCategoryPage;

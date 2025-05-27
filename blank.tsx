<Grid container spacing={3}>
  {hasLicenseScanner && (
    <Grid item xs={12} md={4}>
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          minHeight: "240px",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          border: "2px dashed",
          borderColor: "secondary.main",
          bgcolor: alpha(theme.palette.secondary.main, 0.02),
          textAlign: "center",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            cursor: "pointer",
            boxShadow: 1,
          },
        }}
        onClick={() => setIsLicenseScannerOpen(true)}
      >
        <Box>
          <DocumentScannerIcon
            sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
          />
          <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
            Scan License
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {latestLicenseScan
              ? "You can rescan this visitor's ID"
              : "No license record found"}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  )}

  <Grid item xs={12} md={hasLicenseScanner ? 8 : 12}>
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 1,
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <Grid container spacing={2.5}>
        {[... /* your mapped details section here */].map((item, index) => (
          <Grid item xs={12} key={index}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                borderRadius: 1,
                bgcolor:
                  index % 2 === 0
                    ? "transparent"
                    : alpha(theme.palette.background.default, 0.5),
              }}
            >
              {item.icon}
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                  ml: 1.5,
                }}
              >
                {item.label}:
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color:
                    item.value && item.value !== "N/A"
                      ? "text.primary"
                      : "text.disabled",
                  fontWeight:
                    item.value && item.value !== "N/A" ? 500 : 400,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  </Grid>
</Grid>

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  Button,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';

import { getDestinationsApi } from '../api/trip';
import { PageHeader } from '../components/common/PageHeader';
import { AppCard } from '../components/common/AppCard';
import { ErrorState } from '../components/common/ErrorState';
import type { SelectedDestinationSummary } from '../types/trip';

export const DestinationsExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedForCompare, setSelectedForCompare] = useState<SelectedDestinationSummary[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['destinations'],
    queryFn: getDestinationsApi,
  });

  const destinations = responseData?.data || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSeasonChange = (event: any) => {
    setSeasonFilter(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleToggleCompare = (dest: SelectedDestinationSummary) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((d) => d.id === dest.id);
      if (exists) {
        return prev.filter((d) => d.id !== dest.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, dest];
    });
  };

  // Filter and sort destinations
  const filteredDestinations = destinations
    .filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dest.state && dest.state.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeason =
        seasonFilter === 'All' ||
        (dest.bestSeason && dest.bestSeason.toLowerCase() === seasonFilter.toLowerCase());

      return matchesSearch && matchesSeason;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'cost_asc') {
        return (a.averageDailyCost || 0) - (b.averageDailyCost || 0);
      }
      if (sortBy === 'cost_desc') {
        return (b.averageDailyCost || 0) - (a.averageDailyCost || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <Box sx={{ pb: 12 }}>
      <PageHeader
        title="Explore Destinations"
        subtitle="Browse and find curated spots to start your next travel adventure"
        action={
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/trips/create')}
            size="large"
          >
            Plan a New Trip
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mt: 3,
          mb: 4,
          p: 2.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        <TextField
          placeholder="Search by destination name, country or state..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }
          }}
          sx={{ flexGrow: 1 }}
        />

        <Stack direction="row" spacing={2} sx={{ minWidth: { md: 400 } }}>
          <FormControl fullWidth>
            <InputLabel id="season-filter-label">Best Season</InputLabel>
            <Select
              labelId="season-filter-label"
              value={seasonFilter}
              label="Best Season"
              onChange={handleSeasonChange}
            >
              <MenuItem value="All">All Seasons</MenuItem>
              <MenuItem value="Spring">Spring</MenuItem>
              <MenuItem value="Summer">Summer</MenuItem>
              <MenuItem value="Autumn">Autumn</MenuItem>
              <MenuItem value="Winter">Winter</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="rating">Highest Rating</MenuItem>
              <MenuItem value="cost_asc">Cost: Low to High</MenuItem>
              <MenuItem value="cost_desc">Cost: High to Low</MenuItem>
              <MenuItem value="name">Alphabetical</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <ErrorState
          title="Could not load destinations"
          message="There was an issue fetching the list of destinations. Please check your backend connection."
          onRetry={refetch}
        />
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {filteredDestinations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ExploreOutlinedIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No destinations match your filters.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredDestinations.map((dest) => {
                const isSelected = selectedForCompare.some((d) => d.id === dest.id);
                const isCompareLimitReached = selectedForCompare.length >= 3;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dest.id}>
                    <AppCard
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: isSelected ? '2px solid' : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        },
                      }}
                    >
                      {dest.imageUrl && (
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={dest.imageUrl}
                            alt={dest.name}
                          />
                          
                          {/* Comparison Checkbox */}
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCompare(dest);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              zIndex: 10,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: isSelected
                                ? 'primary.main'
                                : 'rgba(255, 255, 255, 0.85)',
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : '#FFFFFF',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              transition: 'all 0.2s',
                              opacity: isSelected || !isCompareLimitReached ? 1 : 0.5,
                              pointerEvents: isSelected || !isCompareLimitReached ? 'auto' : 'none',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: isSelected ? 'primary.main' : '#FFFFFF',
                              },
                            }}
                          >
                            {isSelected ? (
                              <CheckIcon sx={{ color: '#FFFFFF', fontSize: 16 }} />
                            ) : (
                              <AddIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                            )}
                          </Box>

                          {dest.bestSeason && (
                            <Chip
                              icon={<CalendarMonthOutlinedIcon style={{ fontSize: '0.9rem', color: '#1E293B' }} />}
                              label={dest.bestSeason}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 48,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)',
                                color: '#1E293B',
                                fontWeight: 600,
                                borderRadius: 1.5,
                              }}
                            />
                          )}
                          {dest.averageRating && (
                            <Chip
                              icon={<StarRateRoundedIcon style={{ color: '#F59E0B' }} />}
                              label={dest.averageRating.toFixed(1)}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)',
                                color: '#1E293B',
                                fontWeight: 700,
                                borderRadius: 1.5,
                              }}
                            />
                          )}
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 0.5 }}>
                          {dest.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          {dest.state ? `${dest.state}, ` : ''}{dest.country}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                          {dest.description}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <AttachMoneyIcon fontSize="small" color="primary" />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {dest.averageDailyCost}/day
                            </Typography>
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/trips/create');
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Plan Trip
                          </Button>
                        </Box>
                      </CardContent>
                    </AppCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Floating Bottom Comparison Panel */}
      {selectedForCompare.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '90%',
            maxWidth: 680,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.3)',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes slideUp': {
              from: { transform: 'translate(-50%, 100%)', opacity: 0 },
              to: { transform: 'translate(-50%, 0)', opacity: 1 },
            },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              Compare ({selectedForCompare.length}/3)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {selectedForCompare.map((dest) => (
                <Chip
                  key={dest.id}
                  label={dest.name}
                  onDelete={() => handleToggleCompare(dest)}
                  size="small"
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedForCompare([])}
              sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<CompareArrowsIcon />}
              onClick={() => setIsCompareOpen(true)}
              disabled={selectedForCompare.length < 2}
              sx={{
                fontWeight: 700,
                px: 3,
                textTransform: 'none',
                boxShadow: '0 4px 10px rgba(15, 44, 89, 0.2)',
              }}
            >
              Compare Now
            </Button>
          </Stack>
        </Box>
      )}

      {/* Comparison Modal Dialog */}
      <Dialog
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: { borderRadius: 4, overflow: 'hidden' }
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Compare Travel Destinations
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setIsCompareOpen(false)}
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table sx={{ minWidth: 600, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700, width: '22%', borderRight: '1px solid', borderColor: 'divider' }}>
                    Feature
                  </TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell
                      key={dest.id}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        p: 2,
                      }}
                    >
                      {dest.imageUrl && (
                        <Box
                          component="img"
                          src={dest.imageUrl}
                          alt={dest.name}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 2,
                            mb: 1.5,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                          }}
                        />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                        {dest.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {dest.state ? `${dest.state}, ` : ''}{dest.country}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Rating Row */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: 'divider' }}>Rating</TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell key={dest.id} align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <StarRateRoundedIcon style={{ color: '#F59E0B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {dest.averageRating ? dest.averageRating.toFixed(1) : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Daily Cost Row */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: 'divider' }}>Daily Cost Est.</TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell key={dest.id} align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        ${dest.averageDailyCost} / day
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Duration Row */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: 'divider' }}>Recommended Days</TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell key={dest.id} align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2">
                        {dest.minimumRecommendedDays && dest.maximumRecommendedDays
                          ? `${dest.minimumRecommendedDays} - ${dest.maximumRecommendedDays} days`
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Best Season Row */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: 'divider' }}>Best Season</TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell key={dest.id} align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                      <Chip
                        label={dest.bestSeason || 'All Year'}
                        size="small"
                        sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>

                {/* Description Row */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, verticalAlign: 'top', borderRight: '1px solid', borderColor: 'divider' }}>
                    Description
                  </TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell
                      key={dest.id}
                      align="left"
                      sx={{
                        verticalAlign: 'top',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        lineBreak: 'anywhere',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem', lineHeight: 1.4 }}>
                        {dest.description}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Action Row */}
                <TableRow>
                  <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}></TableCell>
                  {selectedForCompare.map((dest) => (
                    <TableCell key={dest.id} align="center" sx={{ borderRight: '1px solid', borderColor: 'divider', p: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => {
                          setIsCompareOpen(false);
                          navigate('/trips/create');
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 3,
                          boxShadow: '0 2px 8px rgba(255, 107, 74, 0.25)',
                        }}
                      >
                        Plan Trip Here
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'action.hover' }}>
          <Button onClick={() => setIsCompareOpen(false)} sx={{ fontWeight: 700 }}>
            Close comparison
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

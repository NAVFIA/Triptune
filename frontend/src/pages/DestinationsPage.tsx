import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, CardMedia, CircularProgress, Snackbar, Alert } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { getDestinationRecommendationsApi, selectDestinationApi } from '../api/trip';

export const DestinationsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId) return;
    const fetchRecommendations = async () => {
      try {
        const data = await getDestinationRecommendationsApi(Number(tripId));
        setRecommendations(data.data);
      } catch (err) {
        setError('Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [tripId]);

  const handleSelect = async (destinationId: number) => {
    try {
      setSelecting(true);
      await selectDestinationApi(Number(tripId), destinationId);
      navigate(`/trips/${tripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select destination');
      setSelecting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageHeader
        title="Destination Recommendations"
        subtitle="Top matches based on your trip preferences"
        action={
          <Button variant="outlined" onClick={() => navigate(`/trips/${tripId}`)}>
            Back to Details
          </Button>
        }
      />
      {recommendations.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>No recommendations found.</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {recommendations.map((rec) => (
            <Grid size={{xs: 12, md: 6, lg: 4}}   key={rec.destination.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {rec.destination.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={rec.destination.imageUrl}
                    alt={rec.destination.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {rec.destination.name}, {rec.destination.country}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rec.destination.description}
                  </Typography>
                  <Typography variant="body2"><strong>Score:</strong> {rec.score}</Typography>
                  <Typography variant="body2"><strong>Interests Match:</strong> {rec.interestsMatched}</Typography>
                  <Typography variant="body2"><strong>Mood Match:</strong> {rec.moodMatch}</Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    disabled={selecting}
                    onClick={() => handleSelect(rec.destination.id)}
                  >
                    {selecting ? 'Selecting...' : 'Select Destination'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

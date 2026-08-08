import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Stack,
  Grid
} from '@mui/material';
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
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Destination Recommendations"
        subtitle="Top matches generated using your Weka Random Forest model"
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
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={rec.destinationId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                {rec.imageUrl && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={rec.imageUrl}
                    alt={rec.destinationName}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {rec.destinationName}, {rec.state ? `${rec.state}, ` : ''}{rec.country}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rec.description}
                  </Typography>
                  
                  <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1.5, mb: 2 }}>
                    <Typography variant="body2"><strong>Overall Score:</strong> {rec.overallScore ? rec.overallScore.toFixed(0) : 0}%</Typography>
                    <Typography variant="body2"><strong>Mood Match:</strong> {rec.moodMatchScore ? rec.moodMatchScore.toFixed(0) : 0}%</Typography>
                    <Typography variant="body2"><strong>Interests Match:</strong> {rec.interestMatchScore ? rec.interestMatchScore.toFixed(0) : 0}%</Typography>
                    <Typography variant="body2"><strong>Budget Fit:</strong> {rec.budgetMatchScore ? rec.budgetMatchScore.toFixed(0) : 0}%</Typography>
                  </Box>

                  {rec.recommendationReasons && rec.recommendationReasons.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: 'success.main', mb: 0.5 }}>Reasons to Visit:</Typography>
                      <Stack spacing={0.5}>
                        {rec.recommendationReasons.map((reason: string, i: number) => (
                          <Typography key={i} variant="caption" color="text.secondary">• {reason}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {rec.possibleRisks && rec.possibleRisks.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: 'error.main', mb: 0.5 }}>Considerations:</Typography>
                      <Stack spacing={0.5}>
                        {rec.possibleRisks.map((risk: string, i: number) => (
                          <Typography key={i} variant="caption" color="text.secondary">• {risk}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    disabled={selecting}
                    onClick={() => handleSelect(rec.destinationId)}
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

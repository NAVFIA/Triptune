package com.triptune.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.triptune.backend.dto.trip.TripCreateRequest;
import com.triptune.backend.dto.trip.TripResponse;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.User;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @InjectMocks
    private TripService tripService;

    private User mockUser;

    @BeforeEach
    public void setup() {
        mockUser = User.builder().id(1L).email("test@example.com").fullName("Test User").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test@example.com", "password")
        );
    }

    @Test
    public void testCreateTrip() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tripRepository.save(any())).thenAnswer(i -> {
            Trip t = (Trip) i.getArguments()[0];
            t.setId(100L);
            return t;
        });

        TripCreateRequest req = new TripCreateRequest();
        req.setTripName("Paris Trip");
        req.setStartingLocation("London");
        req.setStartDate(LocalDate.now());
        req.setEndDate(LocalDate.now().plusDays(5));
        req.setNumberOfTravellers(2);
        req.setTotalBudget(new BigDecimal("1000"));

        TripResponse res = tripService.createTripForCurrentUser(req);
        
        assertNotNull(res);
        assertEquals(100L, res.getTripId());
        assertEquals("Paris Trip", res.getTripName());
        assertEquals(6, res.getNumberOfDays());
        assertEquals(new BigDecimal("500.00"), res.getPerPersonBudget());
    }

    @Test
    public void testInvalidDateRange() {
        TripCreateRequest req = new TripCreateRequest();
        req.setStartDate(LocalDate.now().plusDays(5));
        req.setEndDate(LocalDate.now());

        assertThrows(IllegalArgumentException.class, () -> tripService.createTripForCurrentUser(req));
    }

    @Test
    public void testUserCannotAccessAnotherUsersTrip() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tripRepository.findByIdAndCreatedById(100L, 1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> tripService.getTripByIdForCurrentUser(100L));
    }

    @Test
    public void testSelectDestination() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        Trip mockTrip = Trip.builder().id(100L).createdBy(mockUser).build();
        when(tripRepository.findByIdAndCreatedById(100L, 1L)).thenReturn(Optional.of(mockTrip));
        
        Destination mockDest = Destination.builder().id(50L).name("Paris").build();
        when(destinationRepository.findById(50L)).thenReturn(Optional.of(mockDest));
        
        when(tripRepository.save(any())).thenReturn(mockTrip);

        TripResponse res = tripService.selectDestinationForTrip(100L, 50L);
        assertNotNull(res.getSelectedDestination());
        assertEquals(50L, res.getSelectedDestination().getId());
        assertEquals("DESTINATION_SELECTED", res.getStatus().name());
    }
}

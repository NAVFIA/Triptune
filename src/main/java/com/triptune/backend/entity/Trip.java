package com.triptune.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.triptune.backend.enums.BudgetFlexibility;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.enums.TravellerType;
import com.triptune.backend.enums.TripStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User createdBy;

    @NotBlank(message = "Trip name is required")
    @Size(max = 150, message = "Trip name must be at most 150 characters")
    @Column(name = "trip_name", nullable = false, length = 150)
    private String tripName;

    @NotBlank(message = "Starting location is required")
    @Size(max = 150, message = "Starting location must be at most 150 characters")
    @Column(name = "starting_location", nullable = false, length = 150)
    private String startingLocation;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Min(value = 1, message = "Number of days must be at least 1")
    @Column(name = "number_of_days")
    private Integer numberOfDays;

    @Min(value = 1, message = "Number of travellers must be at least 1")
    @Column(name = "number_of_travellers", nullable = false)
    private Integer numberOfTravellers;

    @PositiveOrZero
    @Column(name = "number_of_adults")
    private Integer numberOfAdults;

    @PositiveOrZero
    @Column(name = "number_of_children")
    private Integer numberOfChildren;

    @PositiveOrZero
    @Column(name = "number_of_elderly")
    private Integer numberOfElderly;

    @Enumerated(EnumType.STRING)
    @Column(name = "traveller_type", length = 30)
    private TravellerType travellerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_pace", length = 30)
    private TravelPace travelPace;

    @ElementCollection(targetClass = Mood.class)
    @CollectionTable(name = "trip_moods", joinColumns = @JoinColumn(name = "trip_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "mood")
    @Builder.Default
    private Set<Mood> moods = new HashSet<>();

    @ElementCollection(targetClass = Interest.class)
    @CollectionTable(name = "trip_interests", joinColumns = @JoinColumn(name = "trip_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "interest")
    @Builder.Default
    private Set<Interest> interests = new HashSet<>();

    @PositiveOrZero(message = "Budget cannot be negative")
    @Column(name = "total_budget")
    private BigDecimal totalBudget;

    @PositiveOrZero(message = "Budget cannot be negative")
    @Column(name = "per_person_budget")
    private BigDecimal perPersonBudget;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_flexibility", length = 30)
    private BudgetFlexibility budgetFlexibility;

    @Size(max = 100, message = "Preferred transport must be at most 100 characters")
    @Column(name = "preferred_transport", length = 100)
    private String preferredTransport;

    @PositiveOrZero(message = "Maximum travel distance cannot be negative")
    @Column(name = "maximum_travel_distance")
    private Double maximumTravelDistance;

    @Size(max = 500, message = "Dietary preferences must be at most 500 characters")
    @Column(name = "dietary_preferences", length = 500)
    private String dietaryPreferences;

    @Size(max = 500, message = "Accessibility requirements must be at most 500 characters")
    @Column(name = "accessibility_requirements", length = 500)
    private String accessibilityRequirements;

    @Size(max = 1000, message = "Activities to avoid must be at most 1000 characters")
    @Column(name = "activities_to_avoid", length = 1000)
    private String activitiesToAvoid;

    @Column(name = "preferred_wake_up_time")
    private LocalTime preferredWakeUpTime;

    @Column(name = "preferred_sleep_time")
    private LocalTime preferredSleepTime;

    @Min(value = 1, message = "Crowd tolerance must be at least 1")
    @Max(value = 10, message = "Crowd tolerance must be at most 10")
    @Column(name = "crowd_tolerance")
    private Integer crowdTolerance;

    @PositiveOrZero(message = "Maximum walking distance cannot be negative")
    @Column(name = "maximum_walking_distance")
    private Double maximumWalkingDistance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_destination_id")
    @JsonIgnore
    private Destination selectedDestination;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private TripStatus status = TripStatus.DRAFT;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trip_rejected_activities", joinColumns = @JoinColumn(name = "trip_id"))
    @Column(name = "activity_id")
    @Builder.Default
    private Set<Long> rejectedActivityIds = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

package com.triptune.backend.entity;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.enums.TravellerType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_travel_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTravelProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    @JsonIgnore
    private User user;

    @ElementCollection(targetClass = Mood.class)
    @CollectionTable(name = "user_preferred_moods", joinColumns = @JoinColumn(name = "user_travel_profile_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "mood")
    @Builder.Default
    private Set<Mood> preferredMoods = new HashSet<>();

    @ElementCollection(targetClass = Interest.class)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_travel_profile_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "interest")
    @Builder.Default
    private Set<Interest> interests = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "default_traveller_type", length = 30)
    private TravellerType defaultTravellerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_travel_pace", length = 30)
    private TravelPace preferredTravelPace;

    @Size(max = 100, message = "Preferred transport must be at most 100 characters")
    @Column(name = "preferred_transport", length = 100)
    private String preferredTransport;

    @PositiveOrZero(message = "Maximum travel distance cannot be negative")
    @Column(name = "maximum_travel_distance")
    private Double maximumTravelDistance;

    @Min(value = 1, message = "Crowd tolerance must be at least 1")
    @Max(value = 10, message = "Crowd tolerance must be at most 10")
    @Column(name = "crowd_tolerance")
    private Integer crowdTolerance;

    @PositiveOrZero(message = "Maximum walking distance cannot be negative")
    @Column(name = "maximum_walking_distance")
    private Double maximumWalkingDistance;

    @Size(max = 500, message = "Dietary preferences must be at most 500 characters")
    @Column(name = "dietary_preferences", length = 500)
    private String dietaryPreferences;

    @Size(max = 500, message = "Accessibility requirements must be at most 500 characters")
    @Column(name = "accessibility_requirements", length = 500)
    private String accessibilityRequirements;

    @Column(name = "preferred_wake_up_time")
    private LocalTime preferredWakeUpTime;

    @Column(name = "preferred_sleep_time")
    private LocalTime preferredSleepTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

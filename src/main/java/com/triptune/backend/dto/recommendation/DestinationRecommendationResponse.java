package com.triptune.backend.dto.recommendation;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationRecommendationResponse {

    private Long destinationId;
    private String destinationName;
    private String state;
    private String country;
    private String description;
    private String imageUrl;
    
    private Double moodMatchScore;
    private Double groupCompatibilityScore;
    private Double interestMatchScore;
    private Double budgetMatchScore;
    private Double distanceConvenienceScore;
    private Double ratingScore;
    private Double profileCompatibilityScore;
    
    private Double overallScore;
    
    private BigDecimal estimatedCostPerPerson;
    
    private List<String> recommendationReasons;
    private List<String> possibleRisks;
}

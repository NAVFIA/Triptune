package com.triptune.backend.dto.destination;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationResponse {

    private Long id;
    private String name;
    private String country;
    private String description;
    private String imageUrl;
    private String budgetLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

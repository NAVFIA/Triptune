package com.triptune.backend.dto.group;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripExpenseCreateRequest {

    @NotNull(message = "Expense amount is required")
    @Positive(message = "Expense amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Expense description is required")
    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;
}

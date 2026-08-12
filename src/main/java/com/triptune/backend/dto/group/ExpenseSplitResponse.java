package com.triptune.backend.dto.group;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplitResponse {
    private String fromUserName;
    private String fromUserEmail;
    private String toUserName;
    private String toUserEmail;
    private BigDecimal amount;
}

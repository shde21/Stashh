package com.startupinvestment.platform.fundraising;

import java.math.BigDecimal;

public record CommitmentRequest(
        BigDecimal amount,
        Long shares
) {
}

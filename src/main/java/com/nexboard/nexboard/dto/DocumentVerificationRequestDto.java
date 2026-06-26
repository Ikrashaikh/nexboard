package com.nexboard.nexboard.dto;

import com.nexboard.nexboard.enums.VerificationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentVerificationRequestDto {

    private VerificationStatus verificationStatus;

    private String remarks;
}

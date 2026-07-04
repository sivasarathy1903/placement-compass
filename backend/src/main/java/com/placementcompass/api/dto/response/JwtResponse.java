package com.placementcompass.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class JwtResponse {
    
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String refreshToken;
    private String id;
    private String email;
    private List<String> roles;
}

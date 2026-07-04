package com.placementcompass.api.controller;

import com.placementcompass.api.dto.request.LoginRequest;
import com.placementcompass.api.dto.request.RegisterRequest;
import com.placementcompass.api.dto.request.TokenRefreshRequest;
import com.placementcompass.api.dto.response.JwtResponse;
import com.placementcompass.api.dto.response.MessageResponse;
import com.placementcompass.api.dto.response.TokenRefreshResponse;
import com.placementcompass.api.entity.Profile;
import com.placementcompass.api.entity.RefreshToken;
import com.placementcompass.api.entity.Role;
import com.placementcompass.api.entity.User;
import com.placementcompass.api.exception.TokenRefreshException;
import com.placementcompass.api.repository.ProfileRepository;
import com.placementcompass.api.repository.UserRepository;
import com.placementcompass.api.security.JwtUtils;
import com.placementcompass.api.security.RefreshTokenService;
import com.placementcompass.api.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .roles(roles)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_STUDENT); // default role for users

        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-initialize profile for the user
        Profile profile = Profile.builder()
                .userId(savedUser.getId())
                .studentName(signUpRequest.getStudentName())
                .build();
        profileRepository.save(profile);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));

        refreshToken = refreshTokenService.verifyExpiration(refreshToken);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "User not found"));

        String accessToken = jwtUtils.generateTokenFromUsername(user.getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new TokenRefreshResponse(accessToken, newRefreshToken.getToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            refreshTokenService.deleteByUserId(userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Log out successful!"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: User not logged in"));
    }
}

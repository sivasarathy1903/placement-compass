package com.placementcompass.api.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.placementcompass.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@Getter
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        // role.name() returns the enum constant name exactly as declared:
        //   Role.ROLE_STUDENT → "ROLE_STUDENT"
        //   Role.ROLE_ADMIN   → "ROLE_ADMIN"
        // Spring Security's hasRole('STUDENT')  checks for "ROLE_STUDENT" (prepends ROLE_)
        // Spring Security's hasAuthority('ROLE_STUDENT') checks the string directly.
        // Both work correctly with this mapping.
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .<GrantedAuthority>map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

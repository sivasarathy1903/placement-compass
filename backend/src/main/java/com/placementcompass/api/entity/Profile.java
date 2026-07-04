package com.placementcompass.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String studentName;

    private String college;

    private String department;

    private Integer graduationYear;

    @Builder.Default
    private Map<String, String> socialLinks = new HashMap<>();

    @Builder.Default
    private List<String> skills = new ArrayList<>();
}

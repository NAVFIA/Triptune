package com.triptune.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TripControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testRequestWithoutJwtIsRejected() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/trips", String.class);
        
        // Without JWT, Spring Security should return 401 Unauthorized or 403 Forbidden
        assertTrue(response.getStatusCode() == HttpStatus.UNAUTHORIZED || response.getStatusCode() == HttpStatus.FORBIDDEN);
    }
}

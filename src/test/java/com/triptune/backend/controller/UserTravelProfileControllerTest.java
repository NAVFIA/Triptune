package com.triptune.backend.controller;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.triptune.backend.service.UserTravelProfileService;

@SpringBootTest
public class UserTravelProfileControllerTest {

    @Autowired
    private UserTravelProfileService profileService;

    @Test
    public void contextLoads() {
        assertNotNull(profileService);
        assertTrue(true, "Service injected successfully");
    }
}

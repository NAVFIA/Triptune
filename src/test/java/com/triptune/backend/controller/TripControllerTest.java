package com.triptune.backend.controller;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TripControllerTest {

    @Autowired
    private TripController tripController;

    @Test
    public void contextLoads() {
        assertNotNull(tripController);
    }
}

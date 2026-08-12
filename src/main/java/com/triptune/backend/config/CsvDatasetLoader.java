package com.triptune.backend.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import org.springframework.jdbc.core.JdbcTemplate;
import com.triptune.backend.entity.UserInteraction;
import com.triptune.backend.repository.UserInteractionRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class CsvDatasetLoader implements CommandLineRunner {

    private final UserInteractionRepository userInteractionRepository;
    private final JdbcTemplate jdbcTemplate;

    public CsvDatasetLoader(UserInteractionRepository userInteractionRepository, JdbcTemplate jdbcTemplate) {
        this.userInteractionRepository = userInteractionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Altering trip_photos column type to TEXT...");
            jdbcTemplate.execute("ALTER TABLE trip_photos ALTER COLUMN image_url TYPE TEXT;");
            log.info("Altered trip_photos column successfully.");
        } catch (Exception e) {
            log.warn("Could not alter column type: {}", e.getMessage());
        }

        long count = userInteractionRepository.count();
        if (count > 0) {
            log.info("user_interactions database table already initialized with {} records. Skipping CSV loading.", count);
            return;
        }

        log.info("Initializing user_interactions table from travel_interactions.csv...");

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("data/travel_interactions.csv")))) {
            
            String line;
            String header = br.readLine(); // Skip header row
            if (header == null) {
                log.error("travel_interactions.csv is empty or missing headers!");
                return;
            }

            int loaded = 0;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                String[] values = line.split(",");
                if (values.length < 7) {
                    continue;
                }

                UserInteraction interaction = UserInteraction.builder()
                        .moodMatchScore(Double.parseDouble(values[0]))
                        .paceCompatibilityScore(Double.parseDouble(values[1]))
                        .budgetMatchScore(Double.parseDouble(values[2]))
                        .distanceScore(Double.parseDouble(values[3]))
                        .groupScore(Double.parseDouble(values[4]))
                        .ratingScore(Double.parseDouble(values[5]))
                        .selected(Double.parseDouble(values[6]))
                        .build();

                userInteractionRepository.save(interaction);
                loaded++;
            }
            log.info("Successfully loaded {} records from travel_interactions.csv into database.", loaded);
        } catch (Exception e) {
            log.error("Error loading travel_interactions.csv dataset: ", e);
        }
    }
}

package com.triptune.backend.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Activity;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.ActivityRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
@Order(1) // Run first to ensure destinations exist before user interactions load if they refer to them
public class CsvDestinationSeeder implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;

    public CsvDestinationSeeder(DestinationRepository destinationRepository, ActivityRepository activityRepository) {
        this.destinationRepository = destinationRepository;
        this.activityRepository = activityRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long destCount = destinationRepository.count();
        if (destCount > 0) {
            log.info("Destinations table already initialized with {} records. Skipping seeding.", destCount);
            return;
        }

        log.info("Seeding destinations from destinations.csv...");
        Map<String, Destination> destinationMap = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("data/destinations.csv")))) {
            
            String line;
            br.readLine(); // skip headers
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // Split ignoring commas inside quotes
                if (values.length < 12) continue;

                String name = cleanQuotes(values[0]);
                Destination destination = Destination.builder()
                        .name(name)
                        .country(cleanQuotes(values[1]))
                        .description(cleanQuotes(values[2]))
                        .imageUrl(cleanQuotes(values[3]))
                        .state(cleanQuotes(values[4]))
                        .latitude(Double.parseDouble(values[5]))
                        .longitude(Double.parseDouble(values[6]))
                        .averageDailyCost(Double.parseDouble(values[7]))
                        .minimumRecommendedDays(Integer.parseInt(values[8]))
                        .maximumRecommendedDays(Integer.parseInt(values[9]))
                        .averageRating(Double.parseDouble(values[10]))
                        .bestSeason(cleanQuotes(values[11]))
                        .active(true)
                        .build();

                Destination saved = destinationRepository.save(destination);
                destinationMap.put(name, saved);
            }
            log.info("Seeded {} destinations.", destinationMap.size());
        } catch (Exception e) {
            log.error("Failed to seed destinations: ", e);
        }

        log.info("Seeding activities from activities.csv...");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("data/activities.csv")))) {
            
            String line;
            br.readLine(); // skip headers
            int activityCount = 0;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (values.length < 13) continue;

                String destName = cleanQuotes(values[0]);
                Destination dest = destinationMap.get(destName);
                if (dest == null) {
                    // Try looking it up from database if map is empty
                    dest = destinationRepository.findByName(destName).orElse(null);
                }
                
                if (dest == null) {
                    log.warn("Destination '{}' not found for activity '{}'. Skipping.", destName, values[1]);
                    continue;
                }

                Activity activity = Activity.builder()
                        .destination(dest)
                        .name(cleanQuotes(values[1]))
                        .description(cleanQuotes(values[2]))
                        .durationMinutes(Integer.parseInt(values[3]))
                        .estimatedCost(Double.parseDouble(values[4]))
                        .openingTime(cleanQuotes(values[5]))
                        .closingTime(cleanQuotes(values[6]))
                        .energyLevel(cleanQuotes(values[7]))
                        .indoor(Boolean.parseBoolean(values[8]))
                        .weatherDependent(Boolean.parseBoolean(values[9]))
                        .bookingRequired(Boolean.parseBoolean(values[10]))
                        .rating(Double.parseDouble(values[11]))
                        .category(cleanQuotes(values[12]))
                        .imageUrl(values.length > 13 ? cleanQuotes(values[13]) : "")
                        .active(true)
                        .build();

                activityRepository.save(activity);
                activityCount++;
            }
            log.info("Seeded {} activities.", activityCount);
        } catch (Exception e) {
            log.error("Failed to seed activities: ", e);
        }
    }

    private String cleanQuotes(String s) {
        if (s == null) return "";
        s = s.trim();
        if (s.startsWith("\"") && s.endsWith("\"")) {
            s = s.substring(1, s.length() - 1);
        }
        return s.replace("\"\"", "\"");
    }
}

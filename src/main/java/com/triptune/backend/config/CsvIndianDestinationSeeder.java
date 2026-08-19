package com.triptune.backend.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Activity;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.ActivityRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
@Order(2) // Runs after CsvDestinationSeeder to prevent database lockups
public class CsvIndianDestinationSeeder implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;

    // Predefined coordinates mapping for the Indian destinations
    private static final Map<String, Coordinate> COORDINATES_MAP = new HashMap<>();
    // Predefined state mapping for the Indian destinations
    private static final Map<String, String> STATE_MAP = new HashMap<>();

    private static class Coordinate {
        final double latitude;
        final double longitude;

        Coordinate(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    static {
        // Coordinate mappings
        COORDINATES_MAP.put("delhi", new Coordinate(28.6139, 77.2090));
        COORDINATES_MAP.put("mumbai", new Coordinate(19.0760, 72.8777));
        COORDINATES_MAP.put("jaipur", new Coordinate(26.9124, 75.7873));
        COORDINATES_MAP.put("udaipur", new Coordinate(24.5854, 73.7125));
        COORDINATES_MAP.put("gangtok", new Coordinate(27.3314, 88.6138));
        COORDINATES_MAP.put("gulmarg", new Coordinate(34.0484, 74.3805));
        COORDINATES_MAP.put("agra", new Coordinate(27.1767, 78.0081));
        COORDINATES_MAP.put("andaman and nicobar", new Coordinate(11.7401, 92.6586));
        COORDINATES_MAP.put("manali", new Coordinate(32.2396, 77.1887));
        COORDINATES_MAP.put("goa", new Coordinate(15.2993, 74.1240));
        COORDINATES_MAP.put("alleppey", new Coordinate(9.4981, 76.3388));
        COORDINATES_MAP.put("srinagar", new Coordinate(34.0837, 74.7973));
        COORDINATES_MAP.put("amritsar", new Coordinate(31.6340, 74.8723));
        COORDINATES_MAP.put("shillong", new Coordinate(25.5788, 91.8831));
        COORDINATES_MAP.put("munnar", new Coordinate(10.0889, 77.0595));
        COORDINATES_MAP.put("ooty", new Coordinate(11.4102, 76.6950));
        COORDINATES_MAP.put("darjeeling", new Coordinate(27.0410, 88.2627));
        COORDINATES_MAP.put("ladakh", new Coordinate(34.1526, 77.5771));
        COORDINATES_MAP.put("rishikesh", new Coordinate(30.0869, 78.2676));
        COORDINATES_MAP.put("varanasi", new Coordinate(25.3176, 82.9739));
        COORDINATES_MAP.put("coorg", new Coordinate(12.3375, 75.8069));
        COORDINATES_MAP.put("mcleodganj", new Coordinate(32.2426, 76.3213));
        COORDINATES_MAP.put("kashmir", new Coordinate(34.0837, 74.7973));
        COORDINATES_MAP.put("jaisalmer", new Coordinate(26.9157, 70.9083));
        COORDINATES_MAP.put("kodaikanal", new Coordinate(10.2381, 77.4892));
        COORDINATES_MAP.put("nainital", new Coordinate(29.3803, 79.4636));
        COORDINATES_MAP.put("shimla", new Coordinate(31.1048, 77.1734));
        COORDINATES_MAP.put("lakshadweep", new Coordinate(10.5667, 72.6333));
        COORDINATES_MAP.put("jodhpur", new Coordinate(26.2389, 73.0243));
        COORDINATES_MAP.put("kolkata", new Coordinate(22.5726, 88.3639));
        COORDINATES_MAP.put("mussoorie", new Coordinate(30.4598, 78.0750));
        COORDINATES_MAP.put("pondicherry", new Coordinate(11.9416, 79.8083));
        COORDINATES_MAP.put("pahalgam", new Coordinate(34.0161, 75.3150));
        COORDINATES_MAP.put("golden triangle india", new Coordinate(27.1767, 78.0081));
        COORDINATES_MAP.put("varkala", new Coordinate(8.7305, 76.7032));
        COORDINATES_MAP.put("kanyakumari", new Coordinate(8.0883, 77.5385));
        COORDINATES_MAP.put("dalhousie", new Coordinate(32.5387, 75.9710));
        COORDINATES_MAP.put("vaishno devi", new Coordinate(32.9934, 74.9529));
        COORDINATES_MAP.put("bangalore", new Coordinate(12.9716, 77.5946));
        COORDINATES_MAP.put("chennai", new Coordinate(13.0827, 80.2707));
        COORDINATES_MAP.put("ajanta and ellora", new Coordinate(20.0268, 75.1770));
        COORDINATES_MAP.put("shimoga (shivamogga)", new Coordinate(13.9299, 75.5681));
        COORDINATES_MAP.put("visakhapatnam", new Coordinate(17.6868, 83.2185));
        COORDINATES_MAP.put("jibhi", new Coordinate(31.6366, 77.3503));
        COORDINATES_MAP.put("pune", new Coordinate(18.5204, 73.8567));
        COORDINATES_MAP.put("vrindavan", new Coordinate(27.5650, 77.6593));
        COORDINATES_MAP.put("coimbatore", new Coordinate(11.0168, 76.9558));
        COORDINATES_MAP.put("lucknow", new Coordinate(26.8467, 80.9462));
        COORDINATES_MAP.put("dharamshala", new Coordinate(32.2190, 76.3234));
        COORDINATES_MAP.put("gwalior", new Coordinate(26.2183, 78.1828));
        COORDINATES_MAP.put("khandala", new Coordinate(18.7602, 73.3734));
        COORDINATES_MAP.put("kovalam", new Coordinate(8.4004, 76.9787));
        COORDINATES_MAP.put("madikeri", new Coordinate(12.4244, 75.7382));
        COORDINATES_MAP.put("matheran", new Coordinate(18.9827, 73.2718));
        COORDINATES_MAP.put("kalimpong", new Coordinate(27.0594, 88.4689));
        COORDINATES_MAP.put("thanjavur", new Coordinate(10.7870, 79.1378));
        COORDINATES_MAP.put("neil island", new Coordinate(11.8322, 93.0531));

        // State mappings
        STATE_MAP.put("delhi", "Delhi");
        STATE_MAP.put("mumbai", "Maharashtra");
        STATE_MAP.put("pune", "Maharashtra");
        STATE_MAP.put("ajanta and ellora", "Maharashtra");
        STATE_MAP.put("jaipur", "Rajasthan");
        STATE_MAP.put("udaipur", "Rajasthan");
        STATE_MAP.put("jaisalmer", "Rajasthan");
        STATE_MAP.put("jodhpur", "Rajasthan");
        STATE_MAP.put("gulmarg", "Jammu and Kashmir");
        STATE_MAP.put("srinagar", "Jammu and Kashmir");
        STATE_MAP.put("pahalgam", "Jammu and Kashmir");
        STATE_MAP.put("kashmir", "Jammu and Kashmir");
        STATE_MAP.put("vaishno devi", "Jammu and Kashmir");
        STATE_MAP.put("gangtok", "Sikkim");
        STATE_MAP.put("agra", "Uttar Pradesh");
        STATE_MAP.put("vrindavan", "Uttar Pradesh");
        STATE_MAP.put("lucknow", "Uttar Pradesh");
        STATE_MAP.put("andaman and nicobar", "Andaman and Nicobar Islands");
        STATE_MAP.put("neil island", "Andaman and Nicobar Islands");
        STATE_MAP.put("manali", "Himachal Pradesh");
        STATE_MAP.put("shimla", "Himachal Pradesh");
        STATE_MAP.put("dharamshala", "Himachal Pradesh");
        STATE_MAP.put("dalhousie", "Himachal Pradesh");
        STATE_MAP.put("jibhi", "Himachal Pradesh");
        STATE_MAP.put("goa", "Goa");
        STATE_MAP.put("alleppey", "Kerala");
        STATE_MAP.put("munnar", "Kerala");
        STATE_MAP.put("varkala", "Kerala");
        STATE_MAP.put("kovalam", "Kerala");
        STATE_MAP.put("amritsar", "Punjab");
        STATE_MAP.put("shillong", "Meghalaya");
        STATE_MAP.put("ooty", "Tamil Nadu");
        STATE_MAP.put("kanyakumari", "Tamil Nadu");
        STATE_MAP.put("coimbatore", "Tamil Nadu");
        STATE_MAP.put("chennai", "Tamil Nadu");
        STATE_MAP.put("thanjavur", "Tamil Nadu");
        STATE_MAP.put("darjeeling", "West Bengal");
        STATE_MAP.put("kolkata", "West Bengal");
        STATE_MAP.put("kalimpong", "West Bengal");
        STATE_MAP.put("ladakh", "Ladakh");
        STATE_MAP.put("rishikesh", "Uttarakhand");
        STATE_MAP.put("nainital", "Uttarakhand");
        STATE_MAP.put("mussoorie", "Uttarakhand");
        STATE_MAP.put("char dham yatra", "Uttarakhand");
        STATE_MAP.put("coorg", "Karnataka");
        STATE_MAP.put("bangalore", "Karnataka");
        STATE_MAP.put("madikeri", "Karnataka");
        STATE_MAP.put("shimoga (shivamogga)", "Karnataka");
        STATE_MAP.put("visakhapatnam", "Andhra Pradesh");
        STATE_MAP.put("gwalior", "Madhya Pradesh");
        STATE_MAP.put("pondicherry", "Puducherry");
        STATE_MAP.put("lakshadweep", "Lakshadweep");
    }

    private static final String[] TRAVEL_IMAGES = {
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da", // Taj Mahal
        "https://images.unsplash.com/photo-1548013146-72479768bada", // Varanasi
        "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1", // Kerala Backwaters
        "https://images.unsplash.com/photo-1561361513-2d000a50f0db", // Goa beach
        "https://images.unsplash.com/photo-1598325176527-31df7189c4e6", // Shimla hill station
        "https://images.unsplash.com/photo-1506461883276-594a12b11db3", // Mountain view
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1", // Lake view
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"  // Beach view
    };

    public CsvIndianDestinationSeeder(DestinationRepository destinationRepository, ActivityRepository activityRepository) {
        this.destinationRepository = destinationRepository;
        this.activityRepository = activityRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (destinationRepository.existsByName("Delhi")) {
            log.info("Destinations table is already seeded with Indian destinations. Skipping CsvIndianDestinationSeeder.");
            return;
        }

        log.info("Seeding Indian destinations from holidify.csv...");
        Map<String, Destination> destinationMap = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("data/holidify.csv")))) {
            
            String line;
            String header = br.readLine(); // Skip header
            if (header == null) {
                log.warn("holidify.csv is empty or missing headers!");
                return;
            }

            int count = 0;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (values.length < 5) continue;

                String cityName = cleanQuotes(values[1]).trim();
                String key = cityName.toLowerCase().trim();
                
                if (destinationMap.containsKey(key)) {
                    continue; // Skip duplicate cities in holidify.csv
                }
                
                Coordinate coord = COORDINATES_MAP.get(key);
                double lat = coord != null ? coord.latitude : 20.5937 + (Math.random() - 0.5) * 5.0;
                double lon = coord != null ? coord.longitude : 78.9629 + (Math.random() - 0.5) * 5.0;

                String state = STATE_MAP.getOrDefault(key, "India");

                double rating = 4.5;
                try {
                    rating = Double.parseDouble(cleanQuotes(values[2]).trim());
                } catch (NumberFormatException ignored) {}

                double avgDailyCost = 35.0 * 80.0;
                if (rating > 4.7) {
                    avgDailyCost = 65.0 * 80.0;
                } else if (rating > 4.5) {
                    avgDailyCost = 50.0 * 80.0;
                } else if (rating < 4.3) {
                    avgDailyCost = 25.0 * 80.0;
                }

                String description = cleanQuotes(values[3]);
                if (description.length() > 950) {
                    description = description.substring(0, 950) + "...";
                }

                String bestSeason = cleanQuotes(values[4]);
                if (bestSeason.length() > 45) {
                    bestSeason = bestSeason.substring(0, 45);
                }

                String imageUrl = TRAVEL_IMAGES[count % TRAVEL_IMAGES.length];

                Destination dest = Destination.builder()
                        .name(cityName)
                        .country("India")
                        .description(description)
                        .imageUrl(imageUrl)
                        .state(state)
                        .latitude(lat)
                        .longitude(lon)
                        .averageDailyCost(avgDailyCost)
                        .minimumRecommendedDays(2)
                        .maximumRecommendedDays(5)
                        .averageRating(rating)
                        .bestSeason(bestSeason)
                        .active(true)
                        .build();

                Destination savedDest = destinationRepository.save(dest);
                destinationMap.put(cityName.toLowerCase().trim(), savedDest);
                count++;
            }
            log.info("Successfully seeded {} Indian destinations.", count);
        } catch (Exception e) {
            log.error("Failed to seed Indian destinations from holidify.csv: ", e);
        }

        // Pass 2: Seed real activities from indian_places.csv
        log.info("Seeding real activities from indian_places.csv...");
        Map<String, Integer> cityActivityCounts = new HashMap<>();
        int realActivityCount = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream("data/indian_places.csv")))) {
            
            String line;
            String header = br.readLine(); // Skip header
            if (header == null) {
                log.warn("indian_places.csv is empty or missing headers!");
                return;
            }

            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (values.length < 16) continue;

                String cityName = cleanQuotes(values[3]).trim();
                Destination dest = destinationMap.get(cityName.toLowerCase().trim());
                if (dest == null) {
                    // Try looking it up from DB directly in case of mapping offsets
                    dest = destinationRepository.findByName(cityName).orElse(null);
                }

                if (dest == null) {
                    continue; // Skip activities for destinations we didn't import
                }

                String sightName = cleanQuotes(values[4]).trim();
                String type = cleanQuotes(values[5]).trim();
                String year = cleanQuotes(values[6]).trim();
                String sig = cleanQuotes(values[12]).trim();

                double hours = 2.0;
                try {
                    hours = Double.parseDouble(cleanQuotes(values[7]).trim());
                } catch (NumberFormatException ignored) {}
                int durationMinutes = (int) (hours * 60.0);
                if (durationMinutes <= 0) durationMinutes = 120;

                double rating = 4.5;
                try {
                    rating = Double.parseDouble(cleanQuotes(values[8]).trim());
                } catch (NumberFormatException ignored) {}

                double fee = 0.0;
                try {
                    fee = Double.parseDouble(cleanQuotes(values[9]).trim());
                } catch (NumberFormatException ignored) {}

                String bestTime = cleanQuotes(values[15]).trim();
                String openingTime = "09:00";
                String closingTime = "18:00";
                if (bestTime.equalsIgnoreCase("evening")) {
                    openingTime = "16:00";
                    closingTime = "21:00";
                } else if (bestTime.equalsIgnoreCase("morning")) {
                    openingTime = "07:00";
                    closingTime = "12:00";
                }

                String category = mapCategory(type, sig);
                String energy = mapEnergy(category, hours);
                String imageUrl = getCategoryImageUrl(category);

                String description = "A famous " + type.toLowerCase() + " in " + cityName + ". Significance: " + sig + ". Established in " + year + ".";
                if (description.length() > 950) {
                    description = description.substring(0, 950) + "...";
                }

                Activity act = Activity.builder()
                        .destination(dest)
                        .name(sightName)
                        .description(description)
                        .durationMinutes(durationMinutes)
                        .estimatedCost(fee)
                        .openingTime(openingTime)
                        .closingTime(closingTime)
                        .energyLevel(energy)
                        .indoor(type.toLowerCase().contains("museum") || type.toLowerCase().contains("temple") || type.toLowerCase().contains("palace"))
                        .weatherDependent(!type.toLowerCase().contains("museum"))
                        .bookingRequired(fee > 100.0)
                        .rating(rating)
                        .category(category)
                        .imageUrl(imageUrl)
                        .active(true)
                        .build();

                activityRepository.save(act);
                
                String cityKey = dest.getName().toLowerCase().trim();
                cityActivityCounts.put(cityKey, cityActivityCounts.getOrDefault(cityKey, 0) + 1);
                realActivityCount++;
            }
            log.info("Successfully seeded {} real activities from indian_places.csv.", realActivityCount);
        } catch (Exception e) {
            log.error("Failed to seed real activities from indian_places.csv: ", e);
        }

        // Pass 3: Seed fallback activities for cities that had less than 4 entries in indian_places.csv
        log.info("Checking for destinations requiring fallback activities...");
        int fallbackCount = 0;
        for (Destination d : destinationMap.values()) {
            int count = cityActivityCounts.getOrDefault(d.getName().toLowerCase().trim(), 0);
            if (count < 4) {
                List<Activity> mockActivities = generateMockActivities(d);
                for (Activity act : mockActivities) {
                    activityRepository.save(act);
                    fallbackCount++;
                }
            }
        }
        log.info("Successfully seeded {} fallback activities.", fallbackCount);
    }

    private String mapCategory(String type, String significance) {
        String t = (type != null ? type : "").toLowerCase();
        String s = (significance != null ? significance : "").toLowerCase();

        if (t.contains("temple") || t.contains("church") || t.contains("mosque") || t.contains("gurudwara") || s.contains("religious")) {
            return "SPIRITUAL";
        }
        if (t.contains("museum") || t.contains("observatory") || t.contains("gallery") || t.contains("tomb") || t.contains("fort") || t.contains("palace") || t.contains("memorial") || t.contains("stepwell") || s.contains("historical") || s.contains("artistic") || s.contains("heritage")) {
            return "CULTURE";
        }
        if (t.contains("park") || t.contains("garden") || t.contains("lake") || t.contains("waterfall") || t.contains("sanctuary") || t.contains("zoo") || t.contains("beach") || s.contains("nature") || s.contains("botanical") || s.contains("environmental")) {
            return "NATURE";
        }
        if (t.contains("market") || t.contains("mall") || t.contains("shopping") || s.contains("market")) {
            return "SHOPPING";
        }
        if (t.contains("trekking") || t.contains("adventure") || t.contains("safari") || t.contains("climb") || t.contains("rafting") || s.contains("adventure")) {
            return "ADVENTURE";
        }
        return "CULTURE";
    }

    private String mapEnergy(String category, double durationHrs) {
        if ("ADVENTURE".equalsIgnoreCase(category)) {
            return "HIGH";
        }
        if (durationHrs >= 2.5) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String getCategoryImageUrl(String category) {
        switch (category) {
            case "NATURE":
                return "https://images.unsplash.com/photo-1518235506717-e1ed3306a89b";
            case "FOOD":
                return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5";
            case "ADVENTURE":
                return "https://images.unsplash.com/photo-1431274172761-fca41d930114";
            case "SPIRITUAL":
                return "https://images.unsplash.com/photo-1548013146-72479768bada";
            case "CULTURE":
            default:
                return "https://images.unsplash.com/photo-1541963463532-d68292c34b19";
        }
    }

    private List<Activity> generateMockActivities(Destination dest) {
        List<Activity> list = new ArrayList<>();
        String city = dest.getName();

        list.add(Activity.builder()
                .destination(dest)
                .name(city + " Cultural Heritage & Sightseeing Tour")
                .description("Explore historical monuments, landmarks, and learn about the local traditions and heritage of " + city + ".")
                .durationMinutes(180)
                .estimatedCost(15.0 * 80.0)
                .openingTime("09:00")
                .closingTime("17:00")
                .energyLevel("MEDIUM")
                .indoor(false)
                .weatherDependent(true)
                .bookingRequired(false)
                .rating(4.8)
                .category("CULTURE")
                .imageUrl("https://images.unsplash.com/photo-1541963463532-d68292c34b19")
                .active(true)
                .build());

        list.add(Activity.builder()
                .destination(dest)
                .name(city + " Nature Trail & Scenic Walk")
                .description("Take in beautiful views, walk through scenic trails, and enjoy the calming atmosphere of " + city + ".")
                .durationMinutes(120)
                .estimatedCost(0.0)
                .openingTime("07:00")
                .closingTime("18:30")
                .energyLevel("LOW")
                .indoor(false)
                .weatherDependent(true)
                .bookingRequired(false)
                .rating(4.7)
                .category("NATURE")
                .imageUrl("https://images.unsplash.com/photo-1518235506717-e1ed3306a89b")
                .active(true)
                .build());

        list.add(Activity.builder()
                .destination(dest)
                .name(city + " Traditional Food Walk & Tasting")
                .description("Taste the famous street foods, regional delicacies, and authentic cooking of " + city + ".")
                .durationMinutes(90)
                .estimatedCost(20.0 * 80.0)
                .openingTime("12:00")
                .closingTime("21:00")
                .energyLevel("LOW")
                .indoor(true)
                .weatherDependent(false)
                .bookingRequired(true)
                .rating(4.9)
                .category("FOOD")
                .imageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5")
                .active(true)
                .build());

        list.add(Activity.builder()
                .destination(dest)
                .name(city + " Outdoor Adventure Excursion")
                .description("Engage in a high-energy hike or adventure activity showcasing the natural and active highlights of " + city + ".")
                .durationMinutes(150)
                .estimatedCost(35.0 * 80.0)
                .openingTime("08:00")
                .closingTime("16:00")
                .energyLevel("HIGH")
                .indoor(false)
                .weatherDependent(true)
                .bookingRequired(true)
                .rating(4.6)
                .category("ADVENTURE")
                .imageUrl("https://images.unsplash.com/photo-1431274172761-fca41d930114")
                .active(true)
                .build());

        return list;
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

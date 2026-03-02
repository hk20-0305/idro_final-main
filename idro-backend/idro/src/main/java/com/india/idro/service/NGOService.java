package com.india.idro.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.india.idro.model.NGO;
import com.india.idro.model.NGOResourceSubmission;
import com.india.idro.model.ResourceItem;
import com.india.idro.model.enums.AvailabilityStatus;
import com.india.idro.model.enums.CoverageRadius;
import com.india.idro.model.enums.ResponseTime;
import com.india.idro.repository.NGORepository;
import com.india.idro.repository.NGOResourceSubmissionRepository;

@Service
public class NGOService implements CommandLineRunner {

        @Autowired
        private NGORepository ngoRepository;

        @Autowired
        private NGOResourceSubmissionRepository submissionRepository;

        @Autowired
        private com.india.idro.repository.AlertRepository alertRepository;

        @Override
        public void run(String... args) throws Exception {
                initializeDemoAccounts();
        }

        public void initializeDemoAccounts() {
                System.out.println("🔧 Initializing/Updating 25 NGO demo accounts...");

                // Create/Update 25 pre-defined NGO accounts
                List<NGO> demoNGOs = Arrays.asList(
                                // MAHARASHTRA (5)
                                updateOrCreateNGO("NGO001", "123", "Red Cross India", "Mumbai", "Maharashtra",
                                                "+91-22-2307-7000",
                                                "REG-RC-2001", "Western India",
                                                Arrays.asList("Flood", "Earthquake", "Cyclone", "Medical Emergency")),
                                updateOrCreateNGO("NGO002", "123", "Care India", "Pune", "Maharashtra",
                                                "+91-11-4737-4500",
                                                "REG-CI-2003", "Northern India",
                                                Arrays.asList("Drought", "Flood", "Health Crisis", "Food Security")),
                                updateOrCreateNGO("NGO003", "123", "Oxfam India", "Nagpur", "Maharashtra",
                                                "+91-80-4090-9200",
                                                "REG-OI-2008", "Southern India",
                                                Arrays.asList("Flood", "Drought", "Cyclone", "Livelihood Support")),
                                updateOrCreateNGO("NGO004", "123", "Save the Children", "Nashik", "Maharashtra",
                                                "+91-44-4213-0500",
                                                "REG-SC-2005", "Southern India",
                                                Arrays.asList("Cyclone", "Flood", "Child Protection", "Education")),
                                updateOrCreateNGO("NGO005", "123", "Goonj", "Aurangabad", "Maharashtra",
                                                "+91-33-2357-8900",
                                                "REG-GJ-2004", "Eastern India",
                                                Arrays.asList("Flood", "Cyclone", "Material Relief",
                                                                "Clothing Distribution")),

                                // RAJASTHAN (5)
                                updateOrCreateNGO("NGO006", "123", "Rajasthan Seva Trust", "Jaipur", "Rajasthan",
                                                "+91-141-235-0001",
                                                "REG-RJ-001", "Western India",
                                                Arrays.asList("Drought", "Heat Wave", "Community Support")),
                                updateOrCreateNGO("NGO007", "123", "Desert Relief Foundation", "Udaipur", "Rajasthan",
                                                "+91-294-241-0002", "REG-RJ-002", "Western India",
                                                Arrays.asList("Water Scarcity", "Drought Relief")),
                                updateOrCreateNGO("NGO008", "123", "Marwar Humanitarian Aid", "Jodhpur", "Rajasthan",
                                                "+91-291-263-0003", "REG-RJ-003", "Western India",
                                                Arrays.asList("Medical Support", "Drought")),
                                updateOrCreateNGO("NGO009", "123", "Kota Disaster Response Network", "Kota",
                                                "Rajasthan",
                                                "+91-744-239-0004", "REG-RJ-004", "Western India",
                                                Arrays.asList("Flood", "Educational Aid")),
                                updateOrCreateNGO("NGO010", "123", "Ajmer Community Support", "Ajmer", "Rajasthan",
                                                "+91-145-242-0005",
                                                "REG-RJ-005", "Western India",
                                                Arrays.asList("Social Welfare", "Drought")),

                                // ASSAM (5)
                                updateOrCreateNGO("NGO011", "123", "Assam Flood Relief Mission", "Guwahati", "Assam",
                                                "+91-361-245-0011", "REG-AS-011", "North East",
                                                Arrays.asList("Flood", "Landslide", "Boat Rescue")),
                                updateOrCreateNGO("NGO012", "123", "Brahmaputra Aid Foundation", "Dibrugarh", "Assam",
                                                "+91-373-232-0012", "REG-AS-012", "North East",
                                                Arrays.asList("River Erosion", "Flood Relief")),
                                updateOrCreateNGO("NGO013", "123", "NorthEast Humanitarian Trust", "Silchar", "Assam",
                                                "+91-3842-234-013", "REG-AS-013", "North East",
                                                Arrays.asList("Landslide", "Flood", "Medical")),
                                updateOrCreateNGO("NGO014", "123", "Tezpur Emergency Care", "Tezpur", "Assam",
                                                "+91-3712-221-014",
                                                "REG-AS-014", "North East", Arrays.asList("Flood", "Health Services")),
                                updateOrCreateNGO("NGO015", "123", "Jorhat Rural Support Initiative", "Jorhat", "Assam",
                                                "+91-376-233-0015", "REG-AS-015", "North East",
                                                Arrays.asList("Rural Relief", "Flood")),

                                // GUJARAT (5)
                                updateOrCreateNGO("NGO016", "123", "Gujarat Disaster Care", "Ahmedabad", "Gujarat",
                                                "+91-79-265-0016",
                                                "REG-GJ-016", "Western India",
                                                Arrays.asList("Earthquake", "Flood", "Industrial Safety")),
                                updateOrCreateNGO("NGO017", "123", "Surat Relief Network", "Surat", "Gujarat",
                                                "+91-261-242-0017",
                                                "REG-GJ-017", "Western India",
                                                Arrays.asList("Flood", "Cyclone", "Rescue")),
                                updateOrCreateNGO("NGO018", "123", "Vadodara Community Aid", "Vadodara", "Gujarat",
                                                "+91-265-233-0018",
                                                "REG-GJ-018", "Western India",
                                                Arrays.asList("Flash Flood", "Medical Relief")),
                                updateOrCreateNGO("NGO019", "123", "Saurashtra Emergency Support", "Rajkot", "Gujarat",
                                                "+91-281-244-0019", "REG-GJ-019", "Western India",
                                                Arrays.asList("Cyclone", "Drought")),
                                updateOrCreateNGO("NGO020", "123", "Bhavnagar Coastal Response", "Bhavnagar", "Gujarat",
                                                "+91-278-251-0020", "REG-GJ-020", "Western India",
                                                Arrays.asList("Coastal Erosion", "Cyclone")),

                                // UTTAR PRADESH (5)
                                updateOrCreateNGO("NGO021", "123", "Lucknow Relief Foundation", "Lucknow",
                                                "Uttar Pradesh",
                                                "+91-522-223-0021", "REG-UP-021", "Northern India",
                                                Arrays.asList("Flood", "Heat Wave", "Urban Relief")),
                                updateOrCreateNGO("NGO022", "123", "Kanpur Humanitarian Society", "Kanpur",
                                                "Uttar Pradesh",
                                                "+91-512-230-0022", "REG-UP-022", "Northern India",
                                                Arrays.asList("Industrial Support", "Flood")),
                                updateOrCreateNGO("NGO023", "123", "Varanasi Seva Mandal", "Varanasi", "Uttar Pradesh",
                                                "+91-542-231-0023", "REG-UP-023", "Northern India",
                                                Arrays.asList("River Rescue", "Medical")),
                                updateOrCreateNGO("NGO024", "123", "Agra Crisis Response Team", "Agra", "Uttar Pradesh",
                                                "+91-562-242-0024", "REG-UP-024", "Northern India",
                                                Arrays.asList("Heritage Safety", "Heat Relief")),
                                updateOrCreateNGO("NGO025", "123", "Prayagraj Public Aid Trust", "Prayagraj",
                                                "Uttar Pradesh",
                                                "+91-532-240-0025", "REG-UP-025", "Northern India",
                                                Arrays.asList("Mela Support", "Flood Relief")));

                ngoRepository.saveAll(demoNGOs);
                System.out.println("✅ Successfully initialized/updated 25 NGO demo accounts");
        }

        private NGO updateOrCreateNGO(String ngoId, String password, String ngoName,
                        String city, String state, String contactNumber,
                        String registrationId, String operatingRegion,
                        List<String> supportedDisasterTypes) {

                NGO ngo = ngoRepository.findByNgoId(ngoId).orElse(new NGO());

                ngo.setNgoId(ngoId);
                ngo.setPassword(password);
                ngo.setNgoName(ngoName);
                ngo.setCity(city);
                ngo.setState(state);
                ngo.setContactNumber(contactNumber);
                ngo.setRegistrationId(registrationId);
                ngo.setOperatingRegion(operatingRegion);
                ngo.setSupportedDisasterTypes(supportedDisasterTypes);

                // Only initialize default resources for new NGOs
                if (ngo.getId() == null) {
                        Map<String, ResourceItem> reliefSupplies = new HashMap<>();
                        reliefSupplies.put("foodPackets", new ResourceItem(false, 0));
                        reliefSupplies.put("drinkingWater", new ResourceItem(false, 0));
                        reliefSupplies.put("sanitaryKits", new ResourceItem(false, 0));
                        ngo.setReliefSupplies(reliefSupplies);

                        Map<String, ResourceItem> medicalSupport = new HashMap<>();
                        medicalSupport.put("firstAidKits", new ResourceItem(false, 0));
                        medicalSupport.put("doctors", new ResourceItem(false, 0));
                        medicalSupport.put("nurses", new ResourceItem(false, 0));
                        medicalSupport.put("ambulances", new ResourceItem(false, 0));
                        ngo.setMedicalSupport(medicalSupport);

                        Map<String, ResourceItem> shelterEssentials = new HashMap<>();
                        shelterEssentials.put("tents", new ResourceItem(false, 0));
                        shelterEssentials.put("blankets", new ResourceItem(false, 0));
                        shelterEssentials.put("beds", new ResourceItem(false, 0));
                        shelterEssentials.put("clothes", new ResourceItem(false, 0));
                        ngo.setShelterEssentials(shelterEssentials);

                        Map<String, ResourceItem> humanResources = new HashMap<>();
                        humanResources.put("volunteers", new ResourceItem(false, 0));
                        humanResources.put("rescueWorkers", new ResourceItem(false, 0));
                        ngo.setHumanResources(humanResources);

                        ngo.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                        ngo.setResponseTime(ResponseTime.IMMEDIATE);
                        ngo.setCoverageRadius(CoverageRadius.DISTRICT_WIDE);
                }

                return ngo;
        }

        private NGO createDemoNGO(String ngoId, String password, String ngoName,
                        String city, String state, String contactNumber,
                        String registrationId, String operatingRegion,
                        List<String> supportedDisasterTypes) {
                NGO ngo = new NGO();
                ngo.setNgoId(ngoId);
                ngo.setPassword(password);
                ngo.setNgoName(ngoName);
                ngo.setCity(city);
                ngo.setState(state);
                ngo.setContactNumber(contactNumber);
                ngo.setRegistrationId(registrationId);
                ngo.setOperatingRegion(operatingRegion);
                ngo.setSupportedDisasterTypes(supportedDisasterTypes);

                // Initialize default resources
                Map<String, ResourceItem> reliefSupplies = new HashMap<>();
                reliefSupplies.put("foodPackets", new ResourceItem(false, 0));
                reliefSupplies.put("drinkingWater", new ResourceItem(false, 0));
                reliefSupplies.put("sanitaryKits", new ResourceItem(false, 0));
                ngo.setReliefSupplies(reliefSupplies);

                Map<String, ResourceItem> medicalSupport = new HashMap<>();
                medicalSupport.put("firstAidKits", new ResourceItem(false, 0));
                medicalSupport.put("doctors", new ResourceItem(false, 0));
                medicalSupport.put("nurses", new ResourceItem(false, 0));
                medicalSupport.put("ambulances", new ResourceItem(false, 0));
                ngo.setMedicalSupport(medicalSupport);

                Map<String, ResourceItem> shelterEssentials = new HashMap<>();
                shelterEssentials.put("tents", new ResourceItem(false, 0));
                shelterEssentials.put("blankets", new ResourceItem(false, 0));
                shelterEssentials.put("beds", new ResourceItem(false, 0));
                shelterEssentials.put("clothes", new ResourceItem(false, 0));
                ngo.setShelterEssentials(shelterEssentials);

                Map<String, ResourceItem> humanResources = new HashMap<>();
                humanResources.put("volunteers", new ResourceItem(false, 0));
                humanResources.put("rescueWorkers", new ResourceItem(false, 0));
                ngo.setHumanResources(humanResources);

                // Set default availability
                ngo.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                ngo.setResponseTime(ResponseTime.IMMEDIATE);
                ngo.setCoverageRadius(CoverageRadius.DISTRICT_WIDE);

                return ngo;
        }

        public NGO authenticateNGO(String ngoId, String password) {
                Optional<NGO> ngoOpt = ngoRepository.findByNgoId(ngoId);

                if (ngoOpt.isEmpty()) {
                        return null; // NGO not found
                }

                NGO ngo = ngoOpt.get();

                // Check password
                if (!ngo.getPassword().equals(password)) {
                        return null; // Wrong password
                }

                return ngo; // Success
        }

        public NGO getNGOProfile(String ngoId) {
                return ngoRepository.findByNgoId(ngoId).orElse(null);
        }

        public NGO updateResources(String ngoId, Map<String, ResourceItem> reliefSupplies,
                        Map<String, ResourceItem> medicalSupport,
                        Map<String, ResourceItem> shelterEssentials,
                        Map<String, ResourceItem> humanResources,
                        String additionalNotes) {
                Optional<NGO> ngoOpt = ngoRepository.findByNgoId(ngoId);

                if (ngoOpt.isEmpty()) {
                        return null;
                }

                NGO ngo = ngoOpt.get();

                // Save a snapshot of the submission to the new collection
                NGOResourceSubmission submission = new NGOResourceSubmission();
                submission.setNgoId(ngoId);
                submission.setNgoName(ngo.getNgoName());
                submission.setReliefSupplies(reliefSupplies != null ? reliefSupplies : ngo.getReliefSupplies());
                submission.setMedicalSupport(medicalSupport != null ? medicalSupport : ngo.getMedicalSupport());
                submission.setShelterEssentials(
                                shelterEssentials != null ? shelterEssentials : ngo.getShelterEssentials());
                submission.setHumanResources(humanResources != null ? humanResources : ngo.getHumanResources());
                submission.setAdditionalNotes(additionalNotes != null ? additionalNotes : ngo.getAdditionalNotes());
                submissionRepository.save(submission);

                // Update main NGO profile
                if (reliefSupplies != null)
                        ngo.setReliefSupplies(reliefSupplies);
                if (medicalSupport != null)
                        ngo.setMedicalSupport(medicalSupport);
                if (shelterEssentials != null)
                        ngo.setShelterEssentials(shelterEssentials);
                if (humanResources != null)
                        ngo.setHumanResources(humanResources);
                if (additionalNotes != null)
                        ngo.setAdditionalNotes(additionalNotes);

                ngo.setLastUpdated(LocalDateTime.now());

                return ngoRepository.save(ngo);
        }

        public NGO updateAvailability(String ngoId, AvailabilityStatus availabilityStatus,
                        ResponseTime responseTime, CoverageRadius coverageRadius) {
                Optional<NGO> ngoOpt = ngoRepository.findByNgoId(ngoId);

                if (ngoOpt.isEmpty()) {
                        return null;
                }

                NGO ngo = ngoOpt.get();

                // Update availability
                if (availabilityStatus != null)
                        ngo.setAvailabilityStatus(availabilityStatus);
                if (responseTime != null)
                        ngo.setResponseTime(responseTime);
                if (coverageRadius != null)
                        ngo.setCoverageRadius(coverageRadius);

                ngo.setLastUpdated(LocalDateTime.now());

                return ngoRepository.save(ngo);
        }

        private static final List<String> VALID_INDIAN_STATES = java.util.Arrays.asList(
                        "Maharashtra", "Rajasthan", "Assam", "Gujarat", "Uttar Pradesh");

        public List<NGO> getAllNGOs(String disasterId) {
                if (disasterId == null || disasterId.trim().isEmpty()) {
                        System.out.println("⚠️ No disaster context provided. Returning empty list for isolation.");
                        return new java.util.ArrayList<>();
                }

                // 1. Fetch disaster context
                com.india.idro.model.Alert alert = alertRepository.findById(disasterId).orElse(null);
                if (alert == null || alert.getLocation() == null || alert.getLocation().trim().isEmpty()) {
                        System.out.println("⚠️ Disaster or location context missing. Returning empty list.");
                        return new java.util.ArrayList<>();
                }

                String location = alert.getLocation();
                System.out.println("🔍 Analyzing Location for State: [" + location + "]");

                // 2. Identify State by Keyword Matching
                String detectedState = null;
                for (String state : VALID_INDIAN_STATES) {
                        if (location.toLowerCase().contains(state.toLowerCase())) {
                                detectedState = state;
                                break;
                        }
                }

                if (detectedState == null) {
                        System.out.println(
                                        "⚠️ No matching Indian state detected in location. Scoping empty pool for safety.");
                        return new java.util.ArrayList<>();
                }

                System.out.println("📍 Detected State: [" + detectedState + "]");

                // 3. Fetch NGOs strictly by matching state
                List<NGO> allNgosInState = ngoRepository.findByStateIgnoreCase(detectedState);
                System.out.println("🏢 Found " + allNgosInState.size() + " NGOs matching: " + detectedState);

                // 4. Extract ngoIds (as requested for tiered isolation)
                List<String> filteredNgoIds = allNgosInState.stream()
                                .map(NGO::getNgoId)
                                .collect(java.util.stream.Collectors.toList());

                if (filteredNgoIds.isEmpty()) {
                        return new java.util.ArrayList<>();
                }

                // 5. Final Isolation Fetch
                return ngoRepository.findByNgoIdIn(filteredNgoIds);
        }
}

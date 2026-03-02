package com.india.idro.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApplicationConfig {

    // Bean for making HTTP requests to external APIs (if needed)
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // Bean for JSON serialization/deserialization
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Register JavaTimeModule to handle LocalDateTime, LocalDate, etc.
        mapper.registerModule(new JavaTimeModule());

        // Write dates as strings instead of timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;
    }
}
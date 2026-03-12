package com.india.idro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class IdroApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdroApplication.class, args);
    
        System.out.println(" IDRO Backend Server Started Successfully!");
        System.out.println(" Server running at: http://localhost:8085");
        System.out.println(" API Documentation: http://localhost:8085/swagger-ui.html");
        System.out.println(" MongoDB Database: idro_db");
    }
}
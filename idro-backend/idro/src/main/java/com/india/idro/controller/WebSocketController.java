package com.india.idro.controller;

import com.india.idro.model.Action;
import com.india.idro.model.Alert;
import com.india.idro.model.Camp;
import com.india.idro.model.CoordinationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Handle coordination messages
    @MessageMapping("/coordination")
    @SendTo("/topic/coordination")
    public CoordinationMessage handleCoordinationMessage(@Payload CoordinationMessage message) {
        // Process the coordination message (e.g., save to database if needed)
        System.out.println("Received coordination message: " + message);
        return message;
    }

    // Handle alert updates
    @MessageMapping("/alert")
    @SendTo("/topic/alerts")
    public Alert handleAlertUpdate(@Payload Alert alert) {
        System.out.println("Received alert update: " + alert);
        return alert;
    }

    // Handle camp updates
    @MessageMapping("/camp")
    @SendTo("/topic/camps")
    public Camp handleCampUpdate(@Payload Camp camp) {
        System.out.println("Received camp update: " + camp);
        return camp;
    }

    // Handle action updates
    @MessageMapping("/action")
    @SendTo("/topic/actions")
    public Action handleActionUpdate(@Payload Action action) {
        System.out.println("Received action update: " + action);
        return action;
    }

    // Methods to send messages from other parts of the application
    public void sendAlertUpdate(Alert alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void sendCampUpdate(Camp camp) {
        messagingTemplate.convertAndSend("/topic/camps", camp);
    }

    public void sendCoordinationMessage(CoordinationMessage message) {
        messagingTemplate.convertAndSend("/topic/coordination", message);
    }

    public void sendActionUpdate(Action action) {
        messagingTemplate.convertAndSend("/topic/actions", action);
    }
}

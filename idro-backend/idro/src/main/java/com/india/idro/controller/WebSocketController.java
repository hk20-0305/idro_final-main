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

    @MessageMapping("/coordination")
    @SendTo("/topic/coordination")
    public CoordinationMessage handleCoordinationMessage(@Payload CoordinationMessage message) {
        return message;
    }

    @MessageMapping("/alert")
    @SendTo("/topic/alerts")
    public Alert handleAlertUpdate(@Payload Alert alert) {
        return alert;
    }

    @MessageMapping("/camp")
    @SendTo("/topic/camps")
    public Camp handleCampUpdate(@Payload Camp camp) {
        return camp;
    }

    @MessageMapping("/action")
    @SendTo("/topic/actions")
    public Action handleActionUpdate(@Payload Action action) {
        return action;
    }

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

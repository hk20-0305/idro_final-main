import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscribers = {
      alerts: [],
      camps: [],
      coordination: [],
      actions: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
  }

  connect(onConnect, onError) {
    if (this.stompClient && this.stompClient.connected) {
      if (onConnect) onConnect();
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8085/ws/coordination';

    try {
      const socket = new SockJS(wsUrl);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = (frame) => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        this.subscribeToTopics();

        if (onConnect) onConnect();
      };

      this.stompClient.onStompError = (frame) => {
        this.isConnecting = false;
        if (onError) onError(new Error(frame.headers['message']));
      };

      this.stompClient.onWebSocketClose = () => {
        this.isConnecting = false;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect(onConnect, onError);
          }, this.reconnectDelay);
        } else {
          if (onError) onError(new Error('WebSocket connection failed'));
        }
      };

      this.stompClient.activate();
    } catch (error) {
      this.isConnecting = false;
      if (onError) onError(error);
    }
  }

  subscribeToTopics() {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe('/topic/alerts', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('alerts', data);
      } catch (error) {
      }
    });

    this.stompClient.subscribe('/topic/coordination', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('coordination', data);
      } catch (error) {
      }
    });

    this.stompClient.subscribe('/topic/camps', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('camps', data);
      } catch (error) {
      }
    });

    this.stompClient.subscribe('/topic/actions', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('actions', data);
      } catch (error) {
      }
    });
  }


  notifySubscribers(topic, data) {
    if (this.subscribers[topic]) {
      this.subscribers[topic].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
        }
      });
    }
  }

  subscribeToAlerts(callback) {
    this.subscribers.alerts.push(callback);
    return () => this.unsubscribe('alerts', callback);
  }

  subscribeToCamps(callback) {
    this.subscribers.camps.push(callback);
    return () => this.unsubscribe('camps', callback);
  }

  subscribeToCoordination(callback) {
    this.subscribers.coordination.push(callback);
    return () => this.unsubscribe('coordination', callback);
  }

  subscribeToActions(callback) {
    this.subscribers.actions.push(callback);
    return () => this.unsubscribe('actions', callback);
  }

  unsubscribe(topic, callback) {
    if (this.subscribers[topic]) {
      this.subscribers[topic] = this.subscribers[topic].filter(cb => cb !== callback);
    }
  }

  send(message) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/coordination',
        body: JSON.stringify(message)
      });
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.stompClient.deactivate();
      this.stompClient = null;
    }


    Object.keys(this.subscribers).forEach(key => {
      this.subscribers[key] = [];
    });
  }

  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
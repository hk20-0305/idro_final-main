// WebSocket Service for real-time updates using STOMP over SockJS
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
      console.log('WebSocket already connected');
      if (onConnect) onConnect();
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8085/ws/coordination';

    try {
      const socket = new SockJS(wsUrl);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = (frame) => {
        console.log('✅ STOMP connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Subscribe to topics
        this.subscribeToTopics();

        if (onConnect) onConnect();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        this.isConnecting = false;
        if (onError) onError(new Error(frame.headers['message']));
      };

      this.stompClient.onWebSocketClose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnecting = false;

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.connect(onConnect, onError);
          }, this.reconnectDelay);
        } else {
          console.log('Max reconnection attempts reached');
          if (onError) onError(new Error('WebSocket connection failed'));
        }
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      if (onError) onError(error);
    }
  }

  subscribeToTopics() {
    if (!this.stompClient || !this.stompClient.connected) return;

    // Subscribe to alerts
    this.stompClient.subscribe('/topic/alerts', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('alerts', data);
      } catch (error) {
        console.error('Error parsing alerts message:', error);
      }
    });

    // Subscribe to coordination messages
    this.stompClient.subscribe('/topic/coordination', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('coordination', data);
      } catch (error) {
        console.error('Error parsing coordination message:', error);
      }
    });

    // Subscribe to camp updates
    this.stompClient.subscribe('/topic/camps', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('camps', data);
      } catch (error) {
        console.error('Error parsing camps message:', error);
      }
    });

    // Subscribe to actions
    this.stompClient.subscribe('/topic/actions', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.notifySubscribers('actions', data);
      } catch (error) {
        console.error('Error parsing actions message:', error);
      }
    });
  }

  // handleMessage is no longer needed as messages are handled in subscribeToTopics

  notifySubscribers(topic, data) {
    if (this.subscribers[topic]) {
      this.subscribers[topic].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${topic} subscriber:`, error);
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
      // Send to the coordination endpoint
      this.stompClient.publish({
        destination: '/app/coordination',
        body: JSON.stringify(message)
      });
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    // Clear all subscribers
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
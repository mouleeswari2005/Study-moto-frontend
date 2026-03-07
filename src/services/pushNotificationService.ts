/**
 * Push notification service for managing browser push subscriptions.
 */
import api from './api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  /**
   * Check if browser supports push notifications.
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Request notification permission from user.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    return await Notification.requestPermission();
  }

  /**
   * Get current notification permission status.
   */
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications.
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key is not configured');
    }

    // Request permission
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(
            subscription.getKey('p256dh') as ArrayBuffer
          ),
          auth: this.arrayBufferToBase64(
            subscription.getKey('auth') as ArrayBuffer
          ),
        },
      };

      await api.post('/push-subscriptions', {
        ...subscriptionData,
        user_agent: navigator.userAgent,
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications.
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();

        // Remove from backend
        const subscriptions = await api.get('/push-subscriptions');
        const sub = subscriptions.data.find(
          (s: any) => s.endpoint === subscription.endpoint
        );
        if (sub) {
          await api.delete(`/push-subscriptions/${sub.id}`);
        }

        return true;
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }

    return false;
  }

  /**
   * Get current push subscription.
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is subscribed.
   */
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  /**
   * Convert VAPID key from base64 URL to Uint8Array.
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64 string.
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const pushNotificationService = new PushNotificationService();





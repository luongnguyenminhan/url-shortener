importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// Firebase config (same as main app)
firebase.initializeApp({
  apiKey: "AIzaSyDui5MKg4sB4eEcMjgjVXnw-u6bLm90D4E",
  authDomain: "scribe-c7f13.firebaseapp.com",
  projectId: "scribe-c7f13",
  storageBucket: "scribe-c7f13.firebasestorage.app",
  messagingSenderId: "970064337409",
  appId: "1:970064337409:web:ab8ecc361e352c5025be00",
  measurementId: "G-NH06MQQ2J3"
});

// Retrieve messaging
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  // Get brand logo from runtime config
  const brandLogo = self.__ENV__?.BRAND_LOGO;

  // Show notification with loud sound
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: brandLogo,
    badge: brandLogo,
    data: payload.data,
    // Loud notification settings
    silent: false, // Ensure sound is played
    requireInteraction: true, // Keep notification visible until user interacts
    // Add vibration pattern for mobile devices
    vibrate: [200, 100, 200, 100, 200, 100, 400], // Strong vibration pattern
    // Add custom actions if supported
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: 'secure-scribe-notification' // Group similar notifications
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click and actions
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.', event);

  event.notification.close();

  // Handle different actions
  if (event.action === 'view') {
    // View action - open the app
    const appUrl = self.location.origin;
    event.waitUntil(
      clients.openWindow(appUrl)
    );
  } else if (event.action === 'dismiss') {
    // Dismiss action - just close, don't open app
    console.log('Notification dismissed');
  } else {
    // Default click behavior - open the app
    const appUrl = self.location.origin;
    event.waitUntil(
      clients.openWindow(appUrl)
    );
  }
});

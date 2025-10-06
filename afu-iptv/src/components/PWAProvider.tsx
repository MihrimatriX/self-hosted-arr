"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    // Service Worker kaydı
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          console.log("Service Worker registered successfully:", registration);

          // Service Worker güncellemelerini kontrol et
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Yeni güncelleme mevcut
                  console.log("New service worker version available");
                  // Kullanıcıya güncelleme bildirimi gösterebilirsiniz
                }
              });
            }
          });

          // Service Worker mesajlarını dinle
          navigator.serviceWorker.addEventListener("message", (event) => {
            console.log("Message from service worker:", event.data);
          });

        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      };

      registerSW();
    }

    // PWA install prompt'u için event listener
    let deferredPrompt: any = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      console.log("PWA install prompt available");
      
      // Kullanıcıya install butonu gösterebilirsiniz
      // showInstallButton();
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}

// PWA install fonksiyonu (isteğe bağlı)
export const installPWA = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      // Service Worker'ı güncelle
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update PWA:", error);
    }
  }
};

// PWA durumunu kontrol et
export const getPWAStatus = () => {
  if (typeof window === "undefined") return null;

  return {
    isInstalled: window.matchMedia("(display-mode: standalone)").matches || 
                 (window.navigator as any).standalone === true,
    isOnline: navigator.onLine,
    hasServiceWorker: "serviceWorker" in navigator,
    isSecure: location.protocol === "https:" || location.hostname === "localhost"
  };
};

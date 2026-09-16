import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/recordService';

const WebhookContext = createContext(null);

export const WebhookProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(() => recordService.getLastWebhookSync());
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [hasNotifiedLaunch, setHasNotifiedLaunch] = useState(false);

  // Trigger auto-response when frontend is launched
  const performSync = useCallback(async (customPayload = null) => {
    setIsSyncing(true);
    try {
      const result = await recordService.autoRespondToTestWebhook(customPayload);
      setSyncResult(result);
      return result;
    } catch (err) {
      console.error('Webhook sync failed:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial automatic launch response to test URL
    performSync().then((res) => {
      if (res && res.success) {
        setHasNotifiedLaunch(true);
      }
    });

    // 2. Listen to custom sync events
    const handleSyncEvent = (event) => {
      if (event?.detail) {
        setSyncResult(event.detail);
      }
    };

    window.addEventListener('nalathunai_webhook_synced', handleSyncEvent);
    return () => {
      window.removeEventListener('nalathunai_webhook_synced', handleSyncEvent);
    };
  }, [performSync]);

  return (
    <WebhookContext.Provider
      value={{
        isSyncing,
        syncResult,
        webhookUrl: recordService.getWebhookUrl(),
        isInspectorOpen,
        openInspector: () => setIsInspectorOpen(true),
        closeInspector: () => setIsInspectorOpen(false),
        triggerManualSync: performSync,
        hasNotifiedLaunch,
        dismissLaunchNotice: () => setHasNotifiedLaunch(false),
      }}
    >
      {children}
    </WebhookContext.Provider>
  );
};

export const useWebhookSync = () => {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhookSync must be used within a WebhookProvider');
  }
  return context;
};

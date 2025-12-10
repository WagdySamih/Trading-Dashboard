import { wsService } from "./websocket";
import {
  type AlertSubscription,
  type AlertTriggered,
} from "@trading-dashboard/shared";

class AlertService {
  subscribe(subscription: AlertSubscription): void {
    wsService.subscribeAlert(subscription);
  }

  unsubscribe(alertId: string): void {
    wsService.unsubscribeAlert(alertId);
  }

  onAlertTriggered(callback: (alert: AlertTriggered) => void): void {
    wsService.onAlertTriggered(callback);
  }
}

export const alertService = new AlertService();

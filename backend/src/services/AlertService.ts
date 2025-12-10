import {
  type AlertSubscription,
  type AlertTriggered,
} from "@trading-dashboard/shared";

type Alert = AlertSubscription & { socketId: string };
type Alerts = Map<string, Map<string, Alert>>;

export class AlertService {
  private alerts: Alerts = new Map();

  addAlert(socketId: string, subscription: AlertSubscription): void {
    if (!this.alerts.has(subscription.tickerId)) {
      this.alerts.set(subscription.tickerId, new Map());
    }

    const key = `${socketId}-${subscription.type}-${subscription.price}`;
    const alert: Alert = { ...subscription, socketId };
    this.alerts.get(subscription.tickerId)?.set(key, alert);
  }

  removeAlertsForSocket(socketId: string): void {
    for (const [tickerId, alertMap] of this.alerts.entries()) {
      for (const [key, alert] of alertMap.entries()) {
        if (alert.socketId === socketId) {
          alertMap.delete(key);
        }
      }
      if (alertMap.size === 0) {
        this.alerts.delete(tickerId);
      }
    }
  }

  checkAlerts(
    tickerId: string,
    currentPrice: number,
  ): { socketId: string; alert: AlertTriggered }[] {
    const triggeredAlerts: { socketId: string; alert: AlertTriggered }[] = [];
    const alertMap = this.alerts.get(tickerId);

    if (!alertMap) return triggeredAlerts;

    for (const [key, alert] of alertMap.entries()) {
      const isHigher = alert.type === "higher" && currentPrice > alert.price;
      const isLower = alert.type === "lower" && currentPrice < alert.price;

      const triggered = isHigher || isLower;

      if (triggered) {
        console.log(`[AlertService] TRIGGERED!`, alert);
        triggeredAlerts.push({
          socketId: alert.socketId,
          alert: {
            tickerId,
            price: currentPrice,
            alertPrice: alert.price,
            type: alert.type,
          },
        });
        alertMap.delete(key);
      }
    }

    if (alertMap.size === 0) {
      this.alerts.delete(tickerId);
    }

    return triggeredAlerts;
  }
}

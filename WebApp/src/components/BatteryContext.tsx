import { createContext } from "react";

interface BatteryData {
  id: number;
  percentage: number;
}

export const BatteryContext = createContext<{
  batteryData: BatteryData;
  setBatteryData: React.Dispatch<React.SetStateAction<BatteryData>>;
}>({
  batteryData: { id: 0, percentage: 0 },
  setBatteryData: () => {},
});

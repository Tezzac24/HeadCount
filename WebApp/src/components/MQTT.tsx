import { useEffect } from "react";
import { Client } from "paho-mqtt";
//import { Player } from "../pages/Dashboard";

export default function MQTTComponent({
  onPlayerUpdate,
}: {
  onPlayerUpdate: () => void;
}) {
  const clientId = `mqtt-client-${Math.random().toString(36)}`;

  useEffect(() => {
    const client = new Client(
      "b00134925.northeurope.cloudapp.azure.com",
      9001,
      "/mqtt",
      clientId
    );

    client.connect({
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        client.subscribe("impact/max");
      },
    });

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("Connection lost:", responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message) => {
      if (message.destinationName === "impact/max") {
        const playerData = JSON.parse(message.payloadString);
        console.log(playerData);
        onPlayerUpdate();
      }
    };

    return () => {
      client.disconnect();
    };
  }, [onPlayerUpdate]);

  return null;
}

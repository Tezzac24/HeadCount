#include <Arduino.h>
#include <SPI.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <UUID.h>
#include <ArduinoOTA.h>
#include <vector>
#include <map>

// Wifi-broker config
const char* ssid = "Testimony's iPhone";
const char* password = "password";
const char* mqtt_server = "b00134925.northeurope.cloudapp.azure.com";

WiFiClient espClient;
PubSubClient client(espClient);

// pin definitions
const int SPI_CLK = 6;
const int SPI_MISO = 2;
const int SPI_MOSI = 7;
const int ASM330LHHXTR_cs = 19; // Accelerometer and gyroscope
const int H3LIS200DLTR_cs = 18; // High G Accelerometer

const byte READ_BIT = 0x80;

// register addresses
const byte CTRL1_XL_REG = 0x10;  // Register 1 for Xcel control ASM330LHHXTR
const byte CTRL2_G_REG = 0x11;   // Register 2 for gyro control ASM330LHHXTR
const byte H3LIS_CTRL_REG1 = 0x20; // Register 1 for Xcel control H3LIS200DLTR

// Command Values
const byte H3LIS_POWER_ON = 0XC7;     // Power on the accelerometer H3LIS200DLTR

// sensor configs
const int ASM330LHHXTR_XL_range = 8; // Set Full-scale range to +/- 2, 4, 8, 16g
float ASM330LHHXTR_XL_scaling;
const int ASM330LHHXTR_G_range = 2000; // Set Full-scale range to +/- 125, 250, 500, 1000, 2000dps
float ASM330LHHXTR_G_scaling;
const int H3LIS200DLTR_range = 100; // Set Full-scale range to +/- 100, 200, 400g
float H3LIS200DLTR_scaling;

// function definitions 
void setupWifi();
void writeRegister(byte regAddr, byte command, const int SPI_CS);
int16_t readAxisData(byte regAddr, const int SPI_CS);
void createImpactLog();
String getTime();

// global var
char pubMsg[80];
float maxImpact = 5.0;
unsigned long previousMillis = 0;
unsigned long startTimer;
UUID uuid;

const int playerId = 1;
int maxImpactCounter = 1;
int randNum = random(0, 10000000);

typedef std::map<std::string, float> impactLogEntry;

std::vector<impactLogEntry> impactLog;

void setup() {
  Serial.begin(115200);

  pinMode(SPI_CLK, OUTPUT);
  pinMode(SPI_MISO, INPUT);
  pinMode(SPI_MOSI, OUTPUT);
  pinMode(ASM330LHHXTR_cs, OUTPUT);
  pinMode(H3LIS200DLTR_cs, OUTPUT);

  digitalWrite(ASM330LHHXTR_cs, HIGH);
  digitalWrite(H3LIS200DLTR_cs, HIGH);

  setupWifi();

  // Initialize SPI
  SPI.begin(SPI_CLK, SPI_MISO, SPI_MOSI);
  SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));

  // Power on the accelerometer (ASM330LHHXTR)
  switch(ASM330LHHXTR_XL_range)
  {
    case 2:
      writeRegister(CTRL1_XL_REG, 0x50, ASM330LHHXTR_cs); // Set Accel scaling to +/-2g
      ASM330LHHXTR_XL_scaling = 0.000061;
      delay(100);
      break;
    case 4:
      writeRegister(CTRL1_XL_REG, 0x58, ASM330LHHXTR_cs); // Set Accel scaling to +/-4g
      ASM330LHHXTR_XL_scaling = 0.000122;
      delay(100);
      break;
    case 8:
      writeRegister(CTRL1_XL_REG, 0x5C, ASM330LHHXTR_cs); // Set Accel scaling to +/-8g
      ASM330LHHXTR_XL_scaling = 0.000244;
      delay(100);
      break;
    case 16:
      writeRegister(CTRL1_XL_REG, 0x54, ASM330LHHXTR_cs); // Set Accel scaling to +/-16g
      ASM330LHHXTR_XL_scaling = 0.000488;
      delay(100);
      break;
  }

  // Power on the gyroscope (ASM330LHHXTR) 
  switch(ASM330LHHXTR_G_range)
  {
    case 125:
      writeRegister(CTRL2_G_REG, 0x52, ASM330LHHXTR_cs); // Set Gyroscope scaling to +/-125dps
      ASM330LHHXTR_G_scaling = 0.00437;
      delay(100);
      break;
    case 250:
      writeRegister(CTRL2_G_REG, 0x50, ASM330LHHXTR_cs); // Set Gyroscope scaling to +/-250dps
      ASM330LHHXTR_G_scaling = 0.00875;
      delay(100);
      break;
    case 500:
      writeRegister(CTRL2_G_REG, 0x54, ASM330LHHXTR_cs); // Set Gyroscope scaling to +/-500dps
      ASM330LHHXTR_G_scaling = 0.0175;
      delay(100);
      break;
    case 1000:
      writeRegister(CTRL2_G_REG, 0x58, ASM330LHHXTR_cs); // Set Gyroscope scaling to +/-1000dps
      ASM330LHHXTR_G_scaling = 0.035;
      delay(100);
      break;
    case 2000:
      writeRegister(CTRL2_G_REG, 0x5C, ASM330LHHXTR_cs); // Set Gyroscope scaling to +/-2000dps
      ASM330LHHXTR_G_scaling = 0.070;
      delay(100);
      break;
  }

  // Power on the accelerometer (H3LIS200DLTR)
  writeRegister(H3LIS_CTRL_REG1, H3LIS_POWER_ON, H3LIS200DLTR_cs);
  delay(100);
  switch(H3LIS200DLTR_range)
  {
    case 100:
      writeRegister(0x23, 0x00, H3LIS200DLTR_cs); // Set Accel scaling to +/-100g
      H3LIS200DLTR_scaling = 0.049;
      delay(100);
      break;
    case 200:
      writeRegister(0x23, 0x10, H3LIS200DLTR_cs); // Set Accel scaling to +/-200g
      H3LIS200DLTR_scaling = 0.098;
      delay(100);
      break;
    case 400:
      writeRegister(0x23, 0x30, H3LIS200DLTR_cs); // Set Accel scaling to +/-400g
      H3LIS200DLTR_scaling = 0.195;
      delay(100);
      break;
  }
}


void loop() {
  unsigned long currentMillis = millis();

  int16_t accelX = readAxisData(0x29, ASM330LHHXTR_cs);
  float real_A_X = accelX * ASM330LHHXTR_XL_scaling;
  Serial.print("A axis: ");
  Serial.println(real_A_X);

  int16_t accelY = readAxisData(0x2B, ASM330LHHXTR_cs);
  float real_A_Y = accelY * ASM330LHHXTR_XL_scaling;
  Serial.print("Y axis: ");
  Serial.println(real_A_Y);

  int16_t accelZ = readAxisData(0x2D, ASM330LHHXTR_cs);
  float real_A_Z = accelZ * ASM330LHHXTR_XL_scaling;
  Serial.print("Z axis: ");
  Serial.println(real_A_Z);

  int16_t gyroX = readAxisData(0x23, ASM330LHHXTR_cs);
  float real_G_X = gyroX * ASM330LHHXTR_G_scaling;

  int16_t gyroY = readAxisData(0x25, ASM330LHHXTR_cs);
  float real_G_Y = gyroY * ASM330LHHXTR_G_scaling;

  int16_t gyroZ = readAxisData(0x27, ASM330LHHXTR_cs);
  float real_G_Z = gyroZ * ASM330LHHXTR_G_scaling;

  byte lowByte = readAxisData(0x28, H3LIS200DLTR_cs);
  byte highByte = readAxisData(0x29, H3LIS200DLTR_cs);
  int16_t accelerometerDataX = (int16_t)(((int)highByte << 8) + lowByte) >> 4;
  float real_X = accelerometerDataX * H3LIS200DLTR_scaling;
  Serial.print("\nreal X: ");
  Serial.println(real_X);

  lowByte = readAxisData(0x2A, H3LIS200DLTR_cs);
  highByte = readAxisData(0x2B, H3LIS200DLTR_cs);
  int16_t accelerometerDataY = (int16_t)(((int)highByte << 8) + lowByte) >> 4;
  float real_Y = accelerometerDataY * H3LIS200DLTR_scaling;
  Serial.print("real Y: ");
  Serial.println(real_Y);

  lowByte = readAxisData(0x2C, H3LIS200DLTR_cs);
  highByte = readAxisData(0x2D, H3LIS200DLTR_cs);
  int16_t accelerometerDataZ = (int16_t)(((int)highByte << 8) + lowByte) >> 4;
  float real_Z = accelerometerDataZ * H3LIS200DLTR_scaling;
  Serial.print("real Z: ");
  Serial.println(real_Z);

  // float pitch = atan(real_A_Y/sqrt(pow(real_A_X, 2) + pow(real_A_Z, 2))) * 180 / PI;
  // float roll = atan(-1 * real_A_X/sqrt(pow(real_A_Y, 2) + pow(real_A_Z, 2))) * 180 / PI;
  float asm_linForce = sqrt(pow(real_A_X, 2) + pow(real_A_Y, 2) + pow(real_A_Z, 2));
  float h3lis_linForce = sqrt(pow(real_X, 2) + pow(real_Y, 2) + pow(real_Z, 2));
  float rotForce = sqrt(pow(real_G_X, 2) + pow(real_G_Y, 2) + pow(real_G_Z, 2));


  if (asm_linForce >= 2.5) {
    impactLogEntry entry = {{"time", 1.0}, {"impact", asm_linForce}};
    impactLog.push_back(entry);

    if (asm_linForce > maxImpact && asm_linForce > 3.0) {
      sprintf(pubMsg,"{\"id\" : \"%d-%d-%d\", \"player_id\" :%d, \"linearForce\" :%.2f, \"rotationalForce\" :%.2f, \"time\":\"%s\"}", playerId, maxImpactCounter, randNum, playerId, asm_linForce, rotForce, getTime());
      Serial.println(pubMsg);
      client.publish("impact/max", pubMsg);
      maxImpact = asm_linForce;
      maxImpactCounter++;
    }
  }

  Serial.print("\nASM Linear Force: ");
  Serial.print(asm_linForce);
  Serial.print("\nH3LIS Linear Force: ");
  Serial.print(h3lis_linForce);
  Serial.print("\nRotational Force: ");
  Serial.println(rotForce);

  // Check if connected to internet
  if ((WiFi.status() != WL_CONNECTED)) {
    Serial.println("Reconnecting to WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.println("Reconnecting to WiFi...");
    }
  }

  client.loop();
  startTimer = millis();
  delay(50);
}


void writeRegister(byte regAddr, byte command, const int SPI_CS) {
  digitalWrite(SPI_CS, LOW);
  delayMicroseconds(10);

  SPI.transfer(regAddr);
  SPI.transfer(command);

  digitalWrite(SPI_CS, HIGH);
}


int16_t readAxisData(byte regAddr, const int SPI_CS) {
  int16_t axisData;

  digitalWrite(SPI_CS, LOW);
  delayMicroseconds(10);
  SPI.transfer(regAddr | 0x80);     // set to read mode
  axisData = SPI.transfer16(0x00);
  digitalWrite(SPI_CS, HIGH);

  return axisData;
}

void setupWifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set MQTT broker and callback function
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  while (!client.connected()) {
    if (client.connect("ESP32-C3" + playerId)) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed to connect to MQTT broker, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* message, unsigned int length) {
  //client.publish("TEST", "hello from esp");
}

void createImpactLog(){
  int totalLength = 0;
  for (const auto& entry : impactLog) {
      totalLength += entry.size() * 20;
  }
  totalLength += 100;

  char response[totalLength];
  response[0] = '\0';

  strcat(response, "{\"pid\": ");
  sprintf(response + strlen(response), "%d, \"time\": \"37.4\", \"max_impact\": %.2f, \"all_readings\": [", playerId, maxImpact);

  for (size_t i = 0; i < impactLog.size(); i++) {
      strcat(response, "{");
      for (auto it = impactLog[i].begin(); it != impactLog[i].end(); ++it) {
          sprintf(response + strlen(response), "\"%s\": %.2f", it->first.c_str(), it->second);
          if (std::next(it) != impactLog[i].end()) {
              strcat(response, ", ");
          }
      }
      strcat(response, "}");
      if (i < impactLog.size() - 1) {
          strcat(response, ", ");
      }
  }

  strcat(response, "]}");

  Serial.println(response);

  client.publish("impact/logs", response);
}

String getTime() {
  unsigned long nowMillis = millis();
  unsigned long elapsedTime = startTimer - elapsedTime;
  unsigned long seconds = elapsedTime / 1000; 
  unsigned long minutes = seconds / 60; 
  seconds = seconds % 60; 
  char timeStr[16]; 
  sprintf(timeStr, "%lu:%02lu", minutes, seconds); 
  return String(timeStr);
}
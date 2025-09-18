# GUARD - Grid Usage Anomaly Recognition and Disconnection
## 👥 Team
![Team GUARD](public/kelompok.png)
- **Leader Supervisor**: [Sakti Cahya Buana]
- **Web Developer**: [Muhammad Farrel Akbar, Sakti Cahya Buana]
- **Instrument Technician**: [Stasya Adelia, Christy Clarrimond Kewas, Ahmad Maydanul Ilmi]
- **Institution**: [Gadjah Mada University, Indonesia]

## 📋 Deskripsi Proyek

GUARD (Grid Usage Anomaly Recognition and Disconnection) adalah sistem deteksi anomali daya yang terintegrasi dengan website sebagai kontrol utama bagi pengguna untuk memonitor dan memutus daya. Sistem ini dikembangkan untuk menyelesaikan permasalahan dalam sektor rumah tangga, khususnya dalam hal pemantauan konsumsi daya yang tidak termonitor secara real-time.

### ✨ Fitur Utama

- 🔍 **Real-time Monitoring**: Pemantauan daya 24/7 dengan interval sampling 1 menit
- ⚡ **Smart Protection**: Pemutusan daya otomatis saat terdeteksi anomali 
- 📊 **Energy Analytics**: Analisis konsumsi daya dengan visualisasi data
- 🌐 **Web Interface**: Dashboard responsif untuk monitoring dan kontrol jarak jauh
- 🔒 **Authentication**: Sistem keamanan dengan JWT token dan password hashing
- 📱 **Hybrid Operation**: Dapat beroperasi online dan offline

## 🏗️ Arsitektur Sistem

### Hardware Components
- **STM32 Microcontroller**: Unit pemrosesan utama
- **ESP8266 WiFi Module**: Komunikasi wireless
- **Current & Voltage Sensors**: Monitoring parameter listrik
- **Relay Module**: Kontrol pemutusan daya

### Software Stack

#### Frontend
- **React 18**: JavaScript library untuk user interface
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

#### Backend & Database
- **PostgreSQL**: Database utama via Supabase
- **REST API**: HTTP communication layer
- **JWT Authentication**: Session management
- **bcrypt**: Password hashing

#### Embedded System
- **STM32Cube IDE**: Development environment
- **C/C++**: Firmware programming language
- **FreeRTOS**: Real-time operating system (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- STM32Cube IDE
- Supabase account
- Hardware components (STM32, ESP8266, sensors)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/username/guard-system.git
cd guard-system
```

#### 2. Frontend Setup
```bash
cd guard-frontend
npm install
```

#### 3. Environment Configuration
Buat file `.env` di folder frontend:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=your_api_base_url
```

#### 4. Start Development Server
```bash
npm start
```

#### 5. Hardware Setup
1. Flash firmware STM32 menggunakan STM32Cube IDE
2. Konfigurasi ESP8266 dengan credentials WiFi
3. Hubungkan sensor dan relay sesuai skematik

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Device Monitoring
```http
GET /api/device/status
Authorization: Bearer <jwt_token>
```

### Sensor Data
```http
POST /api/sensor/data
Content-Type: application/json

{
  "device_id": "GUARD_001",
  "timestamp": "2025-01-15T10:30:00",
  "voltage": 220.5,
  "current": 0.68,
  "power": 149.94,
  "is_anomaly": false
}
```

### Anomaly Management
```http
# Submit anomaly report
POST /api/anomaly

# Get anomaly logs
GET /api/anomaly/logs

# Remote control action
POST /api/control/action
```

## 🗃️ Database Schema

### Core Tables

#### Users
- `user_id` (PK): Unique identifier
- `username`: User login name
- `password_hash`: Hashed password
- `email`: User email address
- `created_at`: Account creation timestamp

#### Sensor_Data
- `data_id` (PK): Unique data identifier
- `kulkas_id` (FK): Device reference
- `timestamp`: Data collection time
- `voltage`: Voltage reading (DECIMAL)
- `current`: Current reading (DECIMAL)
- `power`: Power calculation (DECIMAL)
- `phase_type`: Power phase information
- `is_anomaly`: Anomaly detection flag

#### Anomaly_Logs
- `anomaly_id` (PK): Unique anomaly identifier
- `kulkas_id` (FK): Device reference
- `anomaly_type`: Type of detected anomaly
- `detected_at`: Detection timestamp
- `status`: Current anomaly status

## 🔧 Konfigurasi Hardware

### STM32 Configuration
```c
// ADC Configuration for voltage/current sensing
HAL_ADC_ConfigChannel(&hadc1, &sConfig);

// UART Configuration for ESP8266 communication
huart2.Init.BaudRate = 9600;
huart2.Init.WordLength = UART_WORDLENGTH_8B;

// GPIO Configuration for relay control
GPIO_InitStruct.Pin = RELAY_PIN;
GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
```

### ESP8266 WiFi Setup
```c
// Connect to WiFi network
AT+CWJAP="SSID","PASSWORD"

// Configure HTTP POST for data transmission
AT+HTTPCLIENT=3,0,"http://api.guard.com/sensor/data",,,1,"{data}"
```

## 📊 Data Flow

1. **Sensor Reading**: STM32 membaca data voltage dan current
2. **Data Processing**: Kalkulasi RMS, deteksi threshold anomali
3. **Local Storage**: Data disimpan sementara di STM32 jika offline
4. **WiFi Transmission**: ESP8266 mengirim data ke cloud via HTTP
5. **Cloud Processing**: Backend memproses dan menyimpan ke PostgreSQL
6. **Real-time Update**: Dashboard menampilkan data secara live
7. **Anomaly Detection**: Sistem memicu proteksi jika diperlukan

## 🛡️ Security Features

- **JWT Authentication**: Secure session management
- **Password Hashing**: bcrypt untuk keamanan password
- **API Key**: Device authentication untuk STM32
- **Input Validation**: Proteksi SQL injection
- **HTTPS**: Encrypted communication (production)

## 🔍 Testing

### Frontend Testing
```bash
npm test
npm run test:coverage
```

### API Testing
Gunakan Postman collection yang tersedia di `/docs/postman/`

### Hardware Testing
- Simulasi deteksi anomali via Visual Studio Code
- Testing relay control melalui web interface
- Validasi komunikasi UART STM32-ESP8266

## 📈 Monitoring & Analytics

Dashboard menyediakan:
- Real-time power consumption graphs
- Historical data analysis
- Anomaly detection logs
- Energy efficiency metrics
- Device status monitoring

## 🚨 Troubleshooting

### Common Issues

#### Frontend tidak terhubung ke API
```bash
# Periksa environment variables
echo $REACT_APP_API_BASE_URL

# Restart development server
npm start
```

#### STM32 tidak mengirim data
1. Periksa koneksi UART ke ESP8266
2. Validasi konfigurasi WiFi
3. Cek status koneksi internet

#### Database connection error
1. Verifikasi credentials Supabase
2. Periksa network connectivity
3. Restart backend service

## 📚 Documentation

- [Hardware Schematic](docs/hardware/schematic.pdf)
- [API Documentation](docs/api/endpoints.md)
- [Database Design](docs/database/schema.sql)
- [User Manual](docs/user/manual.pdf)

## 🔄 Changelog

### v1.0.0 (2025-01-15)
- Web dashboard UI implementation

**⚡ GUARD System - Protecting Your Home, One Anomaly at a Time**
# NineHertz Healthcare System

<div align="center">
  <img src="./frontend/public/hospital.png" alt="NineHertz Healthcare" width="200"/>
  
  ### A Comprehensive Healthcare Management Platform
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## 🏥 System Overview

NineHertz Healthcare System is a comprehensive full-stack healthcare management platform built with modern technologies. It provides a complete ecosystem for managing patients, doctors, appointments, prescriptions, billing, and medical records with AI-powered assistance.

## 🛠️ Technology Stack

### Backend Architecture

- **Framework**: NestJS (TypeScript) - Enterprise-grade Node.js framework
- **Database**: TypeORM with PostgreSQL/MySQL - Robust ORM with type safety
- **Authentication**: JWT tokens with refresh token support
- **API Documentation**: Swagger/OpenAPI for comprehensive API docs
- **AI Integration**: Together AI for intelligent chatbot functionality
- **Validation**: Class-validator for request validation
- **Security**: Helmet, CORS, and rate limiting

### Frontend Architecture

- **Framework**: React 18 with TypeScript - Modern React with concurrent features
- **Routing**: TanStack Router - Type-safe routing solution
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React Context + Custom hooks pattern
- **UI Components**: Shadcn/ui components - Accessible, customizable components
- **Animations**: Framer Motion for smooth interactions
- **Notifications**: Sonner for elegant toast notifications
- **Forms**: React Hook Form with Zod validation
- **API Client**: Axios with interceptors for error handling

## 📋 Key Features

### 👥 User Management

- **Multi-role System**: Patients, Doctors, Pharmacists, Admins
- **Universal Authentication**: Single login system for all user types
- **Profile Management**: Role-specific profiles with detailed information
- **Account Security**: Password encryption and JWT token management

### 🩺 Doctor Features

- **Schedule Management**: Create and manage weekly schedules
- **Appointment Dashboard**: View and manage patient appointments
- **Prescription System**: Create prescriptions for patients
- **Medical Records**: Access and update patient medical histories
- **Slot Management**: Advanced time slot allocation system

### 🏥 Patient Features

- **Appointment Booking**: Easy 4-step booking process
- **Doctor Selection**: Browse available doctors by specialty
- **Medical History**: Access personal medical records
- **Billing Dashboard**: View and pay medical bills
- **Prescription Tracking**: Track active prescriptions

### 💊 Pharmacy Features

- **Inventory Management**: Track medicine stock and availability
- **Prescription Processing**: Handle prescription orders
- **Order Management**: Process and fulfill medicine orders

### 👨‍💼 Admin Features

- **User Management**: Create and manage all user accounts
- **Doctor Registration**: Two-step professional registration process
- **System Oversight**: Monitor system usage and performance
- **Debug Tools**: Advanced debugging and troubleshooting tools

### 🤖 AI Chatbot (Coco)

- **Hospital-Specific**: Focuses only on NineHertz Healthcare services
- **Appointment Assistance**: Helps users book appointments
- **Multilingual Support**: English, French, and Kiswahili
- **Real Doctor Integration**: Shows actual doctors from your system
- **Service Information**: Provides hospital hours and service details

### 💰 Billing System

- **Session-Based Billing**: Tracks charges across user sessions
- **Automatic Fee Calculation**: Consultation fees (KES 2,000) auto-added
- **Tax Integration**: 16% VAT calculation
- **Payment Tracking**: Multiple payment status management
- **Receipt Generation**: Detailed billing breakdowns

## 🏗️ System Architecture & Implementation

### 1. **Foundation Layer** (Database & Models)

```typescript
// Core User Entity
@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  User_id: number;

  @Column()
  Email: string;

  @Column({ type: "enum", enum: User_Type })
  User_Type: User_Type; // Patient, Doctor, Pharmacist, Admin

  @Column()
  First_Name: string;

  @Column()
  Last_Name: string;
}
```

**Relationships**:

- `User` → `Patient` (One-to-One)
- `User` → `Doctor` (One-to-One)
- `User` → `Pharmacy` (One-to-One)
- `Doctor` → `Appointment[]` (One-to-Many)
- `Patient` → `Appointment[]` (One-to-Many)

### 2. **Authentication System Evolution**

**Phase 1: Multi-System Login** (Deprecated)

```tsx
// Old: Separate login for each user type
<DoctorLogin /> // License-based login
<PatientLogin /> // Email-based login
<PharmacyLogin /> // License-based login
```

**Phase 2: Universal Login** (Current)

```tsx
// New: Single login system for all users
<UniversalLoginForm />
// Email/password for all user types
// Role-based redirection after authentication
```

### 3. **Smart Appointment System**

**Implementation Flow**:

```typescript
// 4-Step Booking Process
1. Select Doctor → 2. Select Date → 3. Select Time → 4. Confirm Booking

// Backend Logic
- Real-time slot availability checking
- Patient profile validation
- Doctor schedule verification
- Automatic consultation fee addition
- Slot marking as unavailable
```

**Key Technical Achievement**:

```typescript
// Fixed: Appointments not showing for doctors
// Problem: Backend was querying by User_id instead of Doctor_id
// Solution:
async findByDoctorId(Doctor_id: number): Promise<Appointment[]> {
  return await this.appointmentRepository.find({
    where: { Doctor_id }, // ✅ Direct Doctor_id lookup
    relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
  });
}
```

### 4. **Intelligent Prescription System**

```tsx
// Smart Patient Selection
const CreatePrescriptionModal = ({ Doctor_id }) => {
  // Shows only patients with appointments under the logged-in doctor
  const fetchPatients = async () => {
    const appointments = await appointmentApi.getByDoctorId(Doctor_id);
    const uniquePatients = extractUniquePatients(appointments);
    setPatients(uniquePatients);
  };
};
```

### 5. **Session-Based Billing Architecture**

```typescript
export const useSessionBilling = () => {
  // Smart session management
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);

  // Auto-saves to localStorage per user
  const getSessionKey = () =>
    `healthcare-session-${user?.User_id || 'guest'}`;

  // Calculates totals with tax
  const calculateTotals = (): SessionBilling => {
    const subtotal = /* consultation + medicines + prescriptions */;
    const taxAmount = subtotal * 0.16; // 16% VAT
    const totalAmount = subtotal + taxAmount;
    return { /* detailed breakdown */ };
  };
};
```

### 6. **AI Chatbot Integration**

```typescript
// Hospital-Specific Intelligence
@Injectable()
export class ChatbotService {
  async askCoco(prompt: string, role: UserRole): Promise<string> {
    // Fetches real doctors from YOUR database
    const doctors = await this.doctorsService.findAll();

    // Provides appointment booking assistance
    if (prompt.includes("book appointment")) {
      return await this.handleAppointmentBookingRequest(prompt);
    }

    // Hospital-specific service information
    if (prompt.includes("services")) {
      return this.getHospitalServicesInfo();
    }

    // Prevents external hospital recommendations
    if (prompt.includes("other hospitals")) {
      return "I'm your AI assistant for NineHertz Healthcare System only...";
    }
  }
}
```

## 🎨 UI/UX Implementation

### Dark Mode System

```tsx
// Comprehensive theme support across all components
const DarkModeButton = () => (
  <button
    onClick={toggleTheme}
    className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
  >
    {theme === "dark" ? <Sun /> : <Moon />}
  </button>
);

// Tab components with dark mode
<TabsList className="bg-gray-100 dark:bg-gray-800">
  <TabsTrigger className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
    Tab Content
  </TabsTrigger>
</TabsList>;
```

### Responsive Design

- **Mobile-First**: Tailwind CSS breakpoints
- **Grid Layouts**: Responsive dashboards
- **Flexible Components**: Adapts to screen sizes
- **Touch-Friendly**: Mobile gesture support

## 🔄 Development Evolution Path

### Phase 1: Foundation (Simple) ✅

```typescript
// Basic CRUD operations
- User creation and authentication
- Simple profile management
- Basic database relationships
```

### Phase 2: Core Features (Medium) ✅

```typescript
// Healthcare-specific functionality
- Doctor schedule creation
- Basic appointment booking
- Simple prescription system
- Patient medical records
```

### Phase 3: Advanced Features (Complex) ✅

```typescript
// Intelligent systems
- Smart appointment management
- Session-based billing
- Multi-step admin registration
- Real-time availability tracking
```

### Phase 4: Intelligence & Polish (Most Complex) ✅

```typescript
// AI and advanced UX
- AI chatbot integration (Coco)
- Advanced billing calculations
- Dark mode implementation
- System-wide optimizations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL or MySQL database
- Together AI API key (for chatbot)

### Backend Setup

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
# Backend (.env)
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
TOGETHER_API_KEY=your_together_ai_key

# Frontend (.env.local)
VITE_API_URL=http://localhost:3000
```

## 🔧 Key Problem-Solving Examples

### Problem 1: Doctor Authentication Complexity

**Issue**: Multiple login systems (license-based for doctors, email for patients)

```typescript
// Old Approach
const DoctorLogin = () => {
  // License number-based login
  const { token, user, doctor } = await doctorApi.login({ License_number });
};
```

**Solution**: Universal authentication system

```typescript
// New Approach
const UniversalLoginForm = () => {
  // Email/password for all user types
  const response = await userApi.login({ email, password });
  // Role-based redirection
};
```

**Impact**:

- ✅ Simplified user experience
- ✅ Easier maintenance
- ✅ Consistent authentication flow

### Problem 2: Appointment Display Bug

**Issue**: New appointments not showing in doctor dashboard

**Root Cause Analysis**:

```typescript
// ❌ Incorrect: Querying by User_id
async findByDoctorId(Doctor_id: number) {
  return await this.appointmentRepository.find({
    where: { doctor: { user: { User_id: Doctor_id } } }, // Wrong!
  });
}
```

**Solution**:

```typescript
// ✅ Correct: Direct Doctor_id lookup
async findByDoctorId(Doctor_id: number) {
  return await this.appointmentRepository.find({
    where: { Doctor_id }, // Direct lookup
    relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
  });
}
```

**Impact**:

- ✅ Proper appointment tracking for doctors
- ✅ Prescription system works correctly
- ✅ Accurate patient lists for doctors

### Problem 3: Billing System Complexity

**Challenge**: Track multiple charges across user sessions

**Solution**: Session-based billing with localStorage persistence

```typescript
export const useSessionBilling = () => {
  const addSessionItem = (item: SessionItem) => {
    // Automatic consultation fee: KES 2,000
    // Handles medicine orders and prescriptions
    // Calculates 16% VAT automatically
    // Persists per user in localStorage
  };

  const calculateTotals = (): SessionBilling => {
    // Consultation fees + Medicine orders + Prescriptions + Tax
    // Returns detailed breakdown for user
  };
};
```

**Impact**:

- ✅ Seamless billing across app usage
- ✅ Automatic fee calculations
- ✅ Transparent pricing for users

## 🧠 AI Integration Details

### Coco Chatbot Features

```typescript
// Hospital-Specific Responses
if (prompt.includes("available doctors")) {
  // Fetches real doctors from your database
  const doctors = await this.doctorsService.findAll();
  const doctorList = doctors.map(
    (doctor) =>
      `Dr. ${doctor.user.First_Name} ${doctor.user.Last_Name} - ${doctor.Specialization}`
  );
  return `Our available doctors:\n${doctorList.join("\n")}`;
}

// Appointment Booking Assistance
if (prompt.includes("book appointment")) {
  return `I can help you book an appointment! Here are our available doctors:
  
1. Visit our appointment booking section
2. Select your preferred doctor
3. Choose an available date and time
4. Complete the booking form

Our hospital is open Monday to Saturday, 8:00 AM to 6:00 PM.`;
}
```

### Multilingual Support

- **English**: Primary language
- **French**: "Bonjour! Je suis Coco, votre assistant IA..."
- **Kiswahili**: "Habari! Mimi ni Coco, msaidizi wako wa AI..."

## 📊 System Statistics

### Database Schema

- **Tables**: 15+ entities
- **Relationships**: 20+ foreign key relationships
- **Indexes**: Optimized for performance
- **Constraints**: Data integrity enforcement

### API Endpoints

- **Authentication**: 5 endpoints
- **Users**: 8 endpoints
- **Appointments**: 10 endpoints
- **Doctors**: 12 endpoints
- **Prescriptions**: 8 endpoints
- **Billing**: 6 endpoints
- **Chatbot**: 2 endpoints
- **Total**: 50+ RESTful endpoints

### Frontend Components

- **Pages**: 15+ main routes
- **Components**: 50+ reusable components
- **Hooks**: 10+ custom hooks
- **Contexts**: 5 context providers

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Different permissions for user types
- **Password Encryption**: bcrypt hashing
- **Session Management**: Automatic token refresh

### Data Protection

- **Input Validation**: Server-side validation with class-validator
- **SQL Injection Prevention**: TypeORM query builder
- **XSS Protection**: Content sanitization
- **CORS Configuration**: Controlled cross-origin requests

## 🚀 Performance Optimizations

### Backend Optimizations

- **Database Relations**: Optimized queries with proper joins
- **Caching**: Redis integration ready
- **Pagination**: Large dataset handling
- **Error Handling**: Comprehensive error responses

### Frontend Optimizations

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

## 📈 Future Enhancement Roadmap

### Phase 5: Real-time Features

- [ ] WebSocket integration for live notifications
- [ ] Real-time appointment updates
- [ ] Live chat between doctors and patients
- [ ] Push notifications for mobile

### Phase 6: Advanced Integrations

- [ ] Payment Gateway (Stripe/PayPal/M-Pesa)
- [ ] SMS notifications (Twilio)
- [ ] Email automation (SendGrid)
- [ ] Calendar integration (Google Calendar)

### Phase 7: Telemedicine

- [ ] Video consultation features
- [ ] Screen sharing for doctors
- [ ] Digital prescription signing
- [ ] Remote patient monitoring

### Phase 8: Analytics & Insights

- [ ] Usage analytics dashboard
- [ ] Patient health insights
- [ ] Doctor performance metrics
- [ ] Revenue analytics

### Phase 9: Mobile & Expansion

- [ ] React Native mobile app
- [ ] Multi-hospital support
- [ ] API marketplace
- [ ] Third-party integrations

### Phase 10: Advanced AI

- [ ] Diagnostic assistance AI
- [ ] Symptom checker
- [ ] Drug interaction warnings
- [ ] Predictive health analytics

## 💬 Healthcare Chat Feature (Current Implementation)

### Overview

The Healthcare Chat feature enables secure communication between patients, doctors, and pharmacists within the healthcare platform. It supports direct messaging, file attachments, and real-time status updates.

### Features

- Real-time messaging between users
- Support for text messages and file attachments
- Message status tracking (sent, delivered, read)
- User online/offline status
- Conversation search
- Unread message count

### Technical Implementation

#### Backend Entities

- **Message**: Stores message content, type, and status
- **Conversation**: Manages chat sessions between users
- **Sender**: Tracks participants in conversations

#### Frontend Components

- **ChatSidebar**: Displays list of conversations with search functionality
- **ChatWindow**: Shows messages and input for a selected conversation
- **MessageBubble**: Renders individual messages with appropriate styling

#### API Endpoints

- GET `/messages/conversation/:id` - Get messages for a conversation
- POST `/messages` - Create a new message
- PATCH `/messages/:id/read` - Mark a message as read
- GET `/conversations/user/:id` - Get conversations for a user
- POST `/conversations` - Create a new conversation

#### Data Flow

1. User selects a conversation from the sidebar
2. Messages are fetched for the selected conversation
3. User sends a message, which is stored in the database
4. Message status is updated as it's delivered and read

#### Future Chat Enhancements

- Group messaging
- Voice and video calls
- Message encryption
- Message reactions and replies
- Typing indicators

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Testing Guidelines

- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: End-to-end testing with Playwright
- **API Tests**: Postman/Insomnia collections
- **Manual Testing**: User acceptance testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Alumasa45** - [GitHub Profile](https://github.com/Alumasa45)

## 🙏 Acknowledgments

- **NestJS Team** - For the amazing backend framework
- **React Team** - For the powerful frontend library
- **Tailwind CSS** - For the utility-first CSS framework
- **Together AI** - For the AI chatbot capabilities
- **Shadcn/ui** - For the beautiful UI components

---

<div align="center">
  <p>Built with ❤️ for better healthcare management</p>
  <p>© 2025 NineHertz Healthcare System. All rights reserved.</p>
</div>

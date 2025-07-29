import { Injectable } from '@nestjs/common';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';
import { Together } from 'together-ai';

@Injectable()
export class ChatbotService {
  private readonly together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  constructor(
    private readonly appointmentService: AppointmentsService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  async askCoco(
    prompt: string,
    role: 'doctor' | 'patient' | 'pharmacist' | 'admin',
  ): Promise<string> {
    const cleanedPrompt = prompt.toLowerCase().trim();

    const greetings = [
      'hi',
      'hello',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'bonjour',
      'salut',
      'habari',
      'shikamoo',
    ];
    if (greetings.some((g) => cleanedPrompt.startsWith(g))) {
      return "Hello! I'm Coco, your AI assistant for NineHertz Healthcare System. I can help you book appointments with our doctors, find information about our services, and answer health-related questions in English, French, or Kiswahili. How can I help you today?";
    }

    const allowedKeywords = [
      // English - NineHertz Healthcare System specific
      'ninehertz',
      'our hospital',
      'this hospital',
      'book appointment',
      'schedule appointment',
      'available doctors',
      'doctors here',
      'services here',
      'consultation fee',
      'hospital hours',
      'opening hours',
      'medical records',
      'prescription',
      'pharmacy services',

      // General medical terms
      'hospital',
      'clinic',
      'pharmacy',
      'medicine',
      'medication',
      'drug',
      'tablet',
      'capsule',
      'injection',
      'vaccine',
      'vaccination',
      'prescription',
      'dosage',
      'treatment',
      'therapy',
      'procedure',
      'surgery',
      'operation',
      'checkup',
      'diagnosis',
      'symptom',
      'pain',
      'fever',
      'cough',
      'headache',
      'appointment',
      'consultation',
      'doctor',
      'nurse',
      'midwife',
      'lab',
      'laboratory',
      'test',
      'scan',
      'x-ray',
      'mri',
      'ct scan',
      'ultrasound',
      'blood test',
      'urine test',
      'specimen',
      'results',
      'ward',
      'admission',
      'discharge',
      'referral',
      'follow-up',
      'recovery',
      'prescribe',
      'blood pressure',
      'heart rate',
      'temperature',
      'sick',
      'ill',
      'clinic visit',
      'visit',
      'reservation',
      'malaria',
      'hypertension',
      'diabetes',
      'health tips',
      'advice',
      'preventive care',
      'visit',
      'reservation',
      'malaria',
      'hypertension',
      'diabetes',
      'health tips',
      'advice',
      'preventive care',

      // Swahili
      'hospitali',
      'kliniki',
      'dawa',
      'madawa',
      'tembe',
      'sindano',
      'chanjo',
      'chanjo ya kinga',
      'agizo la dawa',
      'kipimo cha dawa',
      'matibabu',
      'tiba',
      'upasuaji',
      'upimaji',
      'vipimo',
      'uchunguzi',
      'dalili',
      'maumivu',
      'homa',
      'kikohozi',
      'kichwa kuuma',
      'miadi',
      'ushauri',
      'daktari',
      'muuguzi',
      'mkunga',
      'maabara',
      'uchunguzi wa damu',
      'uchunguzi wa mkojo',
      'majibu ya vipimo',
      'wodi',
      'kulazwa',
      'kuruhusiwa',
      'rejea',
      'afya',
      'shinikizo la damu',
      'moyo kupiga',
      'joto la mwili',
      'mgonjwa',
      'maradhi',
      'ziara ya kliniki',
      'ratiba ya kliniki',
      'kuweka miadi',
      'ratiba',
      'tembelea',
      'uhifadhi',
      'malaria',
      'shinikizo la damu',
      'kisukari',
      'vidokezo vya afya',
      'ushauri',
      'huduma za kinga',

      // French
      'hôpital',
      'clinique',
      'pharmacie',
      'médicament',
      'médication',
      'comprimé',
      'capsule',
      'injection',
      'vaccin',
      'vaccination',
      'ordonnance',
      'posologie',
      'traitement',
      'thérapie',
      'procédure',
      'chirurgie',
      'opération',
      'examen médical',
      'diagnostic',
      'symptôme',
      'douleur',
      'fièvre',
      'toux',
      'mal de tête',
      'rendez-vous',
      'consultation',
      'médecin',
      'infirmier',
      'sage-femme',
      'laboratoire',
      'analyse',
      'test',
      'prise de sang',
      'analyse d’urine',
      'échantillon',
      'résultats',
      'salle',
      'hospitalisation',
      'sortie',
      'référence',
      'suivi',
      'rétablissement',
      'prescrire',
      'pression artérielle',
      'fréquence cardiaque',
      'température corporelle',
      'malade',
      'maladie',
      'visite médicale',
      'prendre rendez-vous',
      'planifier',
      'visite',
      'réservation',
      'paludisme',
      'hypertension',
      'diabète',
      'conseils de santé',
      'prévention',
      'soins préventifs',
    ];

    const medicalRegex =
      /\b(test|scan|appointment|book|disease|malaria|tips|schedule|procedure|symptom|medication|clinic|hospital)\b/i;
    const isRelevant =
      allowedKeywords.some((kw) => cleanedPrompt.includes(kw)) ||
      medicalRegex.test(cleanedPrompt);

    function extractDateFromPrompt(prompt: string): string | null {
      const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
      const match = prompt.match(dateRegex);

      if (match) {
        return match[1];
      }

      if (prompt.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }

      if (prompt.includes('next monday')) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
        today.setDate(today.getDate() + daysUntilMonday);
        return today.toISOString().split('T')[0];
      }
      return null;
    }

    // Handle appointment booking requests
    if (
      (cleanedPrompt.includes('book') &&
        cleanedPrompt.includes('appointment')) ||
      (cleanedPrompt.includes('schedule') &&
        cleanedPrompt.includes('appointment')) ||
      cleanedPrompt.includes('make appointment') ||
      cleanedPrompt.includes('see doctor') ||
      cleanedPrompt.includes('visit doctor')
    ) {
      return await this.handleAppointmentBookingRequest(cleanedPrompt);
    }

    // Handle doctor availability requests
    if (
      cleanedPrompt.includes('available doctors') ||
      cleanedPrompt.includes('doctors available') ||
      cleanedPrompt.includes('find doctor') ||
      cleanedPrompt.includes('list doctors')
    ) {
      return await this.handleDoctorAvailabilityRequest();
    }

    // Handle service information requests
    if (
      cleanedPrompt.includes('services') ||
      cleanedPrompt.includes('what can you do') ||
      cleanedPrompt.includes('help') ||
      cleanedPrompt.includes('hospital hours') ||
      cleanedPrompt.includes('opening hours')
    ) {
      return this.getHospitalServicesInfo();
    }

    // Handle requests for external hospitals (redirect to our system)
    if (
      cleanedPrompt.includes('other hospitals') ||
      cleanedPrompt.includes('nearby hospitals') ||
      cleanedPrompt.includes('find hospitals') ||
      cleanedPrompt.includes('recommend hospital') ||
      cleanedPrompt.includes('best hospital')
    ) {
      return "I'm Coco, your AI assistant specifically for NineHertz Healthcare System. I can only help you with our hospital's services, doctors, and appointments. For the best care, I recommend booking an appointment with one of our qualified doctors. Would you like me to show you our available doctors or help you book an appointment?";
    }

    if (!isRelevant) {
      return "I'm Coco, your AI assistant for NineHertz Healthcare System. I can help you with:\n\n• Booking appointments with our doctors\n• Finding available doctors and their specialties\n• Information about our hospital services\n• General health advice and questions\n\nPlease ask me something related to our healthcare services. I support English, French, and Kiswahili.";
    }

    const systemPrompt =
      this.buildSystemPrompt(role) +
      ` You are specifically helping users with NineHertz Healthcare System services. Do not suggest external hospitals or clinics. Focus on our hospital's services, doctors, and appointment booking. Respond in the same language the user asked in. Support English, French, and Kiswahili.`;

    try {
      const response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      });

      return (
        response.choices?.[0]?.message?.content ??
        'Sorry, Coco was unable to respond.'
      );
    } catch (error) {
      console.error('Coco AI (TogetherAI) Error:', error);
      return 'Sorry, Coco is currently unavailable. Please try again later.';
    }
  }

  private async handleAppointmentBookingRequest(
    prompt: string,
  ): Promise<string> {
    try {
      // Get available doctors from your system
      const doctors = await this.doctorsService.findAll();

      if (!doctors || doctors.length === 0) {
        return "I'm sorry, but I cannot find any doctors in our system at the moment. Please contact our reception at the front desk for assistance.";
      }

      // Format doctor list for user
      const doctorList = doctors
        .slice(0, 5)
        .map((doctor, index) => {
          const name =
            `Dr. ${doctor.user?.First_Name || ''} ${doctor.user?.Last_Name || ''}`.trim() ||
            'Name not available';
          const specialty = doctor.Specialization || 'General Practice';
          return `${index + 1}. ${name} - ${specialty}`;
        })
        .join('\n');

      return `I'd be happy to help you book an appointment! Here are some of our available doctors:\n\n${doctorList}\n\nTo book an appointment, please:\n1. Visit our appointment booking section on the website\n2. Select your preferred doctor\n3. Choose an available date and time\n4. Complete the booking form\n\nOur hospital is open Monday to Saturday, 8:00 AM to 6:00 PM. Would you like me to provide more information about any specific doctor or service?`;
    } catch (error) {
      console.error('Error fetching doctors for appointment booking:', error);
      return "I'm having trouble accessing our doctor database right now. Please try booking directly through our appointment system or contact our reception for assistance.";
    }
  }

  private async handleDoctorAvailabilityRequest(): Promise<string> {
    try {
      const doctors = await this.doctorsService.findAll();

      if (!doctors || doctors.length === 0) {
        return "I'm sorry, but I cannot find any doctors in our system at the moment. Please contact our reception for current doctor availability.";
      }

      // Group doctors by specialization
      const doctorsBySpecialty = doctors.reduce(
        (acc, doctor) => {
          const specialty = doctor.Specialization || 'General Practice';
          if (!acc[specialty]) {
            acc[specialty] = [];
          }
          acc[specialty].push(
            `Dr. ${doctor.user?.First_Name || ''} ${doctor.user?.Last_Name || ''}`.trim(),
          );
          return acc;
        },
        {} as Record<string, string[]>,
      );

      let response =
        'Here are our available doctors organized by specialty:\n\n';

      Object.entries(doctorsBySpecialty).forEach(([specialty, doctorNames]) => {
        response += `**${specialty}:**\n`;
        doctorNames.forEach((name) => {
          response += `• ${name}\n`;
        });
        response += '\n';
      });

      response +=
        'To book an appointment with any of these doctors, please use our online appointment booking system. All doctors are available Monday to Saturday, 8:00 AM to 6:00 PM.';

      return response;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return "I'm having trouble accessing our doctor database right now. Please contact our reception for current doctor availability.";
    }
  }

  private getHospitalServicesInfo(): string {
    return `Welcome to NineHertz Healthcare System! Here's what I can help you with:

🏥 **Our Services:**
• General consultations with qualified doctors
• Specialist consultations (various specialties available)
• Medical prescriptions and pharmacy services
• Patient medical records management
• Telemedicine consultations
• In-person and follow-up appointments

🕒 **Hospital Hours:**
Monday to Saturday: 8:00 AM - 6:00 PM
Sunday: Closed (Emergency services available)

💻 **How I Can Help:**
• Book appointments with our doctors
• Find available doctors and their specialties
• Provide general health information
• Answer questions about our services
• Assist with appointment scheduling

📞 **Need Human Assistance?**
For complex bookings or urgent matters, please contact our reception desk directly.

What would you like help with today?`;
  }

  private buildSystemPrompt(role: string): string {
    const basePrompt = `You are Coco, an AI assistant for NineHertz Healthcare System. You help users with our hospital services ONLY - do not suggest external hospitals or browse other healthcare facilities. Our hospital operates Monday to Saturday, 8:00 AM to 6:00 PM.`;

    switch (role) {
      case 'doctor':
        return `${basePrompt} You are assisting doctors with clinical tasks. Analyze symptoms, patient history, and suggest accurate diagnoses, tests, and treatment plans within our hospital system. Be medically sound, concise, and confident.`;
      case 'pharmacy':
        return `${basePrompt} You are assisting pharmacists in our hospital pharmacy. Suggest appropriate medications from our inventory, dosages, instructions, and safety checks based on diagnoses or symptoms.`;
      case 'patient':
        return `${basePrompt} You are helping patients with our hospital services. Help them:
        - Book appointments with our doctors
        - Understand our medical procedures and services
        - Get information about our hospital departments
        - Navigate our healthcare system
        Explain everything in clear, simple language. Be caring, helpful, and accurate. Focus only on NineHertz Healthcare System services.`;
      default:
        return `${basePrompt} Help users with:
        - Booking appointments with our doctors
        - Information about our medical services
        - Hospital hours and availability
        - General health guidance
        Focus exclusively on NineHertz Healthcare System. Do not recommend external facilities.`;
    }
  }
}

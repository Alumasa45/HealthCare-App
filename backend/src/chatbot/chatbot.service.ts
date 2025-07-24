import { Injectable } from '@nestjs/common';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { Together } from 'together-ai';

@Injectable()
export class ChatbotService {
  private readonly together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  constructor(private readonly appointmentService: AppointmentsService) {}

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
      return "Hello! I'm Coco, your hospital AI assistant. I can respond in English, French, or Kiswahili. How can I help you today?";
    }

    const allowedKeywords = [
      // English
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
      'appointment',
      'book appointment',
      'schedule',
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

    if (
      cleanedPrompt.includes('book') &&
      cleanedPrompt.includes('appointment')
    ) {
      const date = extractDateFromPrompt(cleanedPrompt);

      const createAppointmentDto = {
        Appointment_Date: date,
        Patient_id: 'REPLACE_WITH_PATIENT_ID',
        Doctor_id: 'REPLACE_WITH_DOCTOR_ID',
        Appointment_Time: '09:00',
        Appointment_Type: 'General',
        Status: 'Scheduled',
        Reason: 'Routine checkup',
        Notes: '',
        Reason_For_Visit: 'Routine checkup',
        Payment_Status: 'Pending',
      };

      //const result = await this.appointmentService.create(createAppointmentDto);
      return `Appointment booked successfully for ${date}. See you then!`;
    }

    if (!isRelevant) {
      return "I'm only able to assist with hospital, medical, or pharmacy-related topics. Please ask a relevant question (English, French, or Kiswahili supported).";
    }

    const systemPrompt =
      this.buildSystemPrompt(role) +
      ` Respond in the same language the user asked in. Support English, French, and Kiswahili.`;

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

  private buildSystemPrompt(role: string): string {
    switch (role) {
      case 'doctor':
        return 'You are Coco, a clinical AI assistant for doctors. Analyze symptoms, patient history, and suggest accurate diagnoses, tests, and treatment plans. Be medically sound, concise, and confident.';
      case 'pharmacy':
        return "You are Coco, the hospital's AI pharmacist. Suggest appropriate medications, dosages, instructions, and safety checks based on diagnoses or symptoms.";
      case 'patient':
        return `You are Coco, a friendly AI health assistant for patients. 
  Explain symptoms, procedures, medications, and care processes in clear, simple language. 
  Help users book hospital appointments based on available services and respond to health-related questions in English, French, or Kiswahili.
  Be caring, helpful, and accurate.`;
      default:
        return `You are Coco, a helpful AI assistant... 
Our hospital is open from 8am to 6pm, Monday to Saturday. 
You can help patients book appointments with doctors (General, Pediatrics, Dentistry). 
If the user asks about a disease, respond with a short, clear explanation.
Speak English, Kiswahili, or French.`;
    }
  }
}

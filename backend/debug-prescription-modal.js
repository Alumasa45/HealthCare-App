const axios = require('axios');

async function debugPrescriptionModal() {
    const baseURL = 'http://localhost:8080'; // Adjust based on your backend URL
    
    try {
        console.log('=== DEBUGGING PRESCRIPTION MODAL ISSUE ===\n');
        
        // Step 1: Check all appointments
        console.log('1. Fetching all appointments...');
        const allAppointments = await axios.get(`${baseURL}/appointments`);
        console.log(`Found ${allAppointments.data.length} total appointments\n`);
        
        if (allAppointments.data.length > 0) {
            console.log('Sample appointment:');
            console.log(JSON.stringify(allAppointments.data[0], null, 2));
            console.log('\n');
        }
        
        // Step 2: Check appointments for each doctor
        console.log('2. Fetching all doctors...');
        const doctors = await axios.get(`${baseURL}/doctors`);
        console.log(`Found ${doctors.data.length} doctors\n`);
        
        for (const doctor of doctors.data) {
            console.log(`\n--- Doctor: ${doctor.user?.First_Name} ${doctor.user?.Last_Name} (ID: ${doctor.Doctor_id}) ---`);
            
            try {
                const doctorAppointments = await axios.get(`${baseURL}/appointments/doctor/${doctor.Doctor_id}`);
                console.log(`Appointments: ${doctorAppointments.data.length}`);
                
                if (doctorAppointments.data.length > 0) {
                    doctorAppointments.data.forEach((apt, index) => {
                        console.log(`  ${index + 1}. Patient: ${apt.patient?.user?.First_Name || 'NO NAME'} ${apt.patient?.user?.Last_Name || ''} (Patient_id: ${apt.Patient_id})`);
                        console.log(`     Status: ${apt.Status}, Date: ${apt.Appointment_Date}`);
                        console.log(`     Has patient relation: ${!!apt.patient}`);
                        console.log(`     Has patient.user relation: ${!!apt.patient?.user}`);
                    });
                } else {
                    console.log('  No appointments found for this doctor');
                }
            } catch (error) {
                console.log(`  Error fetching appointments: ${error.message}`);
            }
        }
        
        // Step 3: Check all patients
        console.log('\n\n3. Fetching all patients...');
        const patients = await axios.get(`${baseURL}/patients`);
        console.log(`Found ${patients.data.length} patients\n`);
        
        if (patients.data.length > 0) {
            console.log('Patient details:');
            patients.data.slice(0, 3).forEach((patient, index) => {
                console.log(`  ${index + 1}. ${patient.user?.First_Name || 'NO NAME'} ${patient.user?.Last_Name || ''} (Patient_id: ${patient.Patient_id}, User_id: ${patient.User_id})`);
                console.log(`     Has user relation: ${!!patient.user}`);
            });
        }
        
        // Step 4: Check a specific doctor's appointments with detailed logging
        if (doctors.data.length > 0) {
            const firstDoctor = doctors.data[0];
            console.log(`\n\n4. Detailed check for Doctor ID ${firstDoctor.Doctor_id}:`);
            
            try {
                const detailedAppointments = await axios.get(`${baseURL}/appointments/doctor/${firstDoctor.Doctor_id}`);
                console.log('Raw response data:');
                console.log(JSON.stringify(detailedAppointments.data, null, 2));
            } catch (error) {
                console.log(`Error: ${error.message}`);
                console.log('Response:', error.response?.data);
            }
        }
        
    } catch (error) {
        console.error('Debug failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

debugPrescriptionModal();

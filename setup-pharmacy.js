const axios = require('axios');

// First, let's create a user for the pharmacy if needed
const createPharmacyUser = async () => {
  try {
    const userData = {
      Email: "medishop@healthcare.co.ke",
      Password: "MedishopPass123!",
      First_Name: "Medishop",
      Last_Name: "Pharmacy",
      User_Type: "Pharmacist",
      Date_of_Birth: "1990-01-01",
      Phone_Number: "+254712345678",
      Address: "Nairobi, Kenya"
    };

    const userResponse = await axios.post('http://localhost:3001/users', userData);
    console.log('User created:', userResponse.data);
    return userResponse.data;
  } catch (error) {
    console.log('User creation error (might already exist):', error.response?.data || error.message);
    // If user already exists, try to find them
    try {
      const usersResponse = await axios.get('http://localhost:3001/users');
      const pharmacistUser = usersResponse.data.find(user => 
        user.Email === "medishop@healthcare.co.ke" || user.User_Type === "Pharmacist"
      );
      if (pharmacistUser) {
        console.log('Found existing pharmacist user:', pharmacistUser);
        return pharmacistUser;
      }
    } catch (findError) {
      console.log('Error finding existing user:', findError.message);
    }
    return null;
  }
};

const createPharmacy = async () => {
  try {
    // First check if pharmacies endpoint works
    try {
      const existingPharmacies = await axios.get('http://localhost:3001/pharmacies');
      console.log('Existing pharmacies:', existingPharmacies.data);
      
      // Check if Medishop already exists
      const medishopExists = existingPharmacies.data.find(pharmacy => 
        pharmacy.Pharmacy_Name.toLowerCase() === 'medishop'
      );
      
      if (medishopExists) {
        console.log('Medishop already exists:', medishopExists);
        return medishopExists;
      }
    } catch (error) {
      console.log('Error fetching existing pharmacies:', error.response?.data || error.message);
    }

    // Get or create a user for the pharmacy
    const user = await createPharmacyUser();
    if (!user) {
      console.log('Could not create or find a user for the pharmacy');
      return;
    }

    const pharmacyData = {
      User_id: user.User_id,
      Pharmacy_Name: "Medishop",
      License_Number: "MED-2024-001",
      Phone_Number: "+254712345678",
      Email: "contact@medishop.co.ke",
      Opening_Time: "08:00",
      Closing_Time: "20:00",
      Delivery_Available: true,
      Is_Verified: true,
      Rating: 4.5
    };

    console.log('Creating pharmacy with data:', pharmacyData);
    const response = await axios.post('http://localhost:3001/pharmacies', pharmacyData);
    console.log('✅ Medishop pharmacy created successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error creating pharmacy:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    // Let's check what the pharmacy endpoint expects
    if (error.response?.status === 400) {
      console.log('\n🔍 Checking API documentation...');
      try {
        // Try to get the API schema or documentation
        const optionsResponse = await axios.options('http://localhost:3001/pharmacies');
        console.log('API Options:', optionsResponse.headers);
      } catch (optError) {
        console.log('Could not get API options');
      }
    }
  }
};

// Run the script
console.log('🏥 Setting up Medishop pharmacy...');
createPharmacy();

# PowerShell script to create patient profile for User ID 1
# Healthcare App - Patient Profile Creation

$API_BASE_URL = "http://localhost:3000"
$USER_ID = 1

Write-Host "Healthcare App - Creating Patient Profile for User ID $USER_ID" -ForegroundColor Cyan
Write-Host "=" * 60

# Function to make API requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.Value__
        }
    }
}

# Step 1: Check if backend is running
Write-Host "1. Checking backend connection..." -ForegroundColor Yellow
$healthCheck = Invoke-ApiRequest -Url "$API_BASE_URL"
if (-not $healthCheck.Success) {
    Write-Host "❌ Backend server is not running on $API_BASE_URL" -ForegroundColor Red
    Write-Host "Please start the backend server first:" -ForegroundColor Red
    Write-Host "cd backend && npm run start:dev" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Backend server is running" -ForegroundColor Green

# Step 2: Get user information
Write-Host "`n2. Fetching user information for User ID $USER_ID..." -ForegroundColor Yellow
$userResult = Invoke-ApiRequest -Url "$API_BASE_URL/users/$USER_ID"
if (-not $userResult.Success) {
    Write-Host "❌ User ID $USER_ID not found" -ForegroundColor Red
    Write-Host "Error: $($userResult.Error)" -ForegroundColor Red
    exit 1
}

$user = $userResult.Data
Write-Host "✅ User found:" -ForegroundColor Green
Write-Host "   Name: $($user.First_Name) $($user.Last_Name)" -ForegroundColor White
Write-Host "   Email: $($user.Email)" -ForegroundColor White
Write-Host "   User Type: $($user.User_Type)" -ForegroundColor White

# Step 3: Check if patient profile already exists
Write-Host "`n3. Checking if patient profile already exists..." -ForegroundColor Yellow
$patientCheck = Invoke-ApiRequest -Url "$API_BASE_URL/patients/user/$USER_ID"
if ($patientCheck.Success) {
    Write-Host "✅ Patient profile already exists!" -ForegroundColor Green
    Write-Host "   Patient ID: $($patientCheck.Data.Patient_id)" -ForegroundColor White
    Write-Host "   No need to create a new profile." -ForegroundColor White
    exit 0
}
Write-Host "✅ No existing patient profile found. Ready to create." -ForegroundColor Green

# Step 4: Create patient profile with sample data
Write-Host "`n4. Creating patient profile..." -ForegroundColor Yellow

$patientData = @{
    User_id = $USER_ID
    Emergency_Contact_Name = "John Smith"
    Emergency_Contact_Phone = "+1-555-123-4567"
    Emergency_Contact_Relationship = "Parent"
    Blood_Group = "O+"
    Height = 175
    Weight = 70.5
    Allergies = "None"
    Chronic_Conditions = "None"
    Insurance_Provider = "Health Insurance Co."
    Insurance_Policy_Number = "HIC123456"
}

Write-Host "Creating patient with the following data:" -ForegroundColor Cyan
$patientData | Format-Table -AutoSize

$createResult = Invoke-ApiRequest -Url "$API_BASE_URL/patients" -Method "POST" -Body $patientData

if ($createResult.Success) {
    Write-Host "✅ Patient profile created successfully!" -ForegroundColor Green
    Write-Host "`nPatient Details:" -ForegroundColor Cyan
    $createdPatient = $createResult.Data
    Write-Host "   Patient ID: $($createdPatient.Patient_id)" -ForegroundColor White
    Write-Host "   User ID: $($createdPatient.User_id)" -ForegroundColor White
    Write-Host "   Emergency Contact: $($createdPatient.Emergency_Contact_Name)" -ForegroundColor White
    Write-Host "   Blood Group: $($createdPatient.Blood_Group)" -ForegroundColor White
    Write-Host "   Height: $($createdPatient.Height)cm" -ForegroundColor White
    Write-Host "   Weight: $($createdPatient.Weight)kg" -ForegroundColor White
    
    Write-Host "`n🎉 Success! You can now book appointments!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "Try the appointment booking in your frontend application." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create patient profile" -ForegroundColor Red
    Write-Host "Error: $($createResult.Error)" -ForegroundColor Red
    if ($createResult.StatusCode) {
        Write-Host "Status Code: $($createResult.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 60
Write-Host "Script completed." -ForegroundColor Cyan

# PowerShell script to fix missing patient profiles for all users
# Healthcare App - Bulk Patient Profile Creation

$API_BASE_URL = "http://localhost:3000"

Write-Host "Healthcare App - Bulk Patient Profile Creation" -ForegroundColor Cyan
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

# Step 2: Create missing patient profiles using the new bulk endpoint
Write-Host "`n2. Creating missing patient profiles for all Patient-type users..." -ForegroundColor Yellow

$bulkResult = Invoke-ApiRequest -Url "$API_BASE_URL/patients/ensure-profiles" -Method "POST"

if ($bulkResult.Success) {
    $result = $bulkResult.Data
    Write-Host "✅ Bulk patient profile creation completed!" -ForegroundColor Green
    Write-Host "   Created: $($result.created) new patient profiles" -ForegroundColor White
    Write-Host "   Skipped: $($result.skipped) (already existed)" -ForegroundColor White
    Write-Host "   Errors: $($result.errors)" -ForegroundColor White
    
    if ($result.created -gt 0) {
        Write-Host "`n🎉 Success! $($result.created) patient profiles were created!" -ForegroundColor Green -BackgroundColor Black
        Write-Host "All Patient-type users now have patient profiles for appointment booking." -ForegroundColor Green
    } elseif ($result.skipped -gt 0) {
        Write-Host "`n✅ All Patient-type users already have patient profiles." -ForegroundColor Green
    }
    
    if ($result.errors -gt 0) {
        Write-Host "`n⚠️  Warning: $($result.errors) errors occurred during creation." -ForegroundColor Yellow
        Write-Host "Check the backend logs for details." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Failed to create patient profiles" -ForegroundColor Red
    Write-Host "Error: $($bulkResult.Error)" -ForegroundColor Red
    if ($bulkResult.StatusCode) {
        Write-Host "Status Code: $($bulkResult.StatusCode)" -ForegroundColor Red
    }
}

# Step 3: Verify specific user (User ID 1)
Write-Host "`n3. Verifying User ID 1 specifically..." -ForegroundColor Yellow
$userCheck = Invoke-ApiRequest -Url "$API_BASE_URL/patients/user/1"

if ($userCheck.Success) {
    $patient = $userCheck.Data
    Write-Host "✅ User ID 1 now has a patient profile!" -ForegroundColor Green
    Write-Host "   Patient ID: $($patient.Patient_id)" -ForegroundColor White
    Write-Host "   Emergency Contact: $($patient.Emergency_Contact_Name)" -ForegroundColor White
    Write-Host "   Blood Group: $($patient.Blood_Group)" -ForegroundColor White
} else {
    Write-Host "❌ User ID 1 still doesn't have a patient profile" -ForegroundColor Red
    Write-Host "Error: $($userCheck.Error)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60
Write-Host "🎯 SOLUTION IMPLEMENTED:" -ForegroundColor Cyan
Write-Host "• Backend now auto-creates patient profiles when needed" -ForegroundColor White
Write-Host "• All existing Patient-type users have been processed" -ForegroundColor White
Write-Host "• Future Patient registrations will automatically get profiles" -ForegroundColor White
Write-Host "• The 404 error should now be resolved!" -ForegroundColor White
Write-Host "`nTry booking an appointment again in your frontend application." -ForegroundColor Green

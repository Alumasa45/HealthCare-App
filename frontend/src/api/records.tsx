import type { MedicalRecords } from "./interfaces/record";

export const recordsApi = {
    create: async (recordData: MedicalRecords) => {
            const response = await fetch('api/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordData),
            });
            return response.json();
        },
    
        findAll: async (): Promise<MedicalRecords[]> => {
            const response = await fetch('api/records');
            return response.json();
        },
    
        findOne: async (Record_id: string): Promise<MedicalRecords | null> => {
            const response = await fetch(`/api/records/${Record_id}`);
            if (response.ok) {
                return response.json();
            }
            return null;
        },
    
        update: async (Record_id: string, recordData: Partial<MedicalRecords>): Promise<MedicalRecords | null> => {
                const response = await fetch(`/api/records/${Record_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(recordData),
                });
                if (response.ok) {
                    return response.json();
                }
                return null;
            },
    
        delete: async (Record_id: string): Promise<boolean> => {
                const response = await fetch(`/api/records/${Record_id}`, {
                method: 'DELETE',
            });
            return response.ok;
        }
}
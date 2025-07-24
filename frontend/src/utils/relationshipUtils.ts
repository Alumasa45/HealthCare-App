/**
 * Utility functions for handling relationship data and foreign keys
 */

import { useAuth } from "@/contexts/AuthContext";

/**
 * Gets the current user ID for use in forms and API calls
 * @returns The current user ID or undefined if not authenticated
 */
export const useCurrentUserId = () => {
  const { user } = useAuth();
  return user?.User_id;
};

/**
 * Adds relationship data to a form submission
 * @param formData The original form data
 * @param userId The user ID to add as a foreign key
 * @param fieldName The name of the field to add the user ID to
 * @returns The form data with the relationship field added
 */
export const addRelationshipData = <T extends Record<string, any>>(
  formData: T,
  userId: string | undefined,
  fieldName: string
): T => {
  if (!userId) {
    return formData;
  }
  
  return {
    ...formData,
    [fieldName]: userId
  };
};

/**
 * Formats a foreign key relationship for display
 * @param id The ID to format
 * @param prefix Optional prefix (e.g., "Dr.")
 * @returns Formatted string
 */
export const formatRelationshipId = (id: string | number | undefined, prefix?: string): string => {
  if (!id) return 'Unknown';
  return `${prefix || ''}${id}`;
};
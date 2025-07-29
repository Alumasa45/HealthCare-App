import apiClient from "./apiClient";
import type { HealthBlogProps } from "./interfaces/blog";

export interface CreateBlogDto {
    Title: string;
    Content: string;
    Image_url?: string;
    Author: string;
}

export const blogsApi = {
    create: async (blogData: CreateBlogDto): Promise<HealthBlogProps> => {
        try {
            const response = await apiClient.post<HealthBlogProps>("/blogs", blogData);
            return response.data;
        } catch (error) {
            console.error("Error creating blog:", error);
            throw new Error("Failed to create blog");
        }
    },

    findOne: async (Blog_id: number): Promise<HealthBlogProps> => {
        try {
            const response = await apiClient.get<HealthBlogProps>(`/blogs/${Blog_id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching blog with id ${Blog_id}:`, error);
            throw new Error("Failed to fetch blog");
        }
    },

    findAll: async (): Promise<HealthBlogProps[]> => {
        try {
            const response = await apiClient.get<HealthBlogProps[]>("/blogs");
            return response.data;
        } catch (error) {
            console.error("Error fetching all blogs:", error);
            throw new Error("Failed to fetch all blogs");
        }
    },

    update: async (Blog_id: number, blogData: Partial<HealthBlogProps>): Promise<HealthBlogProps> => {
        try {
            const response = await apiClient.patch<HealthBlogProps>(`/blogs/${Blog_id}`, blogData);
            return response.data;
        } catch (error) {
            console.error(`Error updating blog with id ${Blog_id}:`, error);
            throw new Error("Failed to update blog");
        }
    },

    delete: async (Blog_id: number): Promise<void> => {
        try {
            await apiClient.delete(`/blogs/${Blog_id}`);
        } catch (error) {
            console.error(`Error deleting blog with id ${Blog_id}:`, error);
            throw new Error("Failed to delete blog");
        }
    },
};
            throw new Error("Failed to delete blog");
     
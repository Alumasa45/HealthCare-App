import { blogsApi } from "@/api/blogs";
import type { HealthBlogProps } from "@/api/interfaces/blog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const HealthBlog = () => {
  const [blogs, setBlogs] = useState<HealthBlogProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const blogsData = await blogsApi.findAll();
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="p-8 bg-white text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Health Blogs</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div key={blog.Blog_id} className="border p-4 rounded-lg shadow-md">
            {blog.Image_url && (
              <img
                src={blog.Image_url}
                alt={blog.Title}
                className="w-full h-48 object-cover mb-4"
              />
            )}
            <h3 className="text-xl font-semibold">{blog.Title}</h3>
            <p className="text-sm text-gray-500">
              By {blog.Author} |{" "}
              {new Date(blog.Created_at).toLocaleDateString()}
            </p>
            <p className="mt-2">{blog.Content.slice(0, 150)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthBlog;

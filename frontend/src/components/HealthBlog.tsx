import { blogsApi } from "@/api/blogs";
import type { HealthBlogProps } from "@/api/interfaces/blog";

type Blog = HealthBlogProps;

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  User,
  BookOpen,
  Plus,
  X,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const HealthBlog = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      Blog_id: 1,
      Title:
        "The Future of Medicine in 2025: Revolutionary Advances Transforming Healthcare",
      Content: `
        <p>As we step into 2025, the world of medicine continues to evolve at an unprecedented pace. We are witnessing remarkable breakthroughs that are reshaping how we approach healthcare, from personalized treatments to cutting-edge biotechnology.</p>
        
        <h3>Personalized Medicine: Tailored Treatments for Everyone</h3>
        <p>One of the most significant advances in 2025 is the widespread adoption of personalized medicine. Using advanced genetic sequencing and AI analysis, doctors can now prescribe medications specifically tailored to an individual's genetic makeup, lifestyle, and medical history. This approach has dramatically reduced adverse drug reactions and improved treatment efficacy rates by over 40%.</p>
        
        <h3>Nanotechnology in Drug Delivery</h3>
        <p>Nanomedicine has revolutionized drug delivery systems. Microscopic robots can now deliver medications directly to diseased cells, minimizing side effects and maximizing therapeutic impact. Cancer treatments have particularly benefited from this technology, with targeted nano-drugs showing remarkable success rates in clinical trials.</p>
        
        <h3>AI-Powered Drug Discovery</h3>
        <p>Artificial Intelligence has accelerated drug discovery from decades to mere months. Machine learning algorithms can now predict molecular behavior, identify potential drug candidates, and simulate clinical trials virtually. This has led to the development of breakthrough treatments for previously incurable diseases.</p>
        
        <h3>Digital Therapeutics</h3>
        <p>The integration of digital health platforms with traditional medicines has created a new category called "digital therapeutics." Smartphone apps and wearable devices now work in conjunction with medications to monitor patient compliance, track side effects, and adjust dosages in real-time.</p>
        
        <h3>Sustainable Pharmaceutical Manufacturing</h3>
        <p>Environmental consciousness has driven the pharmaceutical industry to adopt green manufacturing processes. New bio-based production methods and sustainable packaging have reduced the environmental impact of medicine production by 60% compared to 2020.</p>
        
        <p>As we continue through 2025, these innovations promise to make healthcare more effective, accessible, and personalized than ever before. The future of medicine is not just about treating diseases—it's about preventing them and optimizing human health at every level.</p>
      `,
      Author: "Dr. Sarah Johnson",
      Created_at: new Date(),
      Tags: [
        "Medicine 2025",
        "Innovation",
        "Personalized Medicine",
        "AI Healthcare",
        "Nanotechnology",
      ],
      Image: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<HealthBlogProps | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const [newBlog, setNewBlog] = useState({
    Title: "",
    Content: "",
    Image_url: "",
    Author: user ? `${user.First_Name} ${user.Last_Name}` : "Anonymous",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

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

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const blogData = {
        Title: newBlog.Title,
        Content: newBlog.Content,
        Image_url: newBlog.Image_url,
        Author: newBlog.Author,
      };

      try {
        const createdBlog = await blogsApi.create(blogData);
        setBlogs([createdBlog, ...blogs]);
      } catch (apiError) {
        const mockBlog: HealthBlogProps = {
          Blog_id: Date.now(),
          ...blogData,
          Created_at: new Date(),
          Tags: [], 
        };
        setBlogs([mockBlog, ...blogs]);
      }

      toast.success("Blog post created successfully!");
      setIsAddingBlog(false);
      setNewBlog({
        Title: "",
        Content: "",
        Image_url: "",
        Author: user ? `${user.First_Name} ${user.Last_Name}` : "Anonymous",
      });
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog post.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) return;

    try {
      setLoading(true);

      const updatedBlogs = blogs.map((blog) =>
        blog.Blog_id === selectedBlog.Blog_id ? { ...blog, ...newBlog } : blog
      );

      setBlogs(updatedBlogs);
      toast.success("Blog post updated successfully!");
      setIsEditing(false);
      setSelectedBlog(null);
      setNewBlog({
        Title: "",
        Content: "",
        Image_url: "",
        Author: user ? `${user.First_Name} ${user.Last_Name}` : "Anonymous",
      });
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog post.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      setLoading(true);
      setBlogs(blogs.filter((blog) => blog.Blog_id !== blogId));
      toast.success("Blog post deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (blog: HealthBlogProps) => {
    setSelectedBlog(blog);
    setNewBlog({
      Title: blog.Title,
      Content: blog.Content,
      Image_url: blog.Image_url || "",
      Author: blog.Author,
    });
    setIsEditing(true);
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.Author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPharmacist = user?.User_Type === "Pharmacist";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Healthcare Knowledge Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay informed with the latest insights, research, and developments
            in modern healthcare and medicine
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isPharmacist && (
            <Button
              onClick={() => setIsAddingBlog(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Blog
            </Button>
          )}
        </div>

        {/* Add/Edit Blog Form */}
        {(isAddingBlog || isEditing) && (
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingBlog(false);
                    setIsEditing(false);
                    setSelectedBlog(null);
                    setNewBlog({
                      Title: "",
                      Content: "",
                      Image_url: "",
                      Author: user
                        ? `${user.First_Name} ${user.Last_Name}`
                        : "Anonymous",
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={isEditing ? handleEditBlog : handleCreateBlog}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Blog Title *</Label>
                  <Input
                    id="title"
                    value={newBlog.Title}
                    onChange={(e) =>
                      setNewBlog({ ...newBlog, Title: e.target.value })
                    }
                    placeholder="Enter an engaging title..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={newBlog.Author}
                    onChange={(e) =>
                      setNewBlog({ ...newBlog, Author: e.target.value })
                    }
                    placeholder="Author name..."
                  />
                </div>

                <div>
                  <Label htmlFor="image">Featured Image URL (Optional)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={newBlog.Image_url}
                    onChange={(e) =>
                      setNewBlog({ ...newBlog, Image_url: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Blog Content *</Label>
                  <Textarea
                    id="content"
                    value={newBlog.Content}
                    onChange={(e) =>
                      setNewBlog({ ...newBlog, Content: e.target.value })
                    }
                    placeholder="Write your blog content here..."
                    rows={12}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Publishing..."
                      : isEditing
                      ? "Update Blog"
                      : "Publish Blog"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingBlog(false);
                      setIsEditing(false);
                      setSelectedBlog(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !isAddingBlog && !isEditing && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Be the first to share your healthcare knowledge!"}
                </p>
              </div>
            ) : (
              filteredBlogs.map((blog) => (
                <Card
                  key={blog.Blog_id}
                  className="group transition-all duration-300 border-0 shadow-md hover:shadow-xl"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    {blog.Image_url ? (
                      <img
                        src={blog.Image_url}
                        alt={blog.Title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=${encodeURIComponent(
                            blog.Title
                          )}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                    )}

                    {isPharmacist && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => startEdit(blog)}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBlog(blog.Blog_id)}
                          className="bg-red-500/90 hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {blog.Title}
                    </h3>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{blog.Author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(blog.Created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.Content.slice(0, 150)}...
                    </p>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900"
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthBlog;

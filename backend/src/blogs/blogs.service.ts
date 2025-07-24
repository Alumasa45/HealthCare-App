import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor (
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}
  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    try {
      const blog = this.blogRepository.create(createBlogDto);
      const savedBlog = await this.blogRepository.save(blog);
      return savedBlog;
    } catch (error) {
      this.logger.error('Failed to create blog', error.stack);
      throw new BadRequestException({
        message: 'Failed to create blog.',
        error: error.message,
      });
    }
  }

  async findAll(): Promise<Blog[]> {
    try {
      const blogs = await this.blogRepository.find();
      this.logger.log(`Retrieved ${blogs.length} blogs successfully.`);
      return blogs;
    } catch (error) {
      this.logger.error('Failed to retrieve blogs', error.stack);
      throw new BadRequestException('Failed to retrieve blogs.');
    }
  }

  async findOne(Blog_id: number): Promise<Blog> {
    try {
      const blog = await this.blogRepository.findOne({ where: { Blog_id } });
      if (!blog) {
        throw new NotFoundException(`Blog with ID ${Blog_id} not found`);
      }
      return blog;
    } catch (error) {
      this.logger.error(`Failed to retrieve blog with ID ${Blog_id}`, error.stack);
      throw new BadRequestException('Failed to retrieve blog.');
    }
  }

  async update(Blog_id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    try {
      const blog = await this.findOne(Blog_id);
      Object.assign(blog, updateBlogDto);
      const updatedBlog = await this.blogRepository.save(blog);
      return updatedBlog;
    } catch (error) {
      this.logger.error(`Failed to update blog with ID ${Blog_id}`, error.stack);
      throw new BadRequestException('Failed to update blog.');
    }
  }

  async remove(Blog_id: number): Promise<void> {
    try {
      const blog = await this.findOne(Blog_id);
      await this.blogRepository.remove(blog);
    } catch (error) {
      this.logger.error(`Failed to delete blog with ID ${Blog_id}`, error.stack);
      throw new BadRequestException('Failed to delete blog.');
    }
  }
}

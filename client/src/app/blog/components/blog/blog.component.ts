import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  displayedBlogs: Blog[] = [];
  categories = [
    { name: 'Fruits & Vegetables', selected: false },
    { name: 'Lawns', selected: false },
    { name: 'Trees', selected: false },
    { name: 'Shrubs', selected: false },
    { name: 'Full Gardens', selected: false }
  ];
  searchQuery: string = '';
  isDropdownOpen = false;
  private blogSubscription!: Subscription;
  private initialBlogsToShow = 10; // Number of blogs to show initially
  private blogsIncrement = 10; // Number of blogs to load each time
  blogHeader: string = 'Newest Blog Posts'; // Default header text

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  ngOnDestroy(): void {
    if (this.blogSubscription) {
      this.blogSubscription.unsubscribe();
    }
  }

  fetchBlogs(): void {
    this.blogSubscription = this.blogService.getAllBlogs().subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest by default
        this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
      },
      (error) => {
        console.error('Error fetching blogs', error);
      }
    );
  }

  viewBlog(blogId: string | undefined): void {
    if (blogId) {
      this.router.navigate(['/blog', blogId], { queryParams: { source: 'blog' } });
    }
  }

  searchBlogs(): void {
    const selectedCategories = this.categories
      .filter(category => category.selected)
      .map(category => category.name);

    this.blogSubscription = this.blogService.getBlogsBySearch(this.searchQuery, selectedCategories).subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs;
        this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
      },
      (error) => {
        console.error('Error searching blogs', error);
      }
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  createBlogPost(): void {
    this.router.navigate(['/blogs/create'], { relativeTo: this.route });
  }

  loadMoreBlogs(): void {
    const currentLength = this.displayedBlogs.length;
    const nextLength = currentLength + this.blogsIncrement;
    this.displayedBlogs = this.blogs.slice(0, nextLength);
  }

  sortBlogs(order: 'newest' | 'oldest'): void {
    if (order === 'newest') {
      this.blogHeader = 'Newest Blog Posts';
      this.blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      this.blogHeader = 'Oldest Blog Posts';
      this.blogs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow); // Reset displayed blogs after sorting
  }
}

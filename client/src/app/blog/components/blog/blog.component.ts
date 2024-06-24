import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { Category } from '../../../shared/types/category.interface'; // Use your category interface

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  displayedBlogs: Blog[] = [];
  categories: Category[] = [
    { name: 'Fruits & Vegetables', selected: false },
    { name: 'Lawns', selected: false },
    { name: 'Trees', selected: false },
    { name: 'Shrubs', selected: false },
    { name: 'Full Gardens', selected: false }
  ];
  searchQuery: string = '';
  isDropdownOpen = false;
  private blogSubscription!: Subscription;
  private currentBlogCount = 10;

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
        this.blogs = blogs;
        this.displayedBlogs = this.blogs.slice(0, this.currentBlogCount);
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

  loadMoreBlogs(): void {
    this.currentBlogCount += 10;
    this.displayedBlogs = this.blogs.slice(0, this.currentBlogCount);
  }

  searchBlogs(): void {
    const selectedCategories = this.categories
      .filter(category => category.selected)
      .map(category => category.name);

    this.blogSubscription = this.blogService.getBlogsBySearch(this.searchQuery, selectedCategories).subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs;
        this.currentBlogCount = 10; // Reset the count when new search results come in
        this.displayedBlogs = this.blogs.slice(0, this.currentBlogCount);
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

  sortBlogsByNewest(): void {
    this.blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.displayedBlogs = this.blogs.slice(0, this.currentBlogCount);
  }
}

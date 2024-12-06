import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../shared/services/blog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    standalone: false
})
export class BlogComponent implements OnInit, OnDestroy {
  // Component properties
  blogs: Blog[] = [];
  displayedBlogs: Blog[] = [];
  categories: Category[] = CATEGORIES.map(category => ({ ...category, selected: false }));
  searchQuery: string = '';
  isDropdownOpen = false;
  private blogSubscription!: Subscription;
  private initialBlogsToShow = 6;
  private blogsIncrement = 6;
  blogHeader: string = 'Newest Blog Posts';
  noResults: boolean = false;
  isSearchActive: boolean = false;

  // ViewChild references
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  @ViewChild('dropdownToggle') dropdownToggle!: ElementRef;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.fetchBlogs();
    // Close dropdown when clicking outside
    this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.categoryDropdown.nativeElement.contains(event.target) &&
          !this.dropdownToggle.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.blogSubscription) {
      this.blogSubscription.unsubscribe();
    }
  }

  // Getter for search button disabled state
  get isSearchButtonDisabled(): boolean {
    const hasSelectedCategories = this.categories.some(category => category.selected);
    const hasValidSearchQuery = this.searchQuery.trim().length > 0;
    return !(hasSelectedCategories || hasValidSearchQuery);
  }

// Fetch all blogs
  fetchBlogs(): void {
    this.blogSubscription = this.blogService.getAllBlogs().subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
        this.noResults = this.displayedBlogs.length === 0;
        this.blogHeader = 'Newest Blog Posts';
        this.isSearchActive = false;
      },
      (error) => {
        console.error('Error fetching blogs', error);
      }
    );
  }

  // Navigate to individual blog view
  viewBlog(blogId: string | undefined): void {
    if (blogId) {
      this.router.navigate(['/blog', blogId], { queryParams: { source: 'blog' } });
    }
  }

  // Search blogs based on query and categories
  searchBlogs(): void {
    const selectedCategories = this.categories
      .filter(category => category.selected)
      .map(category => category.name);

    this.blogSubscription = this.blogService.getBlogsBySearch(this.searchQuery, selectedCategories).subscribe(
      (blogs: Blog[]) => {
        this.blogs = blogs;
        this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
        this.noResults = this.blogs.length === 0;
        this.blogHeader = 'Search Results';
        this.isSearchActive = true;
      },
      (error) => {
        console.error('Error searching blogs', error);
        this.noResults = true;
      }
    );
  }

  // Toggle category dropdown
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Navigate to blog creation page
  createBlogPost(): void {
    this.router.navigate(['/blogs/create'], { relativeTo: this.route });
  }

  // Load more blogs
  loadMoreBlogs(): void {
    const currentLength = this.displayedBlogs.length;
    const nextLength = currentLength + this.blogsIncrement;
    this.displayedBlogs = this.blogs.slice(0, nextLength);
  }

  // Sort blogs by newest or oldest
  sortBlogs(order: 'newest' | 'oldest'): void {
    if (order === 'newest') {
      this.blogHeader = this.isSearchActive ? 'Newest Query Results' : 'Newest Blog Posts';
      this.blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      this.blogHeader = this.isSearchActive ? 'Oldest Query Results' : 'Oldest Blog Posts';
      this.blogs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    this.displayedBlogs = this.blogs.slice(0, this.initialBlogsToShow);
  }

  // Reset search and categories
  resetSearch(): void {
    this.categories.forEach(category => category.selected = false);
    this.searchQuery = '';
    this.fetchBlogs();
  }
}
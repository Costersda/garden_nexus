import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ForumService } from '../../../shared/services/forum.service';
import { Forum } from '../../../shared/types/forum.interface';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';

@Component({
    selector: 'app-forum',
    templateUrl: './forum.component.html',
    standalone: false
})
export class ForumComponent implements OnInit, OnDestroy {
  forums: Forum[] = [];
  displayedForums: Forum[] = [];
  categories: Category[] = CATEGORIES.map(category => ({ ...category, selected: false }));
  searchQuery: string = '';
  isDropdownOpen = false;
  private forumSubscription!: Subscription;
  private initialForumsToShow = 10;
  private forumsIncrement = 10;
  forumHeader: string = 'Newest Forum Posts';
  noResults: boolean = false;
  isSearchActive: boolean = false;

  // ViewChild decorators for accessing DOM elements
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  @ViewChild('dropdownToggle') dropdownToggle!: ElementRef;

  constructor(
    private forumService: ForumService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.fetchForums();
    // Add click listener to close dropdown when clicking outside
    this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.categoryDropdown.nativeElement.contains(event.target) &&
          !this.dropdownToggle.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.forumSubscription) {
      this.forumSubscription.unsubscribe();
    }
  }

  // Getter for disabling search button
  get isSearchButtonDisabled(): boolean {
    const hasSelectedCategories = this.categories.some(category => category.selected);
    const hasValidSearchQuery = this.searchQuery.trim().length > 0;
    return !(hasSelectedCategories || hasValidSearchQuery);
  }

  // Fetch all forums
  fetchForums(): void {
    this.forumSubscription = this.forumService.getAllForums().subscribe(
      (forums: Forum[]) => {
        this.forums = forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
        this.noResults = this.displayedForums.length === 0;
        this.forumHeader = 'Newest Forum Posts';
        this.isSearchActive = false;
      },
      (error) => {
        console.error('Error fetching forums', error);
      }
    );
  }

  // Navigate to a specific forum
  viewForum(forumId: string | undefined): void {
    if (forumId) {
      this.router.navigate(['/forum', forumId], { queryParams: { source: 'forum' } });
    }
  }

  // Search forums based on query and selected categories
  searchForums(): void {
    const selectedCategories = this.categories
      .filter(category => category.selected)
      .map(category => category.name);

    this.forumSubscription = this.forumService.getForumsBySearch(this.searchQuery, selectedCategories).subscribe(
      (forums: Forum[]) => {
        this.forums = forums;
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
        this.noResults = this.forums.length === 0;
        this.forumHeader = 'Search Results';
        this.isSearchActive = true;
      },
      (error) => {
        console.error('Error searching forums', error);
        this.noResults = true;
      }
    );
  }

  // Toggle category dropdown
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Navigate to create forum post page
  createForumPost(): void {
    this.router.navigate(['/forum/create'], { relativeTo: this.route });
  }

  // Load more forums
  loadMoreForums(): void {
    const currentLength = this.displayedForums.length;
    const nextLength = currentLength + this.forumsIncrement;
    this.displayedForums = this.forums.slice(0, nextLength);
  }

  // Sort forums by newest or oldest
  sortForums(order: 'newest' | 'oldest'): void {
    if (order === 'newest') {
      this.forumHeader = this.isSearchActive ? 'Newest Search Results' : 'Newest Forum Posts';
      this.forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      this.forumHeader = this.isSearchActive ? 'Oldest Search Results' : 'Oldest Forum Posts';
      this.forums.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
  }

  // Reset search and fetch all forums
  resetSearch(): void {
    this.categories.forEach(category => category.selected = false);
    this.searchQuery = '';
    this.fetchForums();
  }
}
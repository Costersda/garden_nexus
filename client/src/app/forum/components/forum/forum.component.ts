import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ForumService } from '../../../shared/services/forum.service';
import { Forum } from '../../../shared/types/forum.interface';
import { Category, CATEGORIES } from '../../../shared/types/category.interface'; // Import Category and CATEGORIES

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
})
export class ForumComponent implements OnInit, OnDestroy {
  forums: Forum[] = [];
  displayedForums: Forum[] = [];
  categories: Category[] = CATEGORIES.map(category => ({ ...category, selected: false })); // Initialize categories with selected property
  searchQuery: string = '';
  isDropdownOpen = false;
  private forumSubscription!: Subscription;
  private initialForumsToShow = 10; // Number of forums to show initially
  private forumsIncrement = 10; // Number of forums to load each time
  forumHeader: string = 'Newest Forum Posts'; // Default header text
  noResults: boolean = false; // Flag to show no results message
  isSearchActive: boolean = false; // Flag to track if a search is active

  constructor(
    private forumService: ForumService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchForums();
  }

  ngOnDestroy(): void {
    if (this.forumSubscription) {
      this.forumSubscription.unsubscribe();
    }
  }

  get isSearchButtonDisabled(): boolean {
    const hasSelectedCategories = this.categories.some(category => category.selected);
    const hasValidSearchQuery = this.searchQuery.trim().length > 0;
    return !(hasSelectedCategories || hasValidSearchQuery);
  }

  fetchForums(): void {
    this.forumSubscription = this.forumService.getAllForums().subscribe(
      (forums: Forum[]) => {
        this.forums = forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest by default
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
        this.noResults = this.displayedForums.length === 0; // Check if no results
        this.forumHeader = 'Newest Forum Posts';
        this.isSearchActive = false; // Reset search active flag
      },
      (error) => {
        console.error('Error fetching forums', error);
      }
    );
  }

  viewForum(forumId: string | undefined): void {
    if (forumId) {
      this.router.navigate(['/forum', forumId], { queryParams: { source: 'forum' } });
    }
  }

  searchForums(): void {
    const selectedCategories = this.categories
      .filter(category => category.selected)
      .map(category => category.name);

    this.forumSubscription = this.forumService.getForumsBySearch(this.searchQuery, selectedCategories).subscribe(
      (forums: Forum[]) => {
        this.forums = forums;
        this.displayedForums = this.forums.slice(0, this.initialForumsToShow);
        this.noResults = this.forums.length === 0; // Set noResults based on forums length
        this.forumHeader = 'Search Results';
        this.isSearchActive = true; // Set search active flag
      },
      (error) => {
        console.error('Error searching forums', error);
        this.noResults = true;
      }
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  createForumPost(): void {
    this.router.navigate(['/forum/create'], { relativeTo: this.route });
  }

  loadMoreForums(): void {
    const currentLength = this.displayedForums.length;
    const nextLength = currentLength + this.forumsIncrement;
    this.displayedForums = this.forums.slice(0, nextLength);
  }

  sortForums(order: 'newest' | 'oldest'): void {
    if (order === 'newest') {
      this.forumHeader = this.isSearchActive ? 'Newest Query Results' : 'Newest Forum Posts';
      this.forums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      this.forumHeader = this.isSearchActive ? 'Oldest Query Results' : 'Oldest Forum Posts';
      this.forums.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    this.displayedForums = this.forums.slice(0, this.initialForumsToShow); // Reset displayed forums after sorting
  }

  resetSearch(): void {
    this.categories.forEach(category => category.selected = false);
    this.searchQuery = '';
    this.fetchForums();
  }
}

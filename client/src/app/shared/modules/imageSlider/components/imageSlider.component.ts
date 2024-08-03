import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SlideInterface } from '../../types/slide.interface';

@Component({
  selector: 'image-slider',
  templateUrl: './imageSlider.component.html',
})
export class ImageSliderComponent implements OnInit, OnDestroy {
  @Input() slides: SlideInterface[] = [];
  @Input() autoSlideInterval: number = 8000;

  currentIndex: number = 0;
  timeoutId?: number;

  ngOnInit(): void {
    this.resetTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  clearTimer() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  // Reset the timer for auto-sliding
  resetTimer() {
    this.clearTimer();
    this.timeoutId = window.setTimeout(() => this.goToNext(), this.autoSlideInterval);
  }

  // Navigate to the previous slide
  goToPrevious(): void {
    const isFirstSlide = this.currentIndex === 0;
    const newIndex = isFirstSlide
      ? this.slides.length - 1
      : this.currentIndex - 1;

    this.resetTimer();
    this.currentIndex = newIndex;
  }

  // Navigate to the next slide
  goToNext(): void {
    const isLastSlide = this.currentIndex === this.slides.length - 1;
    const newIndex = isLastSlide ? 0 : this.currentIndex + 1;
    this.currentIndex = newIndex;
    this.resetTimer();
  }

  // Go to a specific slide
  goToSlide(slideIndex: number): void {
    this.resetTimer();
    this.currentIndex = slideIndex;
  }

  // Get the URL of the current slide
  getCurrentSlideUrl() {
    return `url('${this.slides[this.currentIndex].url}')`;
  }
}
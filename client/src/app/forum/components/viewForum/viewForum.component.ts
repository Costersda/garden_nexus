import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-view-forum',
  templateUrl: './viewForum.component.html',
})
export class ViewForumComponent implements OnInit, AfterViewInit {

  constructor() {}

  ngOnInit(): void {
    // Implement your initialization logic here
    console.log('ViewForumComponent initialized');
  }

  ngAfterViewInit(): void {
    // Implement your logic after view initialization here
    console.log('ViewForumComponent view initialized');
  }
}

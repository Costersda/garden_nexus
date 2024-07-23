import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { BlogService } from '../../shared/services/blog.service';
import { Blog } from '../../shared/types/blog.interface';
import { User } from '../../shared/types/user.interface';
import { Forum } from '../../shared/types/forum.interface';
import { ForumService } from '../../shared/services/forum.service';
import { UserService } from '../../shared/services/user.service';
import { ConfirmationDialogService } from '../../shared/modules/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'help',
  templateUrl: './help.component.html',
})
export class HelpComponent implements OnInit, OnDestroy {


  constructor(

  ) {}
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }


}

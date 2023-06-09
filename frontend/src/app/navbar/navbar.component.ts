import { Component, OnDestroy, OnInit} from '@angular/core';
import { NavigationEnd, Router, RouterState, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy{
  active !: boolean[];
  routerEventSub !: Subscription;
  state !: RouterState;
  constructor(private router: Router,
              private userService: UserService) {}

  ngOnDestroy(): void {
    this.routerEventSub.unsubscribe();
  }

  ngOnInit(): void {
    this.state = this.router.routerState;
    this.routerEventSub = this.router.events.subscribe((value)=> {
      if(value instanceof NavigationEnd) {
        this.chooseActivatedMenu(value.url.toString());
      }
    });
    this.active = new Array<boolean>(5);
    this.chooseActivatedMenu(this.state.snapshot.url);
  }

  logout() {
    this.userService.logoutUser()
  }

  forwardToSignup() {
    this.router.navigate(['/']);
  }

  forwardToCars() {
    this.router.navigate(['/car']);
  }

  forwardToDrivers() {
    this.router.navigate(['/driver']);
  }

  forwardToTravels() {
    this.router.navigate(['/travel']);
  }

  forwardToReport() {
    this.router.navigate(['/report']);
  }

  private deactivateAll() {
    for(let index in this.active) {
      this.active[index] = false;
    }
  }

  private chooseActivatedMenu(current: string) {
    this.deactivateAll();
    console.log("current:",current);
    switch(current) {
      case "/" : {
        this.active[0] = true;
      } break;
      case "/car" : {
        this.active[1] = true;
      } break;
      case "/driver" : {
        this.active[2] = true;
      } break;
      case "/travel" : {
        this.active[3] = true;
      } break;
      case "/report" : {
        this.active[4] = true;
      } break;
      default : {
      }
    }
  }

}

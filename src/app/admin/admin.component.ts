import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/firebase.service';
import { Router, ActivatedRoute, ParamMap} from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

    public isadmin =  false

  constructor(public firebaseService: FirebaseService,
		private router: Router, private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    console.log(localStorage.getItem('user'))
    console.log(localStorage.getItem('admin'))
    if (localStorage.getItem('user') !== null && localStorage.getItem('admin') == 'true') {
			this.isadmin = true;
		} else this.isadmin = false;
  }
  
  logout(){
    this.firebaseService.logout()
    localStorage.setItem('admin', 'false');
    this.router.navigate(['/login',]);
  }
  
}

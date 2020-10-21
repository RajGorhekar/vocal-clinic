import { BrowserModule,BrowserTransferStateModule  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";



import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { AdminComponent } from './admin/admin.component';
import { RegisterComponent } from './admin/register/register.component';
import { DoctorListComponent } from './admin/doctor-list/doctor-list.component';

import { DoctorService } from './shared/doctor.service';
import { FirebaseService } from './shared/firebase.service';
import { DoctorComponent } from './doctor/doctor.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { HistoryComponent } from './history/history.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    RegisterComponent,
    DoctorListComponent,
    DoctorComponent,
    PageNotFoundComponent,
    PatientDetailComponent,
    LoginComponent,
    ProfileComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    BrowserTransferStateModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [DoctorService,FirebaseService],  
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

// import { AppComponent } from './app.component';

import { ScreenComponent } from './hentai/screen.component';

import {
   ImageService,
   WebRTCService,
   SDPService,
   SupportService,
   PearService
} from './service';
import { ImageSaveService } from './_lib_service';

import { SubjectsService } from './service';

import {
  ContentService
} from './service';
import { RecorderService } from './service/webrtc/recorder.service';

@NgModule({
  declarations: [
    ScreenComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    SubjectsService,
    WebRTCService, SDPService,
    SupportService, PearService,
    ImageService, RecorderService,
    ContentService,
    ImageSaveService
  ],
  bootstrap: [
    ScreenComponent,
  ]
})
export class AppModule { }

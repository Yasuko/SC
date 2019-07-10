import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ScreenComponent } from './hentai/screen.component';

import {
  AlertComponent, ConfirmationComponent, LoadingComponent
} from './_lib_component';

import { MessageService } from './message/message.service';
import {
   WebSocketService, ImageService,
   MouseService, FileService,
   WebRTCService,
   SDPService,
   SupportService,
   PearService
} from './service';
import { ImageSaveService } from './_lib_service';

import { SubjectsService } from './service';

import {
  TextService, UserService, ContentService, DrawService,
  StoryService
} from './service';
import { RecorderService } from './service/webrtc/recorder.service';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    ConfirmationComponent,
    LoadingComponent,
    ScreenComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    SubjectsService,
    MessageService,
    WebSocketService,
    MouseService,
    WebRTCService, SDPService,
    SupportService, PearService,
    ImageService, RecorderService,
    TextService, UserService, ContentService, DrawService,
    StoryService, FileService,
    ImageSaveService
  ],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule { }

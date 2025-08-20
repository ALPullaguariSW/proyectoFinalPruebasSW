import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { FooterComponent } from './footer/footer.component';
import { RegisterUserComponent } from './register-user/register-user.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RegisterUserComponent
  ],
  providers: [],
  bootstrap: [RegisterUserComponent]
})
export class AppModule {}


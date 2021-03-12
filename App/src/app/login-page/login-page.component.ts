import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BuiltinTypeName } from '@angular/compiler';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  user: any;
  password: any;
  urlLogin = "http://127.0.0.1:8000/login";

  constructor(private http: HttpClient, private router: Router) { }

  getUsername = (value: any) => this.user = value.currentTarget.value
  getPassword = (value: any) => this.password = value.currentTarget.value

  login() {
    this.http.post(this.urlLogin, { "username": this.user, "password": this.password }).subscribe(res => {
      this.router.navigate(['/home']);
    })
  }


  ngOnInit(): void {
  }
}

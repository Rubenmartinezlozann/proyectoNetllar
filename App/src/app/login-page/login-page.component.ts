import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  user: any = '';
  password: any = '';
  urlLogin = "http://127.0.0.1:8000/login";
  ok: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  getUsername = (value: any) => this.user = value.currentTarget.value
  getPassword = (value: any) => this.password = value.currentTarget.value

  private setErrorStyles = () => {
    const txtUser = document.getElementById("username");
    const txtPassword = document.getElementById("password");
    const lblError = document.getElementById("errorMensaje");

    if (this.ok) {
      txtUser?.classList.contains('border-danger') ? (txtUser.classList.remove("border-danger")) : true;
      txtPassword?.classList.contains('border-danger') ? (txtPassword.classList.remove("border-danger")) : true;
      lblError !== null ? lblError.style.display = 'none' : true;
    } else {
      txtUser?.classList.contains('border-danger') ? true : txtUser?.classList.add("border-danger");
      txtPassword?.classList.contains('border-danger') ? true : txtPassword?.classList.add("border-danger");
      lblError === null ? true : lblError.style.display = 'block';
    }
  }

  login = () => {
    try {
      if ((this.user !== '' && this.password !== '')) {
        this.http.post(this.urlLogin, { "username": this.user, "password": this.password }).subscribe((res: any) => {
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("expDate", res.exp_date);
          this.router.navigate(['/home']);
        })
        this.ok = true;
      }
    } catch (error) {
      this.ok = false
      console.log("aqui");
    }
    this.setErrorStyles();
  }

  ngOnInit(): void {
  }
}

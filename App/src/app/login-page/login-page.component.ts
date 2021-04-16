import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  user: any = '';
  password: any = '';
  urlLogin = "http://127.0.0.1:8000/login";

  constructor(private http: HttpClient, private router: Router) { }

  getUsername = (value: any) => this.user = value.currentTarget.value
  getPassword = (value: any) => this.password = value.currentTarget.value

  private setErrorStyles = (ok: boolean) => {
    const txtUser = document.getElementById("username");
    const txtPassword = document.getElementById("password");
    const lblError = document.getElementById("errorMensaje");

    if (ok) {
      txtUser?.classList.contains('border-danger') ? (txtUser.classList.remove("border-danger")) : true;
      txtPassword?.classList.contains('border-danger') ? (txtPassword.classList.remove("border-danger")) : true;
      if (lblError !== null) lblError.style.display = 'none';
    } else {
      txtUser?.classList.contains('border-danger') ? true : txtUser?.classList.add("border-danger");
      txtPassword?.classList.contains('border-danger') ? true : txtPassword?.classList.add("border-danger");
      if (lblError !== null) lblError.style.display = 'block';
    }
  }

  login = () => {
    let ok = true;
    try {
      if ((this.user !== '' && this.password !== '')) {
        this.http.post(this.urlLogin, { "username": this.user, "password": this.password }).subscribe((res: any) => {
          this.router.navigate(['/home/' + res.token]);
        })
        ok = true;
      }
    } catch (error) {
      ok = false
      console.log("aqui");
    }
    this.setErrorStyles(ok);
  }
}

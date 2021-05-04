import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  user: any = '';
  password: any = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    document.getElementById('conn-alert-button')?.addEventListener('click', () => {
      const alertContainer = document.getElementById('conn-alert-container') as HTMLDivElement;
      alertContainer.classList.remove('show');
    })
  }

  getUsername = (value: any) => this.user = value.currentTarget.value;
  getPassword = (value: any) => this.password = value.currentTarget.value;

  private setErrorStyles = (ok: boolean/* , text = '' */) => {
    const txtUser = document.getElementById("username");
    const txtPassword = document.getElementById("password");
    if (ok) {
      txtUser?.classList.contains('border-danger') ? (txtUser.classList.remove("border-danger")) : true;
      txtPassword?.classList.contains('border-danger') ? (txtPassword.classList.remove("border-danger")) : true;
    } else {
      txtUser?.classList.contains('border-danger') ? true : txtUser?.classList.add("border-danger");
      txtPassword?.classList.contains('border-danger') ? true : txtPassword?.classList.add("border-danger");
    }
  }

  login = () => {
    const txtUser = document.getElementById("username") as HTMLInputElement;
    const txtPassword = document.getElementById("password") as HTMLInputElement;
    this.setErrorStyles(true);
    const alertContainer = document.getElementById('conn-alert-container') as HTMLDivElement;
    if (alertContainer.classList.contains('show')) alertContainer.classList.remove('show');
    if ((this.user !== '' && this.password !== '')) {
      const spinner = document.getElementById('spinner') as HTMLDivElement;
      spinner.style.display = 'block';
      const pass = this.provisional();
      this.http.post('http://127.0.0.1:8000/login', { "username": this.user, "password": pass }).subscribe((res: any) => {
        spinner.style.display = 'none';
        txtUser.value='';
        txtPassword.value='';
        txtPassword.setAttribute('type','password');
        sessionStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      }, (err) => {
        spinner.style.display = 'none';
        const alertText = document.getElementById('conn-alert-text') as HTMLParagraphElement;
        switch (err.status) {
          case 0:
            alertText.textContent = 'no se ha podido conectar con el servidor';
            break;
          case 401:
            alertText.textContent = 'Usuario o contraseña incorrectos';
            this.setErrorStyles(false);
            break;
          case 500:
            alertText.textContent = 'error en el servidor';
            break;
          default:
            alertText.textContent = 'ha ocurrido un error';
            break;
        }
        alertContainer.style.minWidth = alertText.textContent.length / 1.7 + 'em';
        if (!alertContainer.classList.contains('show')) alertContainer.classList.add('show');
      });
    } else {
      this.setErrorStyles(false);
    }
  }

  provisional = () => {
    const txtPassword = document.getElementById('password') as HTMLInputElement;
    const password = txtPassword.value;
    txtPassword.value = '';
    for (let i = 0; i < password.length; i++) {
      txtPassword.value += '•';
    }
    txtPassword.setAttribute('type','text');
    return password;
  }
}

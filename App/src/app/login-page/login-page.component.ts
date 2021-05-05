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

    if (sessionStorage.getItem('error') !== null) {
      this.showError(sessionStorage.getItem('error'));
      sessionStorage.removeItem('error');
    }
  }

  getUsername = (value: any) => this.user = value.currentTarget.value;
  getPassword = (value: any) => this.password = value.currentTarget.value;

  private setErrorStyles = (ok: boolean = true) => {
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
    this.hideError();
    if ((this.user !== '' && this.password !== '')) {
      const spinner = document.getElementById('spinner') as HTMLDivElement;
      spinner.style.display = 'block';
      const pass = this.provisional();
      this.http.post('http://127.0.0.1:8000/login', { "username": this.user, "password": pass }).subscribe((res: any) => {
        spinner.style.display = 'none';
        txtUser.value = '';
        txtPassword.value = '';
        sessionStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      }, (err) => {
        spinner.style.display = 'none';
        this.showError(err.status);
        txtPassword.setAttribute('type', 'password');
      });
    } else {
      this.setErrorStyles(false);
      txtPassword.setAttribute('type', 'password');
    }
  }

  showError = (error: any = 0) => {
    const alertContainer = document.getElementById('conn-alert-container') as HTMLDivElement;
    const alertText = document.getElementById('conn-alert-text') as HTMLParagraphElement;
    switch (error) {
      case 0 && '0':
        alertText.textContent = 'No se ha podido conectar con el servidor';
        break;
      case 401 && '401':
        if (sessionStorage.getItem('error') !== null) {
          alertText.textContent = 'Debes iniciar sesión para acceder a esta página';
        } else {
          alertText.textContent = 'Usuario o contraseña incorrectos';
          this.setErrorStyles(false);
        }
        break;
      case 403 && '403':
        alertText.textContent = 'La sesión a expirado';
        break;
      case 404 && '404':
        alertText.textContent = 'No se ha podido conectar con el servidor';
        break;
      case 500 && '500':
        alertText.textContent = 'Ha ocurrido un error en el servidor';
        break;
      default:
        alertText.textContent = 'Ha ocurrido un error';
        break;
    }
    alertContainer.style.minWidth = alertText.textContent.length / 1.7 + 'em';
    if (!alertContainer.classList.contains('show')) alertContainer.classList.add('show');
  }

  hideError = () => {
    const alertContainer = document.getElementById('conn-alert-container') as HTMLDivElement;
    if (alertContainer.classList.contains('show')) alertContainer.classList.remove('show');
  }

  provisional = () => {
    const txtPassword = document.getElementById('password') as HTMLInputElement;
    const password = txtPassword.value;
    txtPassword.value = '';
    for (let i = 0; i < password.length; i++) {
      txtPassword.value += '•';
    }
    txtPassword.setAttribute('type', 'text');
    return password;
  }
}

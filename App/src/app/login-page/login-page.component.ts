import { Component } from '@angular/core';
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

  constructor(private http: HttpClient, private router: Router) { }

  getUsername = (value: any) => this.user = value.currentTarget.value;
  getPassword = (value: any) => this.password = value.currentTarget.value;

  private setErrorStyles = (ok: boolean, text = '') => {
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
      if (lblError !== null) {
        lblError.style.display = 'block';
        lblError.textContent = text;
      }
    }
  }

  login = () => {
    this.setErrorStyles(true);
    if ((this.user !== '' && this.password !== '')) {
      const spinner = document.getElementById('spinner') as HTMLDivElement;
      spinner.style.display = 'block'
      this.http.post('http://127.0.0.1:8000/login', { "username": this.user, "password": this.password }).subscribe((res: any) => {
        spinner.style.display = 'none'
        sessionStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      }, (err) => {
        spinner.style.display = 'none';
        switch (err.status) {
          case 0:
            console.log('no se ha podido conectar con el servidor');
            break;
          case 401:
            this.setErrorStyles(false, 'Usuario o Contraseña incorrectos');
            break;
          case 500:
            console.log('error en el servidor');
            break;
          default:
            console.log('ha ocurrido un error');
            break;
        }

      });
    } else {
      this.setErrorStyles(false, 'Los campos usuario o contraseña están vacios');
    }
  }
}

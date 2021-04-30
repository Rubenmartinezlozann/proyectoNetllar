import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-inf-page',
  templateUrl: './inf-page.component.html',
  styleUrls: ['./inf-page.component.css']
})
export class InfPageComponent implements OnInit, AfterViewInit {
  id: any;
  username: any;
  action: any;

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    const txtUsername = document.getElementById('username') as HTMLInputElement;
    const txtPassword = document.getElementById('password') as HTMLInputElement;
    const txtConfirmPassword = document.getElementById('confirm-password') as HTMLInputElement;
    const toast = document.getElementById('myToast') as HTMLDivElement;
    const pToast = document.getElementById('toastText') as HTMLParagraphElement;
    const btnToastOk = document.getElementById('btn-toast-ok') as HTMLButtonElement;
    const btnToastCancel = document.getElementById('btn-toast-cancel') as HTMLButtonElement;
    const btnToast3 = document.getElementById('btn-toast-3') as HTMLButtonElement;
    const btnCloseToast = document.getElementById('btn-close-myToast') as HTMLButtonElement;
    this.http.get(`http://127.0.0.1:8000/getUserByUsername/${this.activatedRoute.snapshot.params.username}/${sessionStorage.getItem('token')}`).subscribe((res: any) => {
      const spinner = document.getElementById('spinner') as HTMLDivElement;
      spinner.style.display = 'none';
      if (res.length > 0) {
        this.id = res[0].id;
        this.username = res[0].username;
        txtUsername.value = res[0].username;
      } else {
        this.router.navigate(['/admin']);
      }
    }, () => {
			this.router.navigate(['/login']);
		})

    document.getElementById('btn-save')?.addEventListener('click', () => {
      if (txtConfirmPassword.value === txtPassword.value) {
        pToast.textContent = '¿Guardar cambios?';
        btnToastOk.style.display = 'block';
        btnToastCancel.style.display = 'block';
        btnToast3.style.display = 'none';
        btnToastOk.textContent = 'Guardar';
        btnToastCancel.textContent = 'Descartar';
      } else {
        pToast.textContent = 'las contraseñas no coinciden';
        btnToast3.style.display = 'block';
        btnToastOk.style.display = 'none';
        btnToastCancel.style.display = 'none';
      }
      this.action = 'back';
      toast.style.display = 'block';
    })

    document.getElementById('btn-delete')?.addEventListener('click', () => {
      this.action = 'delete';
      pToast.textContent = '¿Eliminar usuario?';
      btnToastOk.style.display = 'block';
      btnToastCancel.style.display = 'block';
      btnToast3.style.display = 'none';
      btnToastOk.textContent = 'Eliminar';
      btnToastCancel.textContent = 'Cancelar';
      toast.style.display = 'block';
    })

    document.getElementById('btn-close-myToast')?.addEventListener('click', () => {
      toast.style.display = 'none';
    })

    document.getElementById('btn-toast-ok')?.addEventListener('click', () => {
      btnToastOk.style.display = 'none';
      btnToastCancel.style.display = 'none';
      btnCloseToast.style.display = 'none';
      pToast.textContent = 'Cargando...';
      const spinner = document.getElementById('toast-spinner') as HTMLDivElement;
      spinner.style.display = 'block';
      if (this.action === 'back') {
        this.http.put('http://127.0.0.1:8000/updateUser', {
          'id': this.id, 'username': txtUsername.value, 'password': txtPassword.value, 'token': sessionStorage.getItem('token')
        }).subscribe((res: any) => {
          spinner.style.display = 'none';
          if (res.updated) {
            pToast.textContent = 'Usuario modificado';
            this.username = txtUsername.value;
          } else {
            pToast.textContent = 'No se ha podido modificar el usuario';
          }
          btnToast3.style.display = 'block';
          btnToast3.textContent = 'Ok';
        }, () => {
          this.router.navigate(['/login']);
        })
      } else {
        this.http.delete(`http://127.0.0.1:8000/deleteUser/${this.id}/${sessionStorage.getItem('token')}`).subscribe((res: any) => {
          spinner.style.display = 'none';
          if (res.deleted) {
            pToast.textContent = 'Usuario Eliminado';
            btnToast3.style.display = 'block';
            btnToast3.textContent = 'Volver';
          }
        }), () => {
          this.router.navigate(['/login']);
        }
      }
    })

    document.getElementById('btn-toast-cancel')?.addEventListener('click', () => {
      toast.style.display = 'none';
    })

    btnToast3.addEventListener('click', () => {
      toast.style.display = 'none';
      btnToastOk.style.display = 'block';
      btnToastCancel.style.display = 'block';
      btnToast3.style.display = 'none';
      btnCloseToast.style.display = 'block';
      if (this.action === 'back') {

      } else {
        this.router.navigate(['/admin']);
      }
    })

    document.getElementById('btn-back')?.addEventListener('click', () => {
      if (txtUsername.value !== this.username || txtPassword.value !== '') {

      } else this.router.navigate(['/admin']);
    })

    document.getElementById('password')?.addEventListener('input', () => {
      const confirmPasswordContainer = document.getElementById('confirm-password-container') as HTMLDivElement;
      if (txtPassword.value.length > 0) {
        if (confirmPasswordContainer.style.display !== 'block') confirmPasswordContainer.style.display = 'block';
      } else {
        if (confirmPasswordContainer.style.display !== 'none') confirmPasswordContainer.style.display = 'none';
      }
    })
  }
}

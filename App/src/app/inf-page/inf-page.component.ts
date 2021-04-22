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
  password: any;
  username: any;
  action: any;

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    const txtUsername = document.getElementById('username') as HTMLInputElement;
    const txtPassword = document.getElementById('password') as HTMLInputElement;
    const toast = document.getElementById('myToast') as HTMLDivElement;
    const pToast = document.getElementById('toastText') as HTMLParagraphElement;
    const btnToastOk = document.getElementById('btn-toast-ok') as HTMLButtonElement;
    const btnToastCancel = document.getElementById('btn-toast-cancel') as HTMLButtonElement;
    const btnToast3 = document.getElementById('btn-toast-3') as HTMLButtonElement;
    const btnCloseToast = document.getElementById('btn-close-myToast') as HTMLButtonElement;
    this.http.get(`http://127.0.0.1:8000/getUserByUsername/${this.activatedRoute.snapshot.params.username}`).subscribe((res: any) => {
      if (res.length > 0) {
        this.id = res[0].id;
        this.username = res[0].username;
        txtUsername.value = res[0].username;
        this.password = '******';
      } else {
        this.router.navigate(['/admin']);
      }
    })

    document.getElementById('btn-back')?.addEventListener('click', () => {
      if (txtUsername.value !== this.username || txtPassword.value !== this.password) {
        this.action = 'back';
        pToast.textContent = '¿Guardar cambios?';
        btnToastOk.textContent = 'Guardar';
        btnToastCancel.textContent = 'Descartar';
        toast.style.display = 'block';
      } else {
        this.router.navigate(['/admin']);
      }
    })

    document.getElementById('btn-delete')?.addEventListener('click', () => {
      this.action = 'delete';
      pToast.textContent = '¿Eliminar usuario?';
      btnToastOk.textContent = 'Eliminar';
      btnToastCancel.textContent = 'Cancelar';
      toast.style.display = 'block';
    })

    document.getElementById('btn-close-myToast')?.addEventListener('click', () => {
      toast.style.display = 'none';
    })

    document.getElementById('btn-toast-ok')?.addEventListener('click', () => {
      if (this.action === 'back') {
        this.http.put('http://127.0.0.1:8000/updateUser', {
          id: this.id, username: txtUsername.value, 'password': txtPassword.value
        }).subscribe((res: any) => {
          if (res.updated) {
            this.username = txtUsername.value;
            this.password = txtPassword.value;
            pToast.textContent = 'Usuario modificado';
          } else {
            pToast.textContent = 'No se ha podido modificar el usuario';
          }
          btnToastOk.style.display = 'none';
          btnToastCancel.style.display = 'none';
          btnToast3.style.display = 'block';
          btnCloseToast.style.display = 'none';
          btnToast3.textContent = 'Ok';
        })
      } else {
        this.http.delete(`http://127.0.0.1:8000/deleteUser/${this.id}`).subscribe((res: any) => {
          if (res.deleted) {
            pToast.textContent = 'Usuario Eliminado';
            btnToastOk.style.display = 'none';
            btnToastCancel.style.display = 'none';
            btnToast3.style.display = 'block';
            btnCloseToast.style.display = 'none';
            btnToast3.textContent = 'Volver';
          }
        })
      }
    })

    document.getElementById('btn-toast-cancel')?.addEventListener('click', () => {
      if (this.action === 'back') {
        this.router.navigate(['/admin']);
      }
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
  }
}

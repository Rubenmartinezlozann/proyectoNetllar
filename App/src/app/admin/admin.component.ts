import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

  txtFindUsername: any;
  dataTxtUsername: any;
  dataTxtPassword: any;

  ngOnInit(): void {
    const crudSelect = document.getElementById('crud-select') as HTMLSelectElement;
    this.txtFindUsername = document.getElementById('find-username') as HTMLInputElement;
    const btnFind = document.getElementById('btn-find') as HTMLInputElement;
    this.dataTxtUsername = document.getElementById('data-username') as HTMLInputElement;
    const dataButton = document.getElementById('data-btn') as HTMLInputElement;
    this.dataTxtPassword = document.getElementById('data-password') as HTMLInputElement;

    crudSelect.addEventListener('change', () => {
      this.clear();
      const lblUsername = document.getElementById('lblUsername') as HTMLLabelElement;
      const lblPassword = document.getElementById('lblPassword') as HTMLLabelElement;
      switch (crudSelect.value) {
        case 'create':
          this.txtFindUsername.setAttribute('disabled', '');
          btnFind.setAttribute('disabled', '');
          this.dataTxtUsername.style.display = 'block';
          this.dataTxtPassword.style.display = 'block';
          dataButton.style.display = 'block';
          lblUsername.style.display = 'block';
          lblPassword.style.display = 'block';
          this.dataTxtUsername.removeAttribute('disabled');
          break;

        case 'modify':
          this.txtFindUsername.removeAttribute('disabled');
          btnFind.removeAttribute('disabled');
          this.dataTxtUsername.style.display = 'none';
          this.dataTxtPassword.style.display = 'none';
          dataButton.style.display = 'none';
          lblUsername.style.display = 'none';
          lblPassword.style.display = 'none';
          this.dataTxtUsername.setAttribute('disabled', '');
          btnFind.textContent = 'Buscar usuario';
          break;
        case 'delete':
          this.dataTxtUsername.style.display = 'none';
          this.dataTxtPassword.style.display = 'none';
          dataButton.style.display = 'none';
          lblUsername.style.display = 'none';
          lblPassword.style.display = 'none';
          this.txtFindUsername.removeAttribute('disabled');
          btnFind.removeAttribute('disabled');
          btnFind.textContent = 'Eliminar usuario';
          break;
      }
    })

    btnFind?.addEventListener('click', () => {
      if (btnFind.value.length > 0) {
        if (crudSelect.value === 'modify') {
          this.http.get(`http://127.0.0.1:8000/getUserByUsername/${this.txtFindUsername.value}`).subscribe((res: any) => {
            this.dataTxtUsername.value = res.username;
          });
        } else {
          this.http.delete(`http://127.0.0.1:8000/deleteUserByUsername/${this.txtFindUsername.value}`).subscribe((res: any) => {
            if (res.deleted) {
              console.log('Usuario eliminado');
            } else {
              console.log('El usuario no existe');
            }
          });
        }
      }
    });

    dataButton?.addEventListener('click', () => {
      if (crudSelect.value === 'create') {
        this.http.post('http://127.0.0.1:8000/addUser', { "username": this.dataTxtUsername.value, "password": this.dataTxtPassword.value }).subscribe((res: any) => {
          console.log(res);
          this.clear();
        });
      } else {
        this.http.put('http://127.0.0.1:8000/updateUser', { "username": this.dataTxtUsername.value, "password": this.dataTxtPassword.value }).subscribe((res: any) => {
          console.log(res);
          this.clear();
        });
      }
    })
  }

  clear = () => {
    this.txtFindUsername.value = null;
    this.dataTxtUsername.value = null;
    this.dataTxtPassword.value = null;
  }
}
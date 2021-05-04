import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit {

    constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) { }

    allUsers: any[] = [];
    users: any[] = [];

    action: string = '';

    countTxtUsername: number = 0;

    ngAfterViewInit(): void {
    }

    ngOnInit(): void {
        this.http.post(`http://127.0.0.1:8000/testLogin`, { 'token': sessionStorage.getItem('token') }).subscribe((res: any) => {
            if (res.ok) {
                if (res.role.some((value: any) => value === 'ROLE_ADMIN')) {
                    this.getUsers();

                    const txtFindUsername = document.getElementById('find-username') as HTMLInputElement;

                    document.getElementById('btnFilter')?.addEventListener('click', () => {
                        const elem = document.getElementById('find-section');
                        if (elem !== null) {
                            if (elem.style.display === 'none' || elem.style.display == '') {
                                elem.style.display = 'block';
                            } else {
                                elem.style.display = 'none';
                            }
                        }
                    })

                    document.getElementById('btn-find')?.addEventListener('click', () => {
                        const check = document.getElementById('find-checkbox') as HTMLInputElement;
                        if (txtFindUsername.value.length > 0) {
                            if (check.checked) this.users = this.allUsers.filter((elem: any) => elem.username === txtFindUsername.value);
                            else this.users = this.allUsers.filter((elem: any) => elem.username.includes(txtFindUsername.value));
                        } else {
                            //alert txtFindUsername vacio
                        }
                    });

                    document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
                        txtFindUsername.value = '';
                        if (this.users !== this.allUsers) {
                            this.users = this.allUsers;
                        }
                    })

                    document.getElementById('btnAddUser')?.addEventListener('click', () => {
                        const elem = document.getElementById('create-section');
                        if (elem !== null) {
                            if (elem.style.display === 'none' || elem.style.display == '') {
                                elem.style.display = 'block';
                            } else {
                                elem.style.display = 'none';
                            }
                        }
                    });

                    const txtUsername = document.getElementById('txt-add-username') as HTMLInputElement;

                    txtUsername?.addEventListener('input', () => {
                        this.countTxtUsername++;
                        const num = this.countTxtUsername;
                        const btnConfirm = document.getElementById('btn-create-user') as HTMLButtonElement;
                        btnConfirm.setAttribute('disabled', '');
                        setTimeout(() => {
                            btnConfirm.setAttribute('disabled', '');
                            if (num === this.countTxtUsername) {
                                if (this.allUsers.some((elem: any) => elem.username == txtUsername.value)) {
                                } else {
                                    btnConfirm.removeAttribute('disabled');
                                }
                            }
                        }, 500)
                    })

                    document.getElementById('btn-create-user')?.addEventListener('click', () => {
                        const txtPassword = document.getElementById('txt-add-password') as HTMLInputElement;
                        const txtConfirm = document.getElementById('txt-confirm-password') as HTMLInputElement;
                        const toast = document.getElementById('myToast-add-user') as HTMLDivElement;
                        const toastText = document.getElementById('toastText') as HTMLParagraphElement;
                        if (txtUsername.value.length > 0 && txtPassword.value.length > 0) {
                            if (txtConfirm.value === txtPassword.value) {
                                const spiner = document.getElementById('spinner-add-user') as HTMLDivElement;
                                spiner.style.display = 'block';
                                this.http.post('http://127.0.0.1:8000/addUser', { "username": txtUsername.value, "password": txtPassword.value, 'token': sessionStorage.getItem('token') }).subscribe((res: any) => {
                                    spiner.style.display = 'none';
                                    if (res.created) {
                                        txtUsername.value = '';
                                        txtPassword.value = '';
                                        txtConfirm.value = '';
                                        toast.style.display = 'block';
                                        toastText.textContent = 'Usuario creado';
                                        txtUsername.value = '';
                                        this.getUsers();
                                    } else {
                                        toast.style.display = 'block';
                                        toastText.textContent = 'El usuario ya existe';
                                        txtUsername.value = '';
                                    }
                                }, () => {
                                    this.router.navigate(['/login']);
                                });
                            } else {
                                toast.style.display = 'block';
                                toastText.textContent = 'Las contraseñas no coinciden';
                                txtPassword.value = '';
                                txtConfirm.value = '';
                            }
                        } else {
                            toast.style.display = 'block';
                            toastText.textContent = 'Usuario o contraseña incompletos';
                        }
                    })

                    document.getElementById('btn-toast-create-user-ok')?.addEventListener('click', () => {
                        const toast = document.getElementById('myToast-add-user') as HTMLDivElement;
                        toast.style.display = 'none';
                    })

                    document.getElementById('btn-back')?.addEventListener('click', () => {
                        this.router.navigate(['/home'])
                    })

                    document.getElementById('btn-logout')?.addEventListener('click', this.logout)
                } else {
                    sessionStorage.setItem('error', '403');
                    this.router.navigate(['/home']);
                }
            } else {
                sessionStorage.setItem('error', '401');
                this.router.navigate(['/login']);
            }
        }, (err) => {
            sessionStorage.setItem('error', err.status);
            this.router.navigate(['/login']);
        })
    }

    getUsers = () => {
        const spinner = document.getElementById('spinner') as HTMLDivElement;
        if (spinner.style.display !== 'block') spinner.style.display = 'block';
        this.http.get(`http://127.0.0.1:8000/getUsers/${sessionStorage.getItem('token')}`).subscribe((res: any) => {
            spinner.style.display = 'none';
            this.users = [];
            res.filter((v: any) =>
                !v.role.some((value: any) => value === 'ROLE_ADMIN'))
                .map((elem: any) =>
                    this.users.push({ 'username': elem.username }))

            this.users = this.users.sort((a: any, b: any) => a.username.localeCompare(b.username)).map((elem: any) => elem);

            this.allUsers = this.users;
        }, (err) => {
            sessionStorage.setItem('error', err.status);
            this.router.navigate(['/login']);
        });
    }

    loadInfPage = (username: any) => {
        this.router.navigate([`/admin/${username}`])
    }

    logout = () => {
        this.http.post(`http://127.0.0.1:8000/logout`, { 'token': sessionStorage.getItem('token') }).subscribe(() => { });
        this.router.navigate(['/login']);
    }
}
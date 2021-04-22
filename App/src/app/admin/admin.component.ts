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

    users: any[] = [];

    action: string = '';

    ngAfterViewInit(): void {
    }

    ngOnInit(): void {
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
            if (txtFindUsername.value.length > 0) {
                this.findUser(txtFindUsername.value);
            } else {
                //alert txtFindUsername vacio
            }
        });

        document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
            txtFindUsername.value = '';
            if (this.users.length <= 1) {
                this.getUsers();
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

        document.getElementById('btn-create-user')?.addEventListener('click', () => {
            const txtUsername = document.getElementById('txt-add-username') as HTMLInputElement;
            const txtPassword = document.getElementById('txt-add-password') as HTMLInputElement;
            if (txtUsername.value.length > 0 && txtPassword.value.length > 0) {
                this.http.post('http://127.0.0.1:8000/addUser', { "username": txtUsername.value, "password": txtPassword.value }).subscribe((res: any) => {
                    console.log(res);
                    txtUsername.value = '';
                    txtPassword.value = '';
                    this.getUsers();
                });
            }
        })
    }

    getUsers = () => {
        const spiner = document.getElementById('spinner') as HTMLDivElement;
        spiner.style.display = 'block';
        this.http.get('http://127.0.0.1:8000/getUsers').subscribe((res: any) => {
            spiner.style.display = 'none';
            console.log(spiner.style.display)
            this.users = [];
            res.filter((v: any) =>
                !v.role.some((value: any) => value === 'ROLE_ADMIN'))
                .map((elem: any) =>
                    this.users.push({ 'username': elem.username, 'show': 'show' }))
        });
    }

    findUser = (user: any) => {
        this.users = this.users.filter((elem: any) => elem.username === user);
    }

    loadInfPage = (username: any) => {
        this.router.navigate([`/admin/${username}`])
    }
}
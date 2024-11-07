import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './agregar/agregar.component'; // Asegúrate de importar el componente de edición

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirecciona la ruta raíz a '/login'
  { path: 'login', component: LoginComponent }, // Define la ruta para el componente de login
  { path: 'home', component: HomeComponent }, // Define la ruta para el componente principal
  { path: 'editar/:id', component: AgregarComponent } // Ruta para editar
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


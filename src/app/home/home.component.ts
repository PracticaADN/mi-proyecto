import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
// Define la interfaz Repuesto (opcional)
interface Repuesto {
  nombreRepuesto: string;
  estado: string; // Por ejemplo, "llegó", "pendiente", etc.
}

// Actualiza la interfaz Auto para incluir la lista de repuestos
interface Auto {
  id?: string;
  placa: string;
  marca: string;
  cliente: string;
  repuestos?: Repuesto[]; // Añadimos esta lista de repuestos
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  autos: Auto[] = []; // Todos los autos
  filteredAutos: Auto[] = []; // Autos filtrados por búsqueda
  searchText = new FormControl(''); // Control para la búsqueda
  currentPage: number = 1;
  itemsPerPage: number = 4; // Mostramos 4 autos por página

  constructor(private db: AngularFirestore, private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    // Cargar autos desde Firestore y filtrar según la búsqueda
    this.db.collection<Auto>('autos').valueChanges({ idField: 'id' }).subscribe(autos => {
      this.autos = autos;
      this.filteredAutos = this.autos;
    });

    // Reaccionar a los cambios en la búsqueda
    this.searchText.valueChanges.pipe(
      startWith(''),
      map(text => text!.toLowerCase())
    ).subscribe(searchTerm => {
      this.filteredAutos = this.autos.filter(auto =>
        auto.placa.toLowerCase().includes(searchTerm) || auto.marca.toLowerCase().includes(searchTerm)
      );
      this.currentPage = 1; // Reiniciar a la primera página tras la búsqueda
    });
  }

  // Paginación de autos
  get paginatedAutos(): Auto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAutos.slice(start, end);
  }

  // Navegación de la paginación
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Calculamos el número total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredAutos.length / this.itemsPerPage);
  }

  // Acción al hacer clic en un auto (ver detalles)
verDetalles(auto: Auto) {
  console.log("Ver detalles del auto: ", auto);
  // Aquí podrías abrir un modal o mostrar más información.
}

// Acción al hacer clic en editar ############

  editar(auto: Auto) {
  this.router.navigate(['/editar', auto.id]);
  // Aquí podrías redirigir a un formulario de edición o abrir un modal para editar los datos del auto.
  
}

// Acción al hacer clic en eliminar
eliminar(auto: Auto) {
  if (confirm("¿Estás seguro de que deseas eliminar este auto?")) {
    this.db.collection('autos').doc(auto.id).delete()
      .then(() => {
        alert("Auto eliminado correctamente");
        // Filtrar el auto eliminado de la lista local de autos
        this.autos = this.autos.filter(a => a.id !== auto.id);
        this.filteredAutos = this.filteredAutos.filter(a => a.id !== auto.id);
      })
      .catch(error => {
        console.error("Error al eliminar el auto: ", error);
      });
  }
}



  logout(){
    this.router.navigate(['/login']);
  }
}

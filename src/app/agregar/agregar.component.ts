import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

interface Repuesto {
  nombreRepuesto: string;
  estado: string;
  imagen?: File | string; // Puede ser un File o una URL de la imagen
  fechaIngreso?: string; // Nueva propiedad para la fecha de ingreso
}

interface Auto {
  id?: string;
  placa: string;
  marca: string;
  cliente: string;
  repuestos: Repuesto[];
}

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {
  autoForm: FormGroup;
  autoId?: string; // ID del auto (si existe, para el caso de edición)

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.autoForm = this.fb.group({
      placa: ['', Validators.required],
      marca: ['', Validators.required],
      cliente: ['', Validators.required],
      repuestos: this.fb.array([]) // FormArray para repuestos
    });
  }

  ngOnInit(): void {
    // Obtener el ID del auto desde la URL (si existe) y cargar los datos
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.autoId = id || undefined;
        return id ? this.firestore.collection('autos').doc<Auto>(id).valueChanges() : [];
      })
    ).subscribe(auto => {
      if (auto) {
        this.cargarDatosAuto(auto);
      }
    });
  }

  get repuestos(): FormArray {
    return this.autoForm.get('repuestos') as FormArray;
  }

  agregarRepuesto(): void {
    const repuestoGroup = this.fb.group({
      nombreRepuesto: ['', Validators.required],
      estado: ['', Validators.required],
      imagen: [null],
      fechaIngreso: [''] // Campo para la fecha de ingreso
    });
    this.repuestos.push(repuestoGroup);
  }

  eliminarRepuesto(index: number): void {
    this.repuestos.removeAt(index);
  }

  cargarDatosAuto(auto: Auto): void {
    // Cargar datos del auto en el formulario
    this.autoForm.patchValue({
      placa: auto.placa,
      marca: auto.marca,
      cliente: auto.cliente
    });

    // Cargar cada repuesto en el formulario
    this.repuestos.clear();
    auto.repuestos.forEach(repuesto => {
      const repuestoGroup = this.fb.group({
        nombreRepuesto: [repuesto.nombreRepuesto, Validators.required],
        estado: [repuesto.estado, Validators.required],
        imagen: [repuesto.imagen],
        fechaIngreso: [repuesto.fechaIngreso || ''] // Cargar la fecha de ingreso si está disponible
      });
      this.repuestos.push(repuestoGroup);
    });
  }

  async guardarAuto(): Promise<void> {
    if (this.autoForm.invalid) {
      alert('Formulario no válido, por favor revise los datos ingresados');
      return;
    }

    const autoData: Auto = this.autoForm.value;
    const repuestosConFoto = autoData.repuestos.map(async repuesto => {
      if (repuesto.imagen instanceof File) {
        const filePath = `repuestos/${Date.now()}_${repuesto.imagen.name}`;
        const fileRef = this.storage.ref(filePath);
        await this.storage.upload(filePath, repuesto.imagen);
        const url = await fileRef.getDownloadURL();
        return { ...repuesto, imagen: url };
      } else {
        return repuesto;
      }
    });

    const repuestosCompletos = await Promise.all(repuestosConFoto);

    if (this.autoId) {
      // Si existe un ID, actualizamos el auto existente
      this.firestore.collection('autos').doc(this.autoId).update({
        ...autoData,
        repuestos: repuestosCompletos
      }).then(() => {
        alert('Auto actualizado correctamente');
        this.autoForm.reset();
        this.repuestos.clear();
        this.router.navigate(['/home']); // Redirige a la lista de autos después de guardar
      }).catch(error => {
        console.error('Error al actualizar: ', error);
      });
    } else {
      // Si no existe un ID, agregamos un nuevo auto
      this.firestore.collection('autos').add({
        ...autoData,
        repuestos: repuestosCompletos
      }).then(() => {
        alert('Auto con repuestos agregado correctamente');
        this.autoForm.reset();
        this.repuestos.clear();
        this.router.navigate(['/home']); // Redirige a la lista de autos después de guardar
      }).catch(error => {
        console.error('Error al guardar: ', error);
      });
    }
  }
}

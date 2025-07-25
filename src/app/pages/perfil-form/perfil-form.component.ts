
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { Habilidade } from '../../shared/models/habilidade.interface';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { Router } from '@angular/router';
import { CadastroService } from '../../shared/services/cadastro.service';
import { Idioma } from '../../shared/models/idioma.interface';


@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ChipComponent
  ],
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss']
})
export class PerfilFormComponent implements OnInit {

  perfilForm!: FormGroup;
  fotoPreview!: string | ArrayBuffer | null;

  habilidades: Habilidade[] = [
    { nome: 'Fullstack', selecionada: false },
    { nome: 'Front-end', selecionada: false },
    { nome: 'React', selecionada: false },
    { nome: 'Angular', selecionada: false }
  ];

  niveisIdioma: string[] = [
    'Básico',
    'Intermediário',
    'Avançado',
    'Fluente',
    'Nativo'
  ];

  idiomas: string[] = [
    'Português',
    'Inglês',
    'Espanhol'
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cadastroService: CadastroService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/dados-pessoais']);
  }

  onProximo(): void {
    if (this.perfilForm.valid) {
      this.salvarDadosAtuais();
      console.log("FORM", this.perfilForm.value);

      // this.router.navigate(['/cadastro/confirmacao']);
    } else {
      this.perfilForm.markAllAsTouched();
    }
  }

  onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader;
        reader.onload = () => {
          this.fotoPreview = reader.result;
          this.perfilForm.patchValue({ foto: reader.result });
        }
        reader.readAsDataURL(file);
      }
    }
  }

  toogleHabilidade(habilidade: Habilidade): void {
    habilidade.selecionada = !habilidade.selecionada;

    const habilidadesSelecionadas = this.habilidades.filter(h => h.selecionada).map(h => h.nome);
    this.perfilForm.patchValue({ habilidadesSelecionadas })
  }

  get idiomasArray(): FormArray {
    return this.perfilForm.get('idiomas') as FormArray;
  }

  adicionarIdioma(nome: string = '', nivel: string = ''): void {
    const idiomaForm = this.fb.group({
      nome: [nome, Validators.required],
      nivel: [nivel, Validators.required]
    });
    this.idiomasArray.push(idiomaForm);
  }

  removerIdioma(index: number): void {
    if (index === 0 && this.idiomasArray.at(0).get('nome')?.value === 'Português') {
      return;
    }

    this.idiomasArray.removeAt(index);
  }


  private salvarDadosAtuais(): void {
    const formValue = this.perfilForm.value;
    this.cadastroService.updateCadastroData({
      foto: this.fotoPreview,
      resumo: formValue.resumo,
      habilidadesSelecionadas: formValue.habilidadesSelecionadas,
      idiomas: this.extrairIdiomas(),
      portifolio: formValue.portifolio,
      linkedin: formValue.linkedin
    });

    this.adicionarIdioma('Português', 'Nativoo');
  }

  private extrairIdiomas(): Idioma[] {
    return this.idiomasArray.controls.map(control => {
      return {
        nome: control.get('nome')?.value,
        nivel: control.get('nivel')?.value,
      }
    });
  }

  private inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      foto: [''],
      resumo: [''],
      habilidadesSelecionadas: [[]],
      idiomas: this.fb.array([]),
      portifolio: [''],
      linkedin: ['']
    })
  }
}

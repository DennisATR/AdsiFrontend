import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSelectDirective } from '../directivas/search-select.directive';
import { FormatoMilesDirective } from '../directivas/formato-miles.directive';
import { MultiSelectDirective } from '../directivas/multi-select.directive';
import { FormNavigationDirective } from '../directivas/form-navigation.directive';

@NgModule({
  declarations: [
    SearchSelectDirective,
    FormatoMilesDirective,
    MultiSelectDirective,
    FormNavigationDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SearchSelectDirective,
    FormatoMilesDirective,
    MultiSelectDirective,
    FormNavigationDirective
  ]
})
export class SharedDirectivesModule { }
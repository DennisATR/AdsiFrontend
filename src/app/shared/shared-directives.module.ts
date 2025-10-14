import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSelectDirective } from '../directivas/search-select.directive';
import { FormatoMilesDirective } from '../directivas/formato-miles.directive';
import { MultiSelectDirective } from '../directivas/multi-select.directive';

@NgModule({
  declarations: [
    SearchSelectDirective,
    FormatoMilesDirective,
    MultiSelectDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SearchSelectDirective,
    FormatoMilesDirective,
    MultiSelectDirective,
  ]
})
export class SharedDirectivesModule { }
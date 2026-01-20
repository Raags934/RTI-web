import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {

  transform(value: any, searchText: string): string {
    if (!value || !searchText) return value;

    const text = String(value); // ensure it's a string
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');

    return text.replace(regex, match => `<mark>${match}</mark>`);
  }
}

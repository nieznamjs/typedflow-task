import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  @Input() public size!: string | number;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {}

  public ngOnInit(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${this.size}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${this.size}px`);
  }
}

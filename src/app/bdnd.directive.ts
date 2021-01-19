import { DOCUMENT } from "@angular/common";
import {
AfterViewInit,
ContentChild,
  Directive,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: "[bdndHandle]"
})
export class BdndHandleDirective {
  constructor(public elementRef: ElementRef<HTMLElement>) {}
}

@Directive({
  selector: "[bdnd]"
})
export class BdndDirective implements AfterViewInit, OnDestroy {
  private element: HTMLElement;
  private handleElement: HTMLElement;
  private subscriptions = new Subscription();
  

  @ContentChild(BdndHandleDirective) handle: BdndHandleDirective;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.element = elementRef.nativeElement as HTMLElement;
  }

  ngAfterViewInit() {
    this.handleElement = this.handle?.elementRef?.nativeElement || this.element;
    this.initDrag();
  }

  ngOnDestroy() {}

  initDrag() {
    const dragStart$ = fromEvent<MouseEvent>(this.handleElement, "mousedown");
    const dragEnd$ = fromEvent<MouseEvent>(this.element, "mouseup");
    const drag$ = fromEvent<MouseEvent>(this.element, "mousemove").pipe(
      takeUntil(dragEnd$)
    );

    let initialX: number,
      initialY: number,
      currentX = 0,
      currentY = 0;

    let dragSub: Subscription;

    // 3
    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
      initialX = event.clientX - currentX;
      initialY = event.clientY - currentY;
      this.element.classList.add("free-dragging");

      // 4
      dragSub = drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();

        currentX = event.clientX - initialX;
        currentY = event.clientY - initialY;

        this.element.style.transform =
          "translate3d(" + currentX + "px, " + currentY + "px, 0)";
      });
    });

    // 5
    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;
      initialY = currentY;
      this.element.classList.remove("free-dragging");
      if (dragSub) {
        dragSub.unsubscribe();
      }
    });

    // 6
    this.subscriptions
      .add(dragStartSub)
      .add(dragSub)
      .add(dragEndSub);
  }
}

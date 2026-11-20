import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountEditor, openMentionBubble} from './support.js';

const bubble = (): HTMLElement => document.querySelector<HTMLElement>('.mzre-mentions-dropdown')!;

/** Gives the writing area a position the test can move, as a scrolling page would. */
function placeEditor(content: HTMLElement, top: number): {moveTo: (top: number) => void} {
  let current = top;

  content.getBoundingClientRect = () =>
    ({top: current, bottom: current + 100, left: 40, right: 440, width: 400, height: 100, x: 40, y: current, toJSON() {}}) as DOMRect;

  return {moveTo: (next) => { current = next; }};
}

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

describe('mention bubble position', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('follows the writing area when the page scrolls', async () => {
    const content = mountEditor();
    const editor = placeEditor(content, 200);
    await openMentionBubble(content);
    expect(bubble().style.top).toBe('304px');

    editor.moveTo(120);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    expect(bubble().style.top).toBe('224px');
  });

  it('also follows when a scrolling container (a modal, a panel) moves the writing area', async () => {
    const content = mountEditor();
    const editor = placeEditor(content, 200);
    await openMentionBubble(content);

    editor.moveTo(50);
    // `scroll` does not bubble: the editor listens in the capture phase of the window.
    content.parentElement!.dispatchEvent(new Event('scroll'));
    await nextFrame();

    expect(bubble().style.top).toBe('154px');
  });

  it('follows a resize of the window', async () => {
    const content = mountEditor();
    const editor = placeEditor(content, 200);
    await openMentionBubble(content);

    editor.moveTo(260);
    window.dispatchEvent(new Event('resize'));
    await nextFrame();

    expect(bubble().style.top).toBe('364px');
  });

  it('hides while the writing area is out of the viewport, and shows again when it comes back', async () => {
    const content = mountEditor();
    const editor = placeEditor(content, 200);
    await openMentionBubble(content);

    editor.moveTo(-400);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(bubble().style.visibility).toBe('hidden');

    editor.moveTo(150);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(bubble().style.visibility).toBe('');
  });

  it('stops listening to the page once the bubble is closed', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const content = mountEditor();
    placeEditor(content, 200);
    await openMentionBubble(content);

    document.querySelector<HTMLButtonElement>('.mzre-mentions-close')!.click();

    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['scroll', 'resize']));
  });
});

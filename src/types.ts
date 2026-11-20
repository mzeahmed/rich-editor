import type {EditorMessages} from './messages.js';

export interface EditorUser {
  ID: string | number;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  profileUrl: string;
}

export interface EditorLoader {
  freezeElement(element: HTMLElement): void;
  unfreezeElement(): void;
}

export interface EmojiPickerOptions {
  onSelect(emoji: string): void;
  title?: string;
  closeLabel?: string;
}

export interface EditorMentionIntegration {
  loader: EditorLoader;
  searchUsers(term: string): Promise<EditorUser[]>;
  encodeUserId(id: string): string;
  debounce(
    callback: (...args: any[]) => void,
    delay: number
  ): (...args: any[]) => void;
}

export interface EditorIntegrations {
  /** Overrides some interface texts (see EditorMessages); the language is set through `locale`. */
  messages?: Partial<EditorMessages>;
  mentions?: EditorMentionIntegration;
}

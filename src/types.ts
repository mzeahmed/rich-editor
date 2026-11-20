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

/**
 * Colors of the mention bubble and of the mention link, set when the editor is mounted. Any CSS
 * color (`#0f9d7a`, `rgb(…)`, `hsl(…)`, a named color or `var(--brand)`). What is not given keeps its
 * default (or the value of the matching `--mzre-mention-*` CSS variable of your page).
 */
export interface MentionColors {
  /** Name, avatar border and outline of the hovered or chosen user in the bubble. */
  active?: string;
  /** Background of the hovered or chosen user. */
  activeBackground?: string;
  /** Border of the hovered or chosen user, and keyboard focus ring. */
  activeBorder?: string;
  /** Text color of the mention link in the editor. */
  link?: string;
  /** Background of the mention link. */
  linkBackground?: string;
  /** Border of the mention link. */
  linkBorder?: string;
  /** Background of the mention link on hover. */
  linkHoverBackground?: string;
  /** Border of the mention link on hover. */
  linkHoverBorder?: string;
}

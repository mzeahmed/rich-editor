/**
 * Interface texts of the editor. English by default; French is provided. Each text
 * can be overridden (`integrations.messages`) and another language is set with `setEditorLocale()`
 * or the `locale` option.
 *
 * The language is a page-wide setting: the last `init()`/`mount()`/`setEditorLocale()`
 * wins, for all editors and for the emoji picker.
 */

export type EditorLocale = 'en' | 'fr';

export interface EditorMessages {
  toggleToolbar: string;
  formatting: string;
  textStyle: string;
  paragraph: string;
  heading: string;
  subheading: string;
  quote: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  bulletList: string;
  numberedList: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  insertLink: string;
  clearFormatting: string;
  undo: string;
  redo: string;
  insert: string;
  remove: string;
  placeholder: string;
  character: string;
  characters: string;
  html: string;
  clear: string;
  copyContent: string;
  clearConfirm: string;
  copied: string;
  addEmoji: string;
  chooseEmoji: string;
  close: string;
  noUserFound: string;
  mentionSuggestions: string;
  /** `{count}` is replaced by the number of suggestions. */
  mentionResultsOne: string;
  mentionResultsMany: string;
  emojiCategories: string;
  emojiLoading: string;
  emojiLoadError: string;
}

export const messagesEn: EditorMessages = {
  toggleToolbar: 'Show / hide the toolbar',
  formatting: 'Formatting',
  textStyle: 'Text style',
  paragraph: 'Paragraph',
  heading: 'Heading',
  subheading: 'Subheading',
  quote: 'Quote',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  bulletList: 'Bulleted list',
  numberedList: 'Numbered list',
  alignLeft: 'Align left',
  alignCenter: 'Center',
  alignRight: 'Align right',
  insertLink: 'Insert a link',
  clearFormatting: 'Clear formatting',
  undo: 'Undo',
  redo: 'Redo',
  insert: 'Insert',
  remove: 'Remove',
  placeholder: 'Write here…',
  character: 'character',
  characters: 'characters',
  html: 'HTML',
  clear: 'Clear',
  copyContent: 'Copy content',
  clearConfirm: 'Clear all content?',
  copied: 'Copied ✓',
  addEmoji: 'Add an emoji',
  chooseEmoji: 'Choose an emoji',
  close: 'Close',
  noUserFound: 'No user found',
  mentionSuggestions: 'Mention suggestions',
  mentionResultsOne: '1 suggestion available. Use the up and down arrow keys to choose, then Enter to insert.',
  mentionResultsMany: '{count} suggestions available. Use the up and down arrow keys to choose, then Enter to insert.',
  emojiCategories: 'Emoji categories',
  emojiLoading: 'Loading emojis…',
  emojiLoadError: 'Could not load the emojis. Close and reopen the picker.'
};

export const messagesFr: EditorMessages = {
  toggleToolbar: "Afficher / masquer la barre d'outils",
  formatting: 'Mise en forme',
  textStyle: 'Style du texte',
  paragraph: 'Paragraphe',
  heading: 'Titre',
  subheading: 'Sous-titre',
  quote: 'Citation',
  bold: 'Gras',
  italic: 'Italique',
  underline: 'Souligné',
  strikethrough: 'Barré',
  bulletList: 'Liste à puces',
  numberedList: 'Liste numérotée',
  alignLeft: 'Aligner à gauche',
  alignCenter: 'Centrer',
  alignRight: 'Aligner à droite',
  insertLink: 'Insérer un lien',
  clearFormatting: 'Effacer la mise en forme',
  undo: 'Annuler',
  redo: 'Rétablir',
  insert: 'Insérer',
  remove: 'Supprimer',
  placeholder: 'Écrivez ici…',
  character: 'caractère',
  characters: 'caractères',
  html: 'HTML',
  clear: 'Effacer',
  copyContent: 'Copier le contenu',
  clearConfirm: 'Effacer tout le contenu ?',
  copied: 'Copié ✓',
  addEmoji: 'Ajouter un emoji',
  chooseEmoji: 'Choisir un emoji',
  close: 'Fermer',
  noUserFound: 'Aucun utilisateur trouvé',
  mentionSuggestions: 'Suggestions de mention',
  mentionResultsOne: '1 suggestion disponible. Utilisez les flèches haut et bas pour choisir, puis Entrée pour insérer.',
  mentionResultsMany: '{count} suggestions disponibles. Utilisez les flèches haut et bas pour choisir, puis Entrée pour insérer.',
  emojiCategories: "Catégories d'emojis",
  emojiLoading: 'Chargement des emojis…',
  emojiLoadError: 'Impossible de charger les emojis. Fermez puis rouvrez le sélecteur.'
};

const CATALOGS: Record<EditorLocale, EditorMessages> = {en: messagesEn, fr: messagesFr};

let currentLocale: EditorLocale = 'en';
let overrides: Partial<EditorMessages> = {};

/** Language of the interface and of the emoji data (`en` by default). An unknown value is ignored. */
export function setEditorLocale (locale: EditorLocale): void {
  if (locale in CATALOGS) currentLocale = locale;
}

/** Overrides some texts, whatever the language; `undefined` or `{}` removes the overrides. */
export function setEditorMessages (messages: Partial<EditorMessages> | undefined): void {
  overrides = {...messages};
}

export function getEditorLocale (): EditorLocale {
  return currentLocale;
}

/** Plain text (to be escaped before inserting it into HTML). */
export function message (key: keyof EditorMessages): string {
  return overrides[key] ?? CATALOGS[currentLocale][key];
}

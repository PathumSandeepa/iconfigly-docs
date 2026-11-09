export interface SiteLinks {
  readonly console: string;
  readonly docs: string;
  readonly api: string;
  readonly web: string;
}

export interface SiteAuthor {
  readonly name: string;
  readonly role: string;
}

export interface SiteProfile {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly author: SiteAuthor;
  readonly links: SiteLinks;
}

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface Bio {
  name: string;
  title: string;
  tagline: string;
  description: string;
  socialLinks: SocialLink[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  links?: {
    github?: string;
    live?: string;
    demo?: string;
  };
}

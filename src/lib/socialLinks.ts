import {
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
  type Icon,
} from '@phosphor-icons/react';

export type SocialLink = {
  label: string;
  href: string;
  icon: Icon;
};

/** External profile URLs — update handles here when they change. */
export const socialLinks: SocialLink[] = [
  {
    label: 'PreIPOKart on LinkedIn',
    href: 'https://www.linkedin.com/company/preipokart',
    icon: LinkedinLogo,
  },
  {
    label: 'PreIPOKart on Instagram',
    href: 'https://www.instagram.com/preipokart',
    icon: InstagramLogo,
  },
  {
    label: 'PreIPOKart on X',
    href: 'https://x.com/preipokart',
    icon: XLogo,
  },
  {
    label: 'PreIPOKart on YouTube',
    href: 'https://www.youtube.com/@preipokart',
    icon: YoutubeLogo,
  },
];

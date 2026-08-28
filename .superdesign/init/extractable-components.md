# Extractable components

## SiteHeader
- Source: `src/components/PublicLayout.tsx` (`SiteHeader`)
- Category: layout
- Description: Sticky marketing nav with LetterMark lockup, section links, Log in, Open account, mobile menu
- Extractable props: activeItem (string, default: "home")
- Hardcoded: LetterMark P box, PreIPOKart wordmark, How it works / Companies / IPOs / Blog / News / FAQ / Contact us labels, Log in, Open account, Phosphor List/X/ArrowRight icons, all CSS

## SiteFooter
- Source: `src/components/PublicLayout.tsx` (`SiteFooter`)
- Category: layout
- Description: Marketing footer with lockup, disclaimer, Explore / Support / Policies columns
- Extractable props: none required
- Hardcoded: LetterMark, PreIPOKart wordmark, disclaimer copy, column labels and links, copyright, all CSS

## LetterMark
- Source: `src/components/ui.tsx`
- Category: basic
- Description: First-letter cobalt box used as the product mark (no SVG logo in the repo)
- Extractable props: label (string, default: "PreIPOKart"), size (string, default: "sm")
- Hardcoded: rounded-lg cobalt container, letter derivation, all CSS

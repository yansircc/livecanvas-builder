export const PROMPT = `
Generate clean, semantic HTML using Bootstrap 5. Your code will be displayed in a web app.

### Requirements:

1. **Complete HTML** with Bootstrap 5 classes
2. **Realistic content** - no placeholders
3. **Start with a container** (section, div, article)
4. **Include Lucide icons**: \`<i class="lucide-[icon-name]"></i>\` if needed
5. **Add AOS animations**: \`data-aos="fade-up" data-aos-duration="1000"\` if needed
6. **Use image placeholders**: "/images/placeholder/1.svg" to "/images/placeholder/6.svg" if needed
7. **Image Sizing**: Use 'cover' size, adapt to 'fill' if needed.

### Styling:

- Use Bootstrap grid and components
- Apply utility classes for spacing and alignment
- Keep markup clean and semantic
- Match content to user's request

### Icon Usage:

- Style icon element, not SVG: \`<i class="lucide-check" style="font-size: 0.8em;"></i>\`
- Icons scale with font-size
- Control size with rem, em, px, or Bootstrap classes

### Animation:

- Add AOS animations: \`data-aos="fade-up"\`
- Add delay: \`data-aos-delay="300"\`
- Use fade, zoom, slide, flip animations

### Notes:

- Generate complete, self-contained HTML
- Use realistic content
- Include Lucide icons
- Style icon container, not SVG
- Add AOS animations
- Ensure HTML is valid and responsive

Ensure HTML is complete and in English.
`;

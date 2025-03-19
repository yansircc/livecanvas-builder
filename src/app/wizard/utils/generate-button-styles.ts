import type { ButtonRadius, ButtonStyle } from '../types'

/**
 * Generate CSS for custom button styles based on the selected style type
 */
export function generateButtonStyleCSS(
  style: ButtonStyle,
  primaryColor: string,
  secondaryColor: string,
  buttonRadius?: ButtonRadius,
): string {
  // Determine button radius based on selection
  let radius = 'var(--radius)'
  if (buttonRadius) {
    switch (buttonRadius) {
      case 'none':
        radius = '0'
        break
      case 'full':
        radius = '9999px'
        break
      case 'sm':
        radius = 'var(--radius-sm)'
        break
      default:
        radius = 'var(--radius)'
    }
  }

  let primaryButtonCSS = ''
  let secondaryButtonCSS = ''
  let ghostButtonCSS = ''

  // Primary button style
  switch (style) {
    case 'default':
      primaryButtonCSS = `
/* Default solid button style */
.btn-custom {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.btn-custom:hover {
  background-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-custom:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom:active {
  transform: translateY(1px);
  background-color: var(--primary-700);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.1) inset;
}`
      break

    case 'gradient':
      primaryButtonCSS = `
/* Gradient button style */
.btn-custom {
  background-image: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  background-color: transparent;
  color: var(--color-primary-foreground);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  cursor: pointer;
}
.btn-custom:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
.btn-custom:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom:active {
  opacity: 0.8;
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}`
      break

    case '3d':
      primaryButtonCSS = `
/* 3D button style */
.btn-custom {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 1px solid var(--primary-700);
  box-shadow: var(--primary-700) 2px 2px 0 0;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  position: relative;
  top: 0;
  cursor: pointer;
}
.btn-custom:hover {
  top: 2px;
  box-shadow: var(--primary-700) 1px 1px 0 0;
}
.btn-custom:focus-visible {
  outline: none;
  box-shadow: var(--primary-700) 3px 3px 0 0, 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 3px var(--primary-300);
}
.btn-custom:active {
  top: 3px;
  box-shadow: var(--primary-700) 1px 1px 0 0;
}`
      break

    default:
      primaryButtonCSS = ''
  }

  // Secondary button style (outline-like style regardless of primary style)
  switch (style) {
    case 'default':
      secondaryButtonCSS = `
/* Secondary button style */
.btn-custom-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
}
.btn-custom-secondary:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.btn-custom-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom-secondary:active {
  transform: translateY(1px);
  background-color: var(--primary-100);
  box-shadow: none;
}`
      break

    case 'gradient':
      secondaryButtonCSS = `
/* Secondary button style with gradient border */
.btn-custom-secondary {
  background-color: transparent;
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  border: 1px solid transparent;
  background-image: linear-gradient(${radius}, white, white), linear-gradient(to right, var(--color-primary), var(--color-secondary));
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.btn-custom-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.btn-custom-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom-secondary:active {
  transform: translateY(1px);
  box-shadow: none;
}`
      break

    case '3d':
      secondaryButtonCSS = `
/* 3D Secondary button style */
.btn-custom-secondary {
  background-color: white;
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  border: 2px solid var(--color-primary);
  box-shadow: var(--color-primary) 2px 2px 0 0;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  position: relative;
  top: 0;
  cursor: pointer;
}
.btn-custom-secondary:hover {
  top: 2px;
  box-shadow: var(--color-primary) 1px 1px 0 0;
}
.btn-custom-secondary:focus-visible {
  outline: none;
  box-shadow: var(--color-primary) 2px 2px 0 0, 0 0 0 3px var(--primary-300);
}
.btn-custom-secondary:active {
  top: 3px;
  box-shadow: var(--color-primary) 1px 1px 0 0;
}`
      break

    default:
      secondaryButtonCSS = `
/* Secondary button style */
.btn-custom-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
}
.btn-custom-secondary:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
}
.btn-custom-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom-secondary:active {
  transform: translateY(1px);
}`
  }

  // Ghost button style
  switch (style) {
    case 'default':
    case 'gradient':
      ghostButtonCSS = `
/* Ghost button style */
.btn-custom-ghost {
  background-color: transparent;
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
}
.btn-custom-ghost:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
}
.btn-custom-ghost:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom-ghost:active {
  transform: translateY(1px);
  background-color: var(--primary-100);
}`
      break

    case '3d':
      ghostButtonCSS = `
/* 3D Ghost button style */
.btn-custom-ghost {
  background-color: transparent;
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  border: 2px dashed var(--color-primary);
  box-shadow: var(--color-primary) 2px 2px 0 0;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  position: relative;
  top: 0;
  cursor: pointer;
}
.btn-custom-ghost:hover {
  top: 2px;
  box-shadow: var(--color-primary) 1px 1px 0 0;
}
.btn-custom-ghost:focus-visible {
  outline: none;
  box-shadow: var(--color-primary) 2px 2px 0 0, 0 0 0 3px var(--primary-300);
}
.btn-custom-ghost:active {
  top: 3px;
  box-shadow: var(--color-primary) 1px 1px 0 0;
}`
      break

    default:
      ghostButtonCSS = `
/* Ghost button style */
.btn-custom-ghost {
  background-color: transparent;
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: ${radius};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
}
.btn-custom-ghost:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
}
.btn-custom-ghost:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-300);
}
.btn-custom-ghost:active {
  transform: translateY(1px);
  background-color: var(--primary-100);
}`
  }

  return `${primaryButtonCSS}

${secondaryButtonCSS}

${ghostButtonCSS}`
}

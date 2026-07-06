# Form Elements Specification

## Purpose
Dropdown/Select, Tabs, and Toggle Group components. Apex tokens, keyboard navigation, focus management, portal positioning.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| FEL-01 | Dropdown/Select: trigger button opens a portal-positioned menu list. Items support `onSelect` callback, keyboard nav (Arrow, Enter, Escape), focus trap within open menu | P0 | MUST |
| FEL-02 | Select: single-value selection variant. Selected item highlighted with `--color-brand` indicator. `value` + `onChange` controlled props | P0 | MUST |
| FEL-03 | Menu: generic list variant without selection state. Items can be links, actions, or dividers | P1 | SHOULD |
| FEL-04 | Tabs: horizontal tab list with `value` + `onChange`. Active tab indicated by brand underline (2px, `--color-brand`). Tab panels rendered via `children` or content association | P0 | MUST |
| FEL-05 | Toggle Group: multi-select toggle buttons. Each toggle has `value`, group has `values[]` + `onValuesChange`. Selected toggles use `--color-brand-container` bg | P1 | SHOULD |
| FEL-06 | Portal: dropdown menus render in a portal to escape overflow clipping | P0 | MUST |
| FEL-07 | Dark/light: menus use `--color-surface-elevated-2`, tabs use surface base, both modes via Apex tokens | P0 | MUST |
| FEL-08 | Typography: item labels in Geist 400, tab labels in Switzer 500, no em-dashes | P0 | MUST |
| FEL-09 | Focus visible: all interactive elements show 2px brand ring on keyboard focus | P0 | MUST |
| FEL-10 | Reduced motion: instant state changes under `prefers-reduced-motion` | P0 | MUST |

### Scenario: Select opens menu and selects item
- GIVEN `<Select value="js" onChange={fn} items={['js','ts','go']} />`
- WHEN user clicks the trigger
- THEN a portal-positioned menu opens below the trigger
- AND clicking "ts" calls `onChange("ts")` and closes the menu
- AND the trigger now displays "ts"

### Scenario: Tabs switch panel content
- GIVEN `<Tabs value="code" onChange={fn}><Tab value="code">Code</Tab><Tab value="preview">Preview</Tab></Tabs>`
- WHEN user clicks "Preview" tab
- THEN `onChange("preview")` fires
- AND a 2px underline in `--color-brand` appears under "Preview"
- AND keyboard Arrow keys navigate between tabs

### Scenario: Toggle Group multi-select
- GIVEN `<ToggleGroup values={['react']} onValuesChange={fn}><Toggle value="react">React</Toggle><Toggle value="vue">Vue</Toggle></ToggleGroup>`
- WHEN user clicks "Vue"
- THEN `onValuesChange(['react', 'vue'])` fires
- AND both toggles show `--color-brand-container` background

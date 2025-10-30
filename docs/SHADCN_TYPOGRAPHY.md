# Official shadcn/ui Typography Patterns

## Overview
shadcn/ui does NOT provide custom typography components. Instead, it uses native HTML elements with Tailwind CSS utility classes.

## Official Typography Classes

### Headings

```tsx
// H1
<h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
  Heading 1
</h1>

// H2
<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
  Heading 2
</h2>

// H3
<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
  Heading 3
</h3>

// H4
<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
  Heading 4
</h4>
```

### Body Text

```tsx
// Paragraph
<p className="leading-7 [&:not(:first-child)]:mt-6">
  Body text
</p>

// Lead text (larger intro paragraph)
<p className="text-xl text-muted-foreground">
  Lead paragraph text
</p>

// Muted text
<p className="text-sm text-muted-foreground">
  Muted or secondary text
</p>

// Large text
<div className="text-lg font-semibold">
  Large text
</div>

// Small text
<small className="text-sm font-medium leading-none">
  Small text
</small>
```

### Lists

```tsx
// Unordered list
<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// Ordered list
<ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
  <li>First item</li>
  <li>Second item</li>
</ol>
```

### Inline Elements

```tsx
// Code
<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
  code
</code>

// Blockquote
<blockquote className="mt-6 border-l-2 pl-6 italic">
  Quote text
</blockquote>
```

## Official shadcn/ui Components

Use these official components from shadcn/ui:

- `<Button />` - from `@/components/ui/button`
- `<Input />` - from `@/components/ui/input`
- `<Label />` - from `@/components/ui/label`
- `<Textarea />` - from `@/components/ui/textarea`
- `<Select />` - from `@/components/ui/select`
- `<Form />` - from `@/components/ui/form`
- `<Card />` - from `@/components/ui/card`
- `<Dialog />` - from `@/components/ui/dialog`
- `<Dropdown />` - from `@/components/ui/dropdown-menu`
- `<Tabs />` - from `@/components/ui/tabs`
- `<Avatar />` - from `@/components/ui/avatar`
- `<Badge />` - from `@/components/ui/badge`
- `<Separator />` - from `@/components/ui/separator`

## References

- [shadcn/ui Typography Documentation](https://ui.shadcn.com/docs/components/typography)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)

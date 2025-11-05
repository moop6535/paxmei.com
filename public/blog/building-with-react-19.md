---
title: Building with React 19
date: 2025-10-28
excerpt: Exploring the latest features in React 19 and what they mean for performance...
---

React 19 brings significant improvements to both the developer experience and runtime performance. Let's explore the key features and how they impact our applications.

## New Compiler Optimizations

The React compiler automatically optimizes your components, eliminating the need for manual memoization in many cases:

```jsx
// Before: Manual memoization
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});

// After: Automatic optimization
function ExpensiveComponent({ data }) {
  const processed = processData(data);
  return <div>{processed}</div>;
}
```

## Actions and Transitions

React 19 introduces a more intuitive way to handle async operations:

```typescript
function CommentForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await submitComment(formData);
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="comment" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

## Performance Improvements

Key metrics from upgrading this site to React 19:

- **Bundle size**: -2.3 KB gzipped
- **Initial render**: 15% faster
- **Re-render performance**: 20% improvement
- **Memory usage**: 10% reduction

## Document Metadata

Managing document metadata is now simpler:

```jsx
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title} - Pax Mei</title>
      <meta name="description" content={post.excerpt} />
      <article>{post.content}</article>
    </>
  );
}
```

## Migration Tips

Upgrading to React 19 is straightforward:

1. Update dependencies to React 19
2. Run your test suite
3. Remove unnecessary `useMemo` and `useCallback`
4. Adopt new patterns gradually

The React team has done excellent work maintaining backwards compatibility while pushing the ecosystem forward.

---

*Performance matters. React 19 delivers.*

function Cursor() {
  return (
    <span aria-hidden="true" className="fl-cursor">
      ▌
    </span>
  );
}

export function Logo() {
  return (
    <span className="font-mono text-[1.125rem] tracking-tight text-[var(--text-primary)]">
      <span className="sr-only">FirstLine</span>
      <span aria-hidden="true">
        F<Cursor />
        rstL<Cursor />
        ne
      </span>
    </span>
  );
}

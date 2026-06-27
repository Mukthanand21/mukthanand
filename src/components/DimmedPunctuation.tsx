export function DimmedPunctuation({ children }: { children: string }) {
  if (typeof children !== 'string') return <>{children}</>;
  
  // Split by punctuation marks common in code/versions
  const parts = children.split(/([./:_-])/g);
  
  return (
    <>
      {parts.map((part, i) =>
        /^[./:_-]$/.test(part) ? (
          <span key={i} className="opacity-40">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

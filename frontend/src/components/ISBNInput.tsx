type ISBNInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ISBNInput({
  value,
  onChange,
  onSubmit,
}: ISBNInputProps) {
  return (
    <form onSubmit={onSubmit} style={{ margin: "1rem 0" }}>
      <input
        type="text"
        placeholder="Enter ISBN manually"
        value={value}
        onChange={onChange}
        style={{ fontSize: "1rem", padding: "0.5rem" }}
      />
      <button type="submit" style={{ marginLeft: "0.5rem" }}>
        Lookup
      </button>
    </form>
  );
}
